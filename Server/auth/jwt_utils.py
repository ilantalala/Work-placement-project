from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app


def generate_token(username: str) -> str:
    payload = {
        'username': username,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(
        payload,
        current_app.config['JWT_SECRET'],
        algorithm='HS256',
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        current_app.config['JWT_SECRET'],
        algorithms=['HS256'],
    )
