from django.core.mail import send_mail
from django.conf import settings
import threading

def send_email_async(subject, message, recipient_list):
    """Send email in a separate thread to avoid blocking the main request."""
    try:
        email_thread = threading.Thread(
            target=send_mail,
            args=(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list),
            kwargs={'fail_silently': False}
        )
        email_thread.start()
    except Exception as e:
        print(f"Error sending email: {e}")

def send_access_granted_email(patient, doctor, access_type):
    """Notify patient that a doctor has been granted access."""
    subject = f"Access Granted: Dr. {doctor.user.get_full_name() or doctor.user.username}"
    message = f"""
    Hello {patient.user.get_full_name() or patient.user.username},

    Access to your health records has been granted to Dr. {doctor.user.get_full_name() or doctor.user.username}.
    
    Access Type: {access_type}
    Hospital: {doctor.hospital.name}
    
    If you did not authorize this, please log in to your dashboard and revoke access immediately.
    
    Regards,
    QR Health System
    """
    if patient.user.email:
        send_email_async(subject, message, [patient.user.email])

def send_access_revoked_email(patient, doctor):
    """Notify doctor that their access has been revoked."""
    subject = f"Access Revoked: Patient {patient.health_id}"
    message = f"""
    Hello Dr. {doctor.user.get_full_name() or doctor.user.username},

    Your access to the health records of patient {patient.user.get_full_name() or patient.user.username} ({patient.health_id}) has been revoked.
    
    You can no longer view their documents or history.
    
    Regards,
    QR Health System
    """
    if doctor.user.email:
        send_email_async(subject, message, [doctor.user.email])

def send_record_uploaded_email(patient, record_type, doctor_name):
    """Notify patient that a new record has been added."""
    subject = f"New Health Record Added: {record_type}"
    message = f"""
    Hello {patient.user.get_full_name() or patient.user.username},

    A new {record_type} has been added to your health profile by Dr. {doctor_name}.
    
    Log in to your dashboard to view the details.
    
    Regards,
    QR Health System
    """
    if patient.user.email:
        send_email_async(subject, message, [patient.user.email])

def send_lab_report_notification(patient, report):
    """Notify patient that a lab report has been uploaded."""
    subject = f"New Lab Report Available: {report.test_type.name}"
    message = f"""
    Hello {patient.user.get_full_name() or patient.user.username},

    A new lab report for {report.test_type.name} has been uploaded by {report.technician.user.get_full_name() or 'Lab Technician'}.
    
    Log in to your dashboard to view and download the report.
    
    Regards,
    QR Health System
    """
    if patient.user.email:
        send_email_async(subject, message, [patient.user.email])

def send_consultation_notification(patient, consultation):
    """Notify patient that a consultation record has been added."""
    subject = f"New Consultation Record: Dr. {consultation.doctor.user.get_full_name()}"
    message = f"""
    Hello {patient.user.get_full_name() or patient.user.username},

    Dr. {consultation.doctor.user.get_full_name()} has added a new consultation record involved with your visit on {consultation.consultation_date.date()}.
    
    You can view the prescription and notes in your dashboard.
    
    Regards,
    QR Health System
    """
    if patient.user.email:
        send_email_async(subject, message, [patient.user.email])
