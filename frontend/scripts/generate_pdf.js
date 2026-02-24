import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
});

const pageWidth = doc.internal.pageSize.getWidth();
const margin = 40;
const centerX = pageWidth / 2;
let cursorY = 40;

// Header
doc.setFont("helvetica", "bold");
doc.setFontSize(20);
doc.text("PulseID", centerX, cursorY, { align: "center" });
cursorY += 15;
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(100);
doc.text("Unified Health Record", centerX, cursorY, { align: "center" });

cursorY += 25;
doc.setDrawColor(200);
doc.line(margin, cursorY, pageWidth - margin, cursorY);

// Title Section
cursorY += 25;
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(0);
doc.text("ORGAN DONOR DECLARATION FORM", margin, cursorY);
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.text("Form PID-OD-01", pageWidth - margin, cursorY, { align: "right" });

cursorY += 10;
doc.line(margin, cursorY, pageWidth - margin, cursorY);

// Personal Details
cursorY += 30;
doc.setFontSize(11);
doc.text("I, _________________________________ (Full Name as per Aadhaar)", margin, cursorY);
cursorY += 25;
doc.text("Health ID (PulseID): _______________________________", margin, cursorY);
cursorY += 25;
doc.text("Date of Birth: _____________________________________", margin, cursorY);
cursorY += 25;
doc.text("Address: __________________________________________", margin, cursorY);
cursorY += 20;
doc.text("         __________________________________________", margin, cursorY);

// Intent
cursorY += 40;
doc.text("hereby voluntarily declare my intent to donate my organs and/or", margin, cursorY);
cursorY += 15;
doc.text("tissues in the event of brain death or cardiac death, in accordance", margin, cursorY);
cursorY += 15;
doc.text("with the Transplantation of Human Organs and Tissues Act, 1994", margin, cursorY);
cursorY += 15;
doc.text("(amended 2011).", margin, cursorY);

// Organs List
cursorY += 40;
doc.setFont("helvetica", "bold");
doc.text("ORGANS I WISH TO DONATE (please tick):", margin, cursorY);

cursorY += 25;
doc.setFont("helvetica", "normal");
doc.text("  [ ] All organs and tissues (recommended)", margin, cursorY);

cursorY += 25;
doc.text("  [ ] Heart          [ ] Lungs         [ ] Liver", margin, cursorY);
cursorY += 20;
doc.text("  [ ] Kidneys        [ ] Corneas       [ ] Skin", margin, cursorY);
cursorY += 20;
doc.text("  [ ] Pancreas       [ ] Intestines", margin, cursorY);
cursorY += 20;
doc.text("  [ ] Other (specify): ____________________________", margin, cursorY);

// Declaration
cursorY += 40;
doc.setFont("helvetica", "bold");
doc.text("DECLARATION:", margin, cursorY);

cursorY += 20;
doc.setFont("helvetica", "normal");
const declarationText = [
    "1. This declaration is made voluntarily and of my own free will.",
    "2. I understand my family will be informed and consulted at the time of donation.",
    "3. I can withdraw this declaration at any time by contacting PulseID support at support@pulseid.in",
    "4. This declaration is for record-keeping on the PulseID platform and does not replace formal registration with NOTTO."
];

declarationText.forEach(line => {
    const splitLines = doc.splitTextToSize(line, pageWidth - margin * 2);
    doc.text(splitLines, margin, cursorY);
    cursorY += 18;
});

cursorY += 10;
doc.setFont("helvetica", "italic");
doc.text("For NOTTO registration: notto.gov.in | 1800-11-4770 (toll-free)", margin, cursorY);

cursorY += 20;
doc.line(margin, cursorY, pageWidth - margin, cursorY);

// Signature
cursorY += 30;
doc.setFont("helvetica", "normal");
doc.text("Signature (by hand): _____________________________", margin, cursorY);
cursorY += 25;
doc.text("Full Name (printed): _____________________________", margin, cursorY);
cursorY += 25;
doc.text("Date: ___________________  Place: ________________", margin, cursorY);

cursorY += 20;
doc.line(margin, cursorY, pageWidth - margin, cursorY);

// Instructions
cursorY += 30;
doc.setFont("helvetica", "bold");
doc.text("INSTRUCTIONS FOR SUBMISSION:", margin, cursorY);
cursorY += 15;
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
const instructions = [
    "1. Print this form on plain A4 paper.",
    "2. Fill in all fields clearly in BLOCK LETTERS.",
    "3. Sign in the designated box using a pen.",
    "4. Scan or photograph the signed form clearly.",
    "5. Upload the scanned copy on your PulseID profile page."
];
instructions.forEach(line => {
    doc.text(line, margin + 4, cursorY);
    cursorY += 12;
});

// Footer
doc.setFontSize(8);
doc.setTextColor(150);
doc.text("© 2026 PulseID · support@pulseid.in · pulseid.in", centerX, 800, { align: "center" });
doc.text("This form is for PulseID platform use only.", centerX, 810, { align: "center" });

const buffer = Buffer.from(doc.output("arraybuffer"));
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
fs.writeFileSync(path.join(publicDir, "PulseID_OrganDonor_Declaration.pdf"), buffer);

console.log("PDF generated successfully at public/PulseID_OrganDonor_Declaration.pdf");
