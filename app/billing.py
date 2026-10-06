"""Stripe Checkout and signed webhooks. Never activate access from a redirect."""
import hashlib
import hmac
import json
import os
import time
from urllib.parse import urlsplit
import requests
from fastapi import HTTPException
from pydantic import BaseModel
from app.accounts import database, authenticate, PLANS, configured, DevConnection

class CheckoutInput(BaseModel):
    plan: str


def enabled():
    return configured() and all(os.getenv(key) for key in ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','PUBLIC_APP_URL'])


def stripe_request(method, path, data=None):
    key = os.getenv('STRIPE_SECRET_KEY')
    if not key: raise HTTPException(503,'Subscriptions are not available yet.')
    try:
        response = requests.request(method,'https://api.stripe.com/v1/'+path,auth=(key,''),
            headers={'Stripe-Version':'2025-06-30.basil', **({'Idempotency-Key': hashlib.sha256((str(data.get('customer')) + str(data.get('line_items[0][price_data][unit_amount]')) + str(time.time_ns())).encode()).hexdigest()} if path=='checkout/sessions' and data else {})},data=data if method=='POST' else None,params=data if method=='GET' else None,timeout=(3,12))
        response.raise_for_status()
        return response.json()
    except (requests.RequestException,ValueError): raise HTTPException(502,'The payment service is unavailable. Please try again.')


def app_url():
    value = os.getenv('PUBLIC_APP_URL','').rstrip('/')
    if urlsplit(value).scheme != 'https' or not urlsplit(value).hostname: raise HTTPException(503,'Subscriptions are not available yet.')
    return value


def checkout(token,plan):
    if not enabled(): raise HTTPException(503,'Paid plans are opening soon.')
    if plan not in {'starter','plus'}: raise HTTPException(422,'Choose a valid plan.')
    with database() as conn:
        user = authenticate(token,conn,lock=True)
        if user['subscription']: raise HTTPException(409,'Manage your existing subscription before changing plans.')
        if not user['customer']:
            customer = stripe_request('POST','customers',{'email':user['email'],'metadata[buywise_user_id]':user['id']})
            conn.execute('UPDATE bw_users SET customer=%s WHERE id=%s',(customer['id'],user['id']))
            user['customer']=customer['id']
        if user.get('checkout_session'):
            previous = stripe_request('GET','checkout/sessions/'+user['checkout_session'])
            if previous.get('status') == 'open':
                if previous.get('metadata',{}).get('buywise_plan',plan) == plan: return {'url':previous['url']}
                stripe_request('POST','checkout/sessions/'+user['checkout_session']+'/expire')
            if previous.get('status') == 'complete': raise HTTPException(409,'Your payment is being confirmed. Refresh your account shortly.')
        data={'metadata[buywise_plan]':plan,'mode':'subscription','customer':user['customer'],'client_reference_id':user['id'],
            'success_url':app_url()+'/?billing=success#pricing','cancel_url':app_url()+'/?billing=cancelled#pricing',
            'line_items[0][quantity]':'1','line_items[0][price_data][currency]':'eur',
            'line_items[0][price_data][unit_amount]':str(PLANS[plan]['cents']),
            'line_items[0][price_data][recurring][interval]':'month',
            'line_items[0][price_data][product_data][name]':'BuyWise '+plan.title(),
            'subscription_data[metadata][buywise_user_id]':user['id'],'subscription_data[metadata][buywise_plan]':plan}
        result=stripe_request('POST','checkout/sessions',data)
        conn.execute('UPDATE bw_users SET checkout_session=%s WHERE id=%s',(result['id'],user['id']))
        return {'url':result['url']}


def portal(token):
    if not enabled(): raise HTTPException(503,'Billing is unavailable.')
    with database() as conn: user=authenticate(token,conn)
    if not user['customer']: raise HTTPException(409,'No subscription to manage yet.')
    return {'url':stripe_request('POST','billing_portal/sessions',{'customer':user['customer'],'return_url':app_url()+'/#pricing'})['url']}


def validate_event(payload, signature):
    secret=os.getenv('STRIPE_WEBHOOK_SECRET')
    if not secret: raise HTTPException(503,'Webhook is not configured.')
    parts={}
    for part in (signature or '').split(','):
        key,_,value=part.partition('=');parts.setdefault(key,[]).append(value)
    try: stamp=int(parts['t'][0])
    except (KeyError,ValueError): raise HTTPException(400,'Invalid signature.')
    expected=hmac.new(secret.encode(),str(stamp).encode()+b'.'+payload,hashlib.sha256).hexdigest()
    if abs(time.time()-stamp)>300 or not any(hmac.compare_digest(expected,sig) for sig in parts.get('v1',[])): raise HTTPException(400,'Invalid signature.')
    try: return json.loads(payload)
    except ValueError: raise HTTPException(400,'Invalid event.')


def sync_subscription(subscription_id):
    with database() as conn:
        if not isinstance(conn, DevConnection):
            lock_key = int.from_bytes(hashlib.sha256(subscription_id.encode()).digest()[:8], 'big', signed=True)
            conn.execute('SELECT pg_advisory_xact_lock(%s)', (lock_key,))
        sub=stripe_request('GET','subscriptions/'+subscription_id,{'expand[]':'latest_invoice'})
        metadata=sub.get('metadata',{});user_id=metadata.get('buywise_user_id');plan=metadata.get('buywise_plan')
        if not user_id or plan not in {'starter','plus'}: return
        items=sub.get('items',{}).get('data',[])
        item=items[0] if len(items)==1 else {};price=item.get('price',{})
        valid_price=price.get('currency')=='eur' and price.get('unit_amount')==PLANS[plan]['cents'] and price.get('recurring',{}).get('interval')=='month' and item.get('quantity',1)==1
        invoice=sub.get('latest_invoice') or {};paid=isinstance(invoice,dict) and invoice.get('status')=='paid'
        start=item.get('current_period_start',sub.get('current_period_start',0));end=item.get('current_period_end',sub.get('current_period_end',0))
        active=sub.get('status')=='active' and paid and valid_price and end>time.time()
        row=conn.execute('SELECT * FROM bw_users WHERE id=%s FOR UPDATE',(user_id,)).fetchone()
        if not row or row['customer']!=sub.get('customer'): return
        if row['subscription'] and row['subscription']!=subscription_id: return
        conn.execute('UPDATE bw_users SET plan=%s,subscription=%s,period_start=%s,period_end=%s,billing_updated=%s,checkout_session=NULL WHERE id=%s',
            (plan if active else 'free',None if sub.get('status')=='canceled' else subscription_id,start,end if active else 0,int(time.time()),user_id))

def process_event(event):
    kind=event.get('type','');obj=event.get('data',{}).get('object',{})
    sub_id=None
    if kind in {'customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'}: sub_id=obj.get('id')
    elif kind in {'checkout.session.completed','invoice.paid','invoice.payment_failed'}:
        sub_id=obj.get('subscription') or obj.get('parent',{}).get('subscription_details',{}).get('subscription')
    if isinstance(sub_id,str) and sub_id.startswith('sub_'): sync_subscription(sub_id)
    return {'received':True}
