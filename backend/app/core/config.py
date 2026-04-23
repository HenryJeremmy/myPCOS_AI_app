import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME = "myPCOS Backend"
    API_PREFIX = "/api/v1"
    APP_VERSION = "1.0.0"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    
    # SMTP Email Configuration
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_EMAIL = os.getenv("SMTP_EMAIL", "your-email@gmail.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")
    DEMO_OTP_ENABLED = os.getenv("DEMO_OTP_ENABLED", "false").lower() in {
        "1",
        "true",
        "yes",
        "on",
    }

    # AI inference can exceed small hosted instance memory limits.
    AI_INFERENCE_ENABLED = os.getenv("AI_INFERENCE_ENABLED", "false").lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    
   
    # CORS
    CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
    ]


    @property
    def app_name(self):
        return self.PROJECT_NAME

    @property
    def app_version(self):
        return self.APP_VERSION

    @property
    def jwt_secret_key(self):
        return self.JWT_SECRET_KEY

    @property
    def jwt_algorithm(self):
        return self.JWT_ALGORITHM

    @property
    def api_prefix(self):
        return self.API_PREFIX

    @property
    def database_url(self):
        return self.DATABASE_URL

    @property
    def smtp_server(self):
        return self.SMTP_SERVER

    @property
    def smtp_port(self):
        return self.SMTP_PORT

    @property
    def smtp_email(self):
        return self.SMTP_EMAIL

    @property
    def smtp_password(self):
        return self.SMTP_PASSWORD

    @property
    def demo_otp_enabled(self):
        return self.DEMO_OTP_ENABLED

    @property
    def ai_inference_enabled(self):
        return self.AI_INFERENCE_ENABLED

    @property
    def allowed_origins(self):
        return self.CORS_ORIGINS


settings = Settings()
