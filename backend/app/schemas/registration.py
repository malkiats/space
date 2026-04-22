from pydantic import BaseModel, EmailStr, Field


class RegistrationOtpRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str | None = None


class RegistrationOtpVerify(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str
