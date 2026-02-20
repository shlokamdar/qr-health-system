# Unified Health Record System

A secure, prototype healthcare system allowing doctors to access patient medical records via QR code scanning, built with **Django REST Framework** and **React**.

## 🚀 Tech Stack

- **Backend**: Django, Django REST Framework (DRF), SimpleJWT, PostgreSQL (configured for SQLite in proto).
- **Frontend**: React, Vite, TailwindCSS, Axios, React Router.
- **Security**: Role-Based Access Control (RBAC), JWT Authentication, Audit Logging.

## 📂 Project Structure

```text
final-year-project/
├── accounts/           # User Authentication & Roles (Patient, Doctor, Lab)
├── audit/              # Access Logs & Security Tracking
├── config/             # Main Django Configuration & URLs
├── frontend/           # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/    # Auth Context (JWT handling)
│   │   ├── pages/      # Dashboards (Patient/Doctor), Login
│   │   ├── utils/      # API Interceptors
│   │   ├── App.jsx     # Main Routing
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── media/              # Generated QR Codes & Uploaded Reports
├── patients/           # Patient Profiles & Health ID Logic
├── permissions/        # Custom DRF Permissions (IsDoctor, IsPatientOwner, etc.)
├── records/            # Medical Records (Prescriptions, Lab Reports)
├── venv/               # Python Virtual Environment
├── db.sqlite3          # Database (Prototype)
├── manage.py           # Django Management Script
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisite
- Python 3.10+
- Node.js 16+

### 1. Backend Setup

1.  **Clone & Navigate**:
    ```bash
    git clone <repo-url>
    cd qr-health-system
    ```

2.  **Create & Activate Virtual Environment**:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\Activate.ps1
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary qrcode pillow drf-yasg python-decouple django-cors-headers
    ```

4.  **Run Migrations**:
    ```bash
    python manage.py migrate
    ```

5.  **Create Admin User**:
    ```bash
    python manage.py createsuperuser
    ```

6.  **Run Server**:
    ```bash
    python manage.py runserver
    ```
    Backend will run at http://127.0.0.1:8000.

### 2. Frontend Setup

1.  **Navigate to Frontend**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Dev Server**:
    ```bash
    npm run dev
    ```
    Frontend will run at http://localhost:5173.

## 📖 Usage Guide

### Roles & Features
- **Patient**:
    - Register/Login.
    - View **Health ID** and **QR Code**.
    - View own medical records.
- **Doctor**:
    - Register/Login.
    - **Scan** (Simulate by entering) a Patient's Health ID.
    - View Patient's profile and records.
    - **Upload** new records (Prescriptions, Lab Reports).
- **Admin**:
    - Access `http://127.0.0.1:8000/admin`.
    - View **Audit Logs** (AccessLog) to see who accessed what data.

### API Documentation
Interactive API docs are available at:
- **Swagger UI**: http://127.0.0.1:8000/swagger/
- **ReDoc**: http://127.0.0.1:8000/redoc/
