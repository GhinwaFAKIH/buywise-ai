import os,tempfile,time,json,hmac,hashlib
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
os.environ.pop('DATABASE_URL',None)
os.environ.pop('RENDER',None)
os.environ['BUYWISE_DEV_DATABASE_PATH']=tempfile.mktemp()
os.environ['STRIPE_SECRET_KEY']='sk_test_fake'
os.environ['STRIPE_WEBHOOK_SECRET']='whsec_fake'
os.environ['PUBLIC_APP_URL']='https://example.com'
from app import accounts as a,billing as b
from fastapi import HTTPException
creds=a.Credentials(email='shop@example.com',password='verysecurepassword')
token,user=a.register(creds)
assert user['remaining']==3
assert a.login(creds)[1]['remaining']==3
try:a.login(a.Credentials(email=creds.email,password='incorrectpassword'))
except HTTPException as e:assert e.status_code==401
else:raise AssertionError('bad password accepted')
def reserve(_):
 try:return a.reserve_analysis(token)
 except HTTPException as e:assert e.status_code==402;return None
with ThreadPoolExecutor(max_workers=8) as pool: reservations=list(pool.map(reserve,range(8)))
assert len([r for r in reservations if r])==3
assert a.account(token)['remaining']==0
a.refund_analysis(next(r for r in reservations if r));assert a.account(token)['remaining']==1
with a.database() as c:
 u=a.authenticate(token,c);uid=u['id'];c.execute('UPDATE bw_users SET customer=%s WHERE id=%s',('cus_test',uid))
now=int(time.time());sub={'metadata':{'buywise_user_id':uid,'buywise_plan':'starter'},'customer':'cus_test','status':'active','latest_invoice':{'status':'paid'},'items':{'data':[{'quantity':1,'price':{'currency':'eur','unit_amount':299,'recurring':{'interval':'month'}},'current_period_start':now+1,'current_period_end':now+86400}]}}
with patch.object(b,'stripe_request',return_value=sub):b.sync_subscription('sub_test')
assert a.account(token)['remaining']==20
sub['latest_invoice']['status']='open'
with patch.object(b,'stripe_request',return_value=sub):b.sync_subscription('sub_test')
assert a.account(token)['plan']=='free'
sub['latest_invoice']['status']='paid';sub['items']['data'][0]['price']['unit_amount']=1
with patch.object(b,'stripe_request',return_value=sub):b.sync_subscription('sub_test')
assert a.account(token)['plan']=='free'
sub['items']['data'][0]['price']['unit_amount']=299;sub['status']='canceled'
with patch.object(b,'stripe_request',return_value=sub):b.sync_subscription('sub_test')
with patch.object(b,'stripe_request',side_effect=[{'id':'cs_test','url':'https://checkout.stripe.com/test'},{'status':'open','url':'https://checkout.stripe.com/test'}]) as mock:
 assert b.checkout(token,'starter')['url']==b.checkout(token,'starter')['url'];assert mock.call_count==2
payload=json.dumps({'type':'ignored'}).encode();stamp=int(time.time());sig=hmac.new(b'whsec_fake',str(stamp).encode()+b'.'+payload,hashlib.sha256).hexdigest()
assert b.validate_event(payload,f't={stamp},v1={sig}')['type']=='ignored'
for signature in [f't={stamp},v1=bad',f't={stamp-400},v1={sig}']:
 try:b.validate_event(payload,signature)
 except HTTPException as e:assert e.status_code==400
 else:raise AssertionError('invalid webhook accepted')
print('PASS: login, concurrent 3-check limit, refund, monthly allowance, unpaid/wrong-price rejection, duplicate checkout reuse, webhook signatures')
