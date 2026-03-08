# PulseID — Next Steps & Issue Tracker
Last updated: 8th march 2026 

---
refer - /system_colours_and_design.md for colour scheme 

1. 🔴 Login Page - Error message is not visible, example user doesn't exist, password is incorrect. are you a patient, doctor, hospital or lab? when incorrect 
2. 🔴 Login Page - Forgot password is not functional. 

3. 🔴 Registration page - Right now lab and hospital registration are on different pages, change it to one page like doctor, patient and hospital 
4. 🔴 Registration page - Error message is not visible, required fields, invalid email, invalid phone number, etc 


## 1. SYSTEM ADMIN 

**Test credentials:** `sysadmin / Admin@1234` at `/system/login` password: [admin1234@1234]
1.  🔴 Add Hospital and Lab Onboarding and approval - Create their own login and password
2. 🔴 Currently, admin can only see the list of doctors, hospitals and labs, add a way to see the details of each and approve or reject them. allow doctors to reupload as per rejection message 
3. 🔴 overview dashboard is static, change it to dynamic 
4. 🔴 Add a button to revoke access 

## 2. PATIENT FLOW 
**Test credentials:** - shloka / shloka921@gmail.com  password: [1234@shL0]
1. 🔴 FIX - My profile page, it is blank. 
2. 🔴 FIX - Add Prescirption (Only images, and extract text from it - with a warning that it is a AI generated text, its best to verify from the image as well)
3. 🔴 ADD - Download health card in a pdf format - with a password (Name's first 3 letters + DOB in DDMMYYYY format)
4. 🔴 ADD - the page when the QR is scanned eg (http://localhost:8000/api/patients/HID-767DDA23/) -  should be /patients/id with no login required with basic details like name, age, gender, blood group, emergency contacts, allergies, conditions. and a button to get full access that triggers login and SMS to emergency contacts and the patient. 
5. 🔴 Display OTP in notifcations 

## 3. DOCTOR FLOW


## 4. HOSPITAL & LAB Registration 
1. Check if system admin gets to approve 
3. 🔴 registartion of hospital fails 



## 6. Miscellaneous
1. Landing page - add pages like about, privacy and terms of service 
2. Login Signup - remove admin completely from the tab. 
    in login, add a choosing option for patient, doctor, hospital and lab. 