from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import threading

def send_email_async(subject, text_body, html_body, recipient_list):
    """Send multipart email in a separate thread."""
    def send():
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            if html_body:
                msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
        except Exception as e:
            print(f"Error sending email: {e}")
            
    threading.Thread(target=send).start()

def render_html_email(heading, body_html, cta_label=None, cta_url=None, is_alert=False):
    """Render a clean, minimal HTML email with an optional CTA button."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    cta_html = ""
    if cta_label and cta_url:
        cta_html = f"""
        <div style="margin-top: 30px; margin-bottom: 30px;">
            <a href="{cta_url}" style="background-color: #2196f3; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                {cta_label}
            </a>
        </div>
        """
        
    accent_bar = ""
    if is_alert:
        accent_bar = """<div style="height: 4px; background-color: #00c896; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;"></div>"""
        
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f2f5; color: #444444; line-height: 1.6;">
        <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                {accent_bar}
                <div style="padding: 40px 30px;">
                    <div style="color: #0d1b2a; font-size: 14px; font-weight: bold; margin-bottom: 24px; letter-spacing: 0.5px;">
                        ⚡ PulseID
                    </div>
                    <h2 style="margin-top: 0; font-size: 20px; color: #0d1b2a;">{heading}</h2>
                    
                    <div style="font-size: 16px; color: #444444; margin-bottom: 24px;">
                        {body_html}
                    </div>
                    
                    {cta_html}
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 13px; color: #888888;">
                        Regards,<br>
                        <strong>PulseID Health System</strong><br>
                        <a href="{frontend_url}" style="color: #888888; text-decoration: none;">pulseid.online</a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def format_text_email(heading, body_text, cta_label=None, cta_url=None):
    """Render the plain text version of the email."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    cta_text = ""
    if cta_label and cta_url:
        cta_text = f"\n{cta_label}: {cta_url}\n"
        
    return f"{heading}\n\n{body_text}\n{cta_text}\nRegards,\nPulseID Health System\n{frontend_url}"

def _send_notification(subject, recipient_email, heading, body_html, body_text, cta_label=None, cta_url=None, is_alert=False):
    if not recipient_email:
        return
        
    html = render_html_email(heading, body_html, cta_label, cta_url, is_alert)
    text = format_text_email(heading, body_text, cta_label, cta_url)
    send_email_async(subject, text, html, [recipient_email])

def send_access_granted_email(patient, doctor, access_type):
    """Notify patient that a doctor has been granted access."""
    subject = f"Access Granted: Dr. {doctor.user.get_full_name() or doctor.user.username}"
    heading = f"Hello {patient.user.get_full_name() or patient.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    hospital_name = doctor.hospital.name if doctor.hospital else 'Independent Practice'
    body_html = f"Dr. {doctor.user.get_full_name() or doctor.user.username} has been granted {access_type} access to your health records.<br>Hospital: {hospital_name}<br><br>If you did not authorize this, please revoke access immediately."
    body_text = f"Dr. {doctor.user.get_full_name() or doctor.user.username} has been granted {access_type} access to your health records.\nHospital: {hospital_name}\n\nIf you did not authorize this, please revoke access immediately."
    
    _send_notification(subject, patient.user.email, heading, body_html, body_text, "View Dashboard", f"{frontend_url}/patient/dashboard", is_alert=True)

def send_access_revoked_email(patient, doctor):
    """Notify doctor that their access has been revoked."""
    subject = f"Access Revoked: Patient {patient.health_id}"
    heading = f"Hello Dr. {doctor.user.get_full_name() or doctor.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    body_html = f"Your access to the health records of {patient.user.get_full_name() or patient.user.username} ({patient.health_id}) has been revoked. You can no longer view their documents or history."
    body_text = f"Your access to the health records of {patient.user.get_full_name() or patient.user.username} ({patient.health_id}) has been revoked. You can no longer view their documents or history."
    
    _send_notification(subject, doctor.user.email, heading, body_html, body_text, "Go to Dashboard", f"{frontend_url}/doctor/dashboard")

def send_record_uploaded_email(patient, record_type, doctor_name):
    """Notify patient that a new record has been added."""
    subject = f"New Health Record Added: {record_type}"
    heading = f"Hello {patient.user.get_full_name() or patient.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    body_html = f"A new {record_type} has been added to your health profile by Dr. {doctor_name}."
    body_text = f"A new {record_type} has been added to your health profile by Dr. {doctor_name}."
    
    _send_notification(subject, patient.user.email, heading, body_html, body_text, "View Record", f"{frontend_url}/patient/dashboard")

def send_lab_report_notification(patient, report):
    """Notify patient that a lab report has been uploaded."""
    subject = f"New Lab Report Available: {report.test_type.name}"
    heading = f"Hello {patient.user.get_full_name() or patient.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    tech_name = report.technician.user.get_full_name() or 'Lab Technician'
    body_html = f"A new lab report for {report.test_type.name} has been uploaded by {tech_name}."
    body_text = f"A new lab report for {report.test_type.name} has been uploaded by {tech_name}."
    
    _send_notification(subject, patient.user.email, heading, body_html, body_text, "View Report", f"{frontend_url}/patient/dashboard")

def send_consultation_notification(patient, consultation):
    """Notify patient that a consultation record has been added."""
    subject = f"New Consultation Record: Dr. {consultation.doctor.user.get_full_name()}"
    heading = f"Hello {patient.user.get_full_name() or patient.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    body_html = f"Dr. {consultation.doctor.user.get_full_name()} has added a new consultation record from your visit on {consultation.consultation_date.date()}."
    body_text = f"Dr. {consultation.doctor.user.get_full_name()} has added a new consultation record from your visit on {consultation.consultation_date.date()}."
    
    _send_notification(subject, patient.user.email, heading, body_html, body_text, "View Consultation", f"{frontend_url}/patient/dashboard")

def send_doctor_registration_email(doctor):
    """Notify system administrators about a new doctor registration."""
    subject = "New Doctor Registration Pending"
    heading = "Hello Admin,"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    hospital_name = doctor.hospital.name if doctor.hospital else 'Independent'
    body_html = f"A new doctor has registered and is awaiting verification.<br><br>Name: Dr. {doctor.user.get_full_name() or doctor.user.username}<br>License: {doctor.license_number}<br>Specialization: {doctor.specialization}<br>Hospital: {hospital_name}"
    body_text = f"A new doctor has registered and is awaiting verification.\n\nName: Dr. {doctor.user.get_full_name() or doctor.user.username}\nLicense: {doctor.license_number}\nSpecialization: {doctor.specialization}\nHospital: {hospital_name}"
    
    _send_notification(subject, settings.ADMIN_EMAIL, heading, body_html, body_text, "Review Registration", f"{frontend_url}/admin-dashboard")

def send_hospital_registration_email(hospital):
    """Notify system administrators about a new hospital registration."""
    subject = "New Hospital Registration Pending"
    heading = "Hello Admin,"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    body_html = f"A new hospital has registered and is awaiting verification.<br><br>Name: {hospital.name}<br>Registration No: {hospital.registration_number}<br>Address: {hospital.address}"
    body_text = f"A new hospital has registered and is awaiting verification.\n\nName: {hospital.name}\nRegistration No: {hospital.registration_number}\nAddress: {hospital.address}"
    
    _send_notification(subject, settings.ADMIN_EMAIL, heading, body_html, body_text, "Review Registration", f"{frontend_url}/admin-dashboard")

def send_doctor_approved_email(doctor):
    """Notify doctor that their account has been verified."""
    subject = "PulseID Account Verified"
    heading = f"Hello Dr. {doctor.user.get_full_name() or doctor.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    body_html = f"Your PulseID account has been verified by the administration team. You can now access your dashboard."
    body_text = f"Your PulseID account has been verified by the administration team. You can now access your dashboard."
    
    _send_notification(subject, doctor.user.email, heading, body_html, body_text, "Log In", f"{frontend_url}/doctor/login")

def send_otp_email(recipient_name, recipient_email, doctor_name, otp_code):
    """Send OTP email to patient or emergency contact."""
    subject = f"PulseID OTP: {otp_code}"
    heading = f"Hello {recipient_name},"
    
    body_html = f"Dr. {doctor_name} is requesting access to associated medical records.<br><br><strong style='font-size: 24px; letter-spacing: 2px;'>{otp_code}</strong><br><br>This code is valid for 10 minutes. If you did not expect this request, do not share this code."
    body_text = f"Dr. {doctor_name} is requesting access to associated medical records.\n\nYour One-Time Password (OTP) is: {otp_code}\n\nThis code is valid for 10 minutes. If you did not expect this request, do not share this code."
    
    _send_notification(subject, recipient_email, heading, body_html, body_text)

def send_registration_welcome_email(user):
    """Send welcome email to newly registered users."""
    role_display = user.role.replace('_', ' ').title()
    heading = f"Hello {user.get_full_name() or user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    if user.role in ['DOCTOR', 'LAB_TECH', 'HOSPITAL_ADMIN']:
        subject = "Account Created - Pending Verification"
        body_html = f"Your {role_display} account has been successfully created and is currently under review. We will notify you once verified."
        body_text = f"Your {role_display} account has been successfully created and is currently under review. We will notify you once verified."
        _send_notification(subject, user.email, heading, body_html, body_text)
    else:
        subject = "Welcome to PulseID"
        body_html = f"Your {role_display} account has been successfully created. You can now access your dashboard."
        body_text = f"Your {role_display} account has been successfully created. You can now access your dashboard."
        _send_notification(subject, user.email, heading, body_html, body_text, "Log In", frontend_url)

def send_access_request_notification(patient, doctor):
    """Notify patient that a doctor has requested access to their records."""
    subject = f"Medical Access Request: Dr. {doctor.user.get_full_name() or doctor.user.username}"
    heading = f"Hello {patient.user.get_full_name() or patient.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    
    body_html = f"Dr. {doctor.user.get_full_name() or doctor.user.username} has requested access to your medical records. Please review this request."
    body_text = f"Dr. {doctor.user.get_full_name() or doctor.user.username} has requested access to your medical records. Please review this request."
    
    _send_notification(subject, patient.user.email, heading, body_html, body_text, "Review Request", f"{frontend_url}/patient/dashboard")

def send_profile_accessed_notification(patient, actor):
    """Notify patient that their profile was viewed."""
    subject = "Security Alert: Profile Accessed"
    heading = f"Hello {patient.user.get_full_name() or patient.user.username},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    actor_name = actor.get_full_name() or actor.username
    
    body_html = f"Your medical profile was recently viewed by {actor_name}. This is an automated security notification."
    body_text = f"Your medical profile was recently viewed by {actor_name}. This is an automated security notification."
    
    _send_notification(subject, patient.user.email, heading, body_html, body_text, "View Activity", f"{frontend_url}/patient/dashboard", is_alert=True)

def send_emergency_contact_added_email(contact, patient):
    """Notify someone that they have been added as an emergency contact."""
    subject = "Emergency Contact Added"
    heading = f"Hello {contact.name},"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    patient_name = patient.user.get_full_name() or patient.user.username
    
    body_html = f"{patient_name} added you as their emergency contact on PulseID. In an emergency, you may be asked to share a One-Time PIN (OTP).<br><br><strong>BEWARE:</strong> Do not share the OTP unless you have received a phone call and verified the emergency."
    body_text = f"{patient_name} added you as their emergency contact on PulseID. In an emergency, you may be asked to share a One-Time PIN (OTP).\n\nBEWARE: Do not share the OTP unless you have received a phone call and verified the emergency."
    
    _send_notification(subject, contact.email, heading, body_html, body_text, "Create PulseID Account", frontend_url)
