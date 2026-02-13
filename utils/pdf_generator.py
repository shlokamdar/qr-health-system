from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO

def generate_patient_pdf(patient, records, prescriptions, lab_reports):
    """
    Generate a PDF report for a patient including their profile,
    medical records, prescriptions, and lab reports.
    Returns: BytesIO object containing the PDF.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # --- Title & Header ---
    title_style = styles['Title']
    story.append(Paragraph(f"Medical Report: {patient.user.get_full_name()}", title_style))
    story.append(Paragraph(f"Health ID: {patient.health_id}", styles['Heading2']))
    story.append(Spacer(1, 12))

    # --- Patient Profile ---
    story.append(Paragraph("Patient Profile", styles['Heading2']))
    profile_data = [
        ["DOB", str(patient.date_of_birth)],
        ["Blood Group", patient.blood_group or "N/A"],
        ["Contact", patient.contact_number],
        ["Address", patient.address or "N/A"],
        ["Allergies", patient.allergies or "None"],
        ["Chronic Conditions", patient.chronic_conditions or "None"]
    ]
    t = Table(profile_data, colWidths=[150, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    # --- Medical Records ---
    story.append(Paragraph("Recent Medical Records", styles['Heading2']))
    if records:
        record_data = [["Date", "Title", "Type", "Doctor"]]
        for rec in records:
            doctor_name = rec.doctor.user.get_full_name() if rec.doctor else "Unknown"
            record_data.append([
                str(rec.created_at.date()),
                rec.title,
                rec.record_type,
                doctor_name
            ])
        t_recs = Table(record_data, colWidths=[80, 150, 100, 120])
        t_recs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_recs)
    else:
        story.append(Paragraph("No medical records found.", styles['Normal']))
    story.append(Spacer(1, 20))

    # --- Prescriptions ---
    story.append(Paragraph("Prescription History", styles['Heading2']))
    if prescriptions:
        for presc in prescriptions:
            p_text = f"<b>Date:</b> {presc.prescription_date} | <b>Doctor:</b> {presc.doctor_name}"
            story.append(Paragraph(p_text, styles['Normal']))
            story.append(Paragraph(f"<b>Diagnosis:</b> {presc.diagnosis}", styles['Normal']))
            if presc.medicines:
                story.append(Paragraph(f"<b>Medicines:</b> {presc.medicines}", styles['Normal']))
            story.append(Spacer(1, 8))
            story.append(Paragraph("-" * 60, styles['Normal']))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No prescriptions found.", styles['Normal']))
    story.append(Spacer(1, 20))

    # --- Lab Reports ---
    story.append(Paragraph("Lab Reports", styles['Heading2']))
    if lab_reports:
        lab_data = [["Date", "Test", "Result", "Comments"]]
        for rep in lab_reports:
            test_name = rep.test_type.name if rep.test_type else "Unknown Test"
            # Simplify result for table
            result_str = "See Details" 
            lab_data.append([
                str(rep.created_at.date()),
                test_name,
                result_str,
                rep.comments[:50] + "..." if len(rep.comments) > 50 else rep.comments
            ])
        t_labs = Table(lab_data, colWidths=[80, 150, 100, 150])
        t_labs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(t_labs)
    else:
        story.append(Paragraph("No lab reports found.", styles['Normal']))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
