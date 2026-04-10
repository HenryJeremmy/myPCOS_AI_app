from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.user import (
    UserCreate,
    UserRead,
    OTPVerify,
    OTPResend,
    SignupResponse,
    ChangePasswordRequest,
    UserProfileUpdate,
)
from app.schemas.token import Token
from app.services.auth import (
    get_user_by_email, 
    create_user, 
    authenticate_user, 
    generate_token,
    verify_otp,
    resend_otp,
    change_password,
    delete_account,
    update_profile,
)
from app.core.config import settings
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    user = get_user_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=SignupResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    create_user(db, user_in)
    return {
        "email": user_in.email,
        "message": "Signup successful. Please verify your email with the OTP sent to your inbox."
    }


@router.post("/verify-email", response_model=dict)
def verify_email(otp_data: OTPVerify, db: Session = Depends(get_db)):
    if verify_otp(db, otp_data.email, otp_data.otp_code):
        return {"message": "Email verified successfully. You can now login."}
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")


@router.post("/resend-otp", response_model=dict)
def resend_otp_endpoint(otp_data: OTPResend, db: Session = Depends(get_db)):
    if resend_otp(db, otp_data.email):
        return {"message": "OTP resent to your email"}
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect credentials or email not verified"
        )
    return {"access_token": generate_token(user), "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
def me(current_user = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserRead)
def update_profile_endpoint(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_profile(
        db,
        current_user,
        profile_data.first_name,
        profile_data.last_name,
    )


@router.post("/change-password", response_model=dict)
def change_password_endpoint(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not change_password(
        db,
        current_user,
        password_data.current_password,
        password_data.new_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    return {"message": "Password updated successfully"}


@router.delete("/delete-account", response_model=dict)
def delete_account_endpoint(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    delete_account(db, current_user)
    return {"message": "Account deleted successfully"}
