import random
import string
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.meal_entry import MealEntry
from app.models.symptom_entry import SymptomEntry
from app.models.lifestyle_entry import LifestyleEntry
from app.schemas.user import UserCreate
from app.core.config import settings
from pwdlib import PasswordHash
from jose import jwt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def generate_otp() -> str:
    """Generate a 5-digit OTP code"""
    return ''.join(random.choices(string.digits, k=5))


def send_otp_email(email: str, otp_code: str):
    """Send OTP to user's email using SMTP"""
    try:
        sender_email = settings.smtp_email
        sender_password = settings.smtp_password
        smtp_server = settings.smtp_server
        smtp_port = settings.smtp_port

        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Your myPCOS Verification Code"
        message["From"] = sender_email
        message["To"] = email

        # Email body
        text = f"""
Hello,

Your myPCOS verification code is:

{otp_code}

This code expires in 10 minutes.

Best regards,
The myPCOS Team
        """

        html = f"""
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f0ff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #6b3e78; margin-bottom: 20px;">Welcome to myPCOS!</h2>
      <p style="color: #333; font-size: 16px;">Your verification code is:</p>
      <div style="background-color: #f0e6f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h1 style="color: #6b3e78; letter-spacing: 5px; margin: 0; font-size: 32px;">{otp_code}</h1>
      </div>
      <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      <p style="color: #999; font-size: 12px;">Best regards,<br/>The myPCOS Team</p>
    </div>
  </body>
</html>
        """

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())

        return True
    except Exception as e:
        print(f"Error sending OTP email: {e}")
        return False


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new unverified user and send OTP"""
    otp_code = generate_otp()
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

    db_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_verified=False,
        otp_code=otp_code,
        otp_expiry=otp_expiry,
        created_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send OTP to email
    send_otp_email(user_in.email, otp_code)

    return db_user


def verify_otp(db: Session, email: str, otp_code: str) -> bool:
    """Verify OTP and mark user as verified"""
    user = get_user_by_email(db, email)
    if not user:
        return False

    if user.otp_code != otp_code:
        return False

    if user.otp_expiry:
        expiry = user.otp_expiry
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expiry:
            return False

    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    db.commit()
    db.refresh(user)

    return True



def resend_otp(db: Session, email: str) -> bool:
    """Generate and resend OTP"""
    user = get_user_by_email(db, email)
    if not user:
        return False

    otp_code = generate_otp()
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

    user.otp_code = otp_code
    user.otp_expiry = otp_expiry
    db.commit()
    db.refresh(user)

    # Send OTP to email
    return send_otp_email(email, otp_code)


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user (must be verified)"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_verified:
        return None
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> bool:
    if not verify_password(current_password, user.hashed_password):
        return False

    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return True


def delete_account(db: Session, user: User) -> None:
    db.query(MealEntry).filter(MealEntry.user_id == user.id).delete()
    db.query(SymptomEntry).filter(SymptomEntry.user_id == user.id).delete()
    db.query(LifestyleEntry).filter(LifestyleEntry.user_id == user.id).delete()
    db.delete(user)
    db.commit()


def create_access_token(user: User) -> str:
    return generate_token(user)


def generate_token(user: User) -> str:
    return jwt.encode(
        {"sub": user.email, "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
