from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    is_active: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str


class OTPResend(BaseModel):
    email: EmailStr


class SignupResponse(BaseModel):
    email: EmailStr
    message: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
