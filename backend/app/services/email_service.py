import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_registration_otp(email: str, otp_code: str, username: str) -> None:
    if not all(
        [
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            settings.SMTP_USER,
            settings.SMTP_PASSWORD,
            settings.EMAIL_FROM,
        ]
    ):
        raise RuntimeError("SMTP settings are incomplete")

    message = EmailMessage()
    message["Subject"] = "Your MySpace verification code"
    message["From"] = settings.EMAIL_FROM
    message["To"] = email
    message.set_content(
        "\n".join(
            [
                f"Hello {username},",
                "",
                f"Your MySpace verification code is: {otp_code}",
                "This code expires in 10 minutes.",
                "",
                "If you did not request this code, you can ignore this email.",
            ]
        )
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(message)
