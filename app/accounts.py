"""Persistent accounts, opaque sessions and server-enforced analysis allowances."""
from contextlib import contextmanager
import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import time
from threading import Lock
from fastapi import HTTPException
from pydantic import BaseModel, Field

PLANS = {'free': {'limit': 3, 'cents': 0}, 'starter': {'limit': 20, 'cents': 299}, 'plus': {'limit': 60, 'cents': 599}}
COOKIE = 'buywise_session'
_ready = set()
_lock = Lock()


def configured():
    return bool(os.getenv('DATABASE_URL') or (os.getenv('BUYWISE_DEV_DATABASE_PATH') and not os.getenv('RENDER')))


class Credentials(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)


class DevConnection:
    def __init__(self, path):
        self.conn = sqlite3.connect(path, timeout=15)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute('BEGIN IMMEDIATE')
    def execute(self, sql, params=()):
        return self.conn.execute(sql.replace('%s','?').replace(' FOR UPDATE',''), params)


@contextmanager
def database():
    url = os.getenv('DATABASE_URL')
    if url:
        import psycopg
        from psycopg.rows import dict_row
        conn = psycopg.connect(url, row_factory=dict_row, connect_timeout=5)
        key = url
    elif os.getenv('BUYWISE_DEV_DATABASE_PATH') and not os.getenv('RENDER'):
        conn = DevConnection(os.environ['BUYWISE_DEV_DATABASE_PATH'])
        key = os.environ['BUYWISE_DEV_DATABASE_PATH']
    else:
        raise HTTPException(503, 'Accounts are not available yet. Please try again later.')
    raw = conn.conn if isinstance(conn, DevConnection) else conn
    try:
        with _lock:
            if key not in _ready:
                conn.execute('CREATE TABLE IF NOT EXISTS bw_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created BIGINT NOT NULL, plan TEXT NOT NULL DEFAULT \'free\', customer TEXT UNIQUE, subscription TEXT, period_start BIGINT NOT NULL DEFAULT 0, period_end BIGINT NOT NULL DEFAULT 0, billing_updated BIGINT NOT NULL DEFAULT 0, checkout_session TEXT)')
                conn.execute('CREATE TABLE IF NOT EXISTS bw_auth_attempts (email TEXT NOT NULL, bucket BIGINT NOT NULL, total BIGINT NOT NULL, PRIMARY KEY(email,bucket))')
                conn.execute('CREATE TABLE IF NOT EXISTS bw_waitlist (email TEXT PRIMARY KEY, created BIGINT NOT NULL)')
                conn.execute('CREATE TABLE IF NOT EXISTS bw_sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES bw_users(id), expires BIGINT NOT NULL)')
                conn.execute('CREATE TABLE IF NOT EXISTS bw_usage (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES bw_users(id), created BIGINT NOT NULL)')
                conn.execute('CREATE INDEX IF NOT EXISTS bw_usage_user ON bw_usage(user_id, created)')
                raw.commit()
                _ready.add(key)
                if isinstance(conn, DevConnection): raw.execute('BEGIN IMMEDIATE')
        yield conn
        raw.commit()
    except BaseException:
        raw.rollback()
        raise
    finally:
        raw.close()


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    value = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 600000).hex()
    return salt + ':' + value


def credentials_email(email):
    email = email.strip().lower()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email): raise HTTPException(422, 'Enter a valid email address.')
    return email


def session(conn, user_id):
    token = secrets.token_urlsafe(32)
    conn.execute('INSERT INTO bw_sessions(token,user_id,expires) VALUES (%s,%s,%s)', (hashlib.sha256(token.encode()).hexdigest(),user_id,int(time.time())+30*86400))
    return token


def authenticate(token, conn, lock=False):
    if not token: raise HTTPException(401, 'Sign in to use your free analyses.')
    row = conn.execute('SELECT u.* FROM bw_users u JOIN bw_sessions s ON s.user_id=u.id WHERE s.token=%s AND s.expires>%s' + (' FOR UPDATE' if lock else ''), (hashlib.sha256(token.encode()).hexdigest(),int(time.time()))).fetchone()
    if not row: raise HTTPException(401, 'Your session expired. Please sign in again.')
    return dict(row)


def public_account(conn, user):
    paid = user['plan'] in {'starter','plus'} and user['period_end'] > int(time.time())
    plan = user['plan'] if paid else 'free'
    since = user['period_start'] if paid else 0
    used = conn.execute('SELECT COUNT(*) AS total FROM bw_usage WHERE user_id=%s AND created>=%s', (user['id'],since)).fetchone()['total']
    return {'email':user['email'], 'plan':plan, 'used':used, 'limit':PLANS[plan]['limit'], 'remaining':max(0,PLANS[plan]['limit']-used), 'renews_at':user['period_end'] if paid else None}


def limit_auth(email):
    with database() as conn:
        bucket = int(time.time()) // 900
        conn.execute('DELETE FROM bw_auth_attempts WHERE bucket<%s', (bucket-1,))
        row = conn.execute('INSERT INTO bw_auth_attempts(email,bucket,total) VALUES (%s,%s,1) ON CONFLICT(email,bucket) DO UPDATE SET total=bw_auth_attempts.total+1 WHERE bw_auth_attempts.total<10 RETURNING total', (email,bucket)).fetchone()
        if not row: raise HTTPException(429, 'Too many sign-in attempts. Please try again in 15 minutes.')


def register(credentials):
    email = credentials_email(credentials.email)
    limit_auth(email)
    hashed = password_hash(credentials.password)
    with database() as conn:
        if conn.execute('SELECT id FROM bw_users WHERE email=%s',(email,)).fetchone(): raise HTTPException(409,'An account already exists. Please sign in.')
        user_id = secrets.token_hex(16)
        conn.execute('INSERT INTO bw_users(id,email,password,created) VALUES (%s,%s,%s,%s)',(user_id,email,hashed,int(time.time())))
        token = session(conn,user_id)
        user = dict(conn.execute('SELECT * FROM bw_users WHERE id=%s',(user_id,)).fetchone())
        return token, public_account(conn,user)


def login(credentials):
    email = credentials_email(credentials.email)
    limit_auth(email)
    with database() as conn:
        row = conn.execute('SELECT * FROM bw_users WHERE email=%s',(email,)).fetchone()
        salt = row['password'].split(':')[0] if row else '00'*16
        hashed = password_hash(credentials.password,salt)
        if not row or not hmac.compare_digest(hashed,row['password']): raise HTTPException(401,'Email or password is incorrect.')
        user = dict(row)
        return session(conn,user['id']), public_account(conn,user)


def account(token):
    with database() as conn: return public_account(conn,authenticate(token,conn))


def reserve_analysis(token):
    if not configured(): return None  # Public preview until persistent accounts are configured.
    with database() as conn:
        user = authenticate(token,conn,lock=True)
        if public_account(conn,user)['remaining'] <= 0: raise HTTPException(402,'You have used your analyses. Choose a plan to continue.')
        reservation = secrets.token_hex(16)
        conn.execute('INSERT INTO bw_usage(id,user_id,created) VALUES (%s,%s,%s)',(reservation,user['id'],int(time.time())))
        return reservation


def refund_analysis(reservation):
    if reservation:
        with database() as conn: conn.execute('DELETE FROM bw_usage WHERE id=%s',(reservation,))
