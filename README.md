# MediVault: Identity-Based Federated Access to Medical Records Across Healthcare Networks

## Overview

MediVault is a healthcare management platform designed to improve the accessibility, security, and management of electronic health records (EHRs) across connected healthcare facilities. It aims to bridge the gap between Primary Health Centres (PHCs) and hospitals by providing identity-based patient authentication, secure medical record storage, and cross-hospital record access.

The platform combines facial recognition, OTP verification, role-based access control, and cloud-based medical record management to support secure access to patient histories. Separate dashboards for patients, doctors, nurses, administrators, and scan centres provide role-specific functionalities for healthcare operations.

Key highlights include:

* Facial recognition-based patient authentication with OTP verification as an alternative.
* Cross-hospital access to patient medical records across connected healthcare facilities.
* Role-based access control for patients, doctors, nurses, administrators, and scan centres.
* Cloud-based storage and retrieval of medical reports and health documents, encrypted end-to-end.
* Appointment scheduling and medication tracking across every portal.
* Clinical early-warning scoring and automated critical alerts.
* Patient and healthcare provider dashboards for managing medical information.
* AI-assisted medical report summarization and medical image analysis.
* Drug interaction checking and intelligent medical record search.
* Audit logging and administrative tools for improved accountability.
* A scalable foundation for connecting rural PHCs with larger hospitals.

## Technologies Used

### Frontend

* **React.js** – Builds the interactive user interface and role-specific dashboards.
* **Chakra UI** – Provides reusable UI components and responsive styling.
* **React Router** – Handles navigation between application pages and role-specific portals.

### Backend

* **Node.js** – Supports server-side application logic.
* **Express.js** – Provides backend APIs for authentication, medical record operations, and healthcare management.

### Database and Cloud Storage

* **MongoDB** – Stores application data, including patient information and medical records.
* **Cloudinary** – Supports cloud-based storage and delivery of medical documents and uploaded media.

### Authentication and Security

* **Facial Recognition** – Enables face-based patient identity verification.
* **OTP Verification** – Provides an alternative verification method for patient access.
* **Role-Based Access Control (RBAC)** – Restricts application functionality and record access according to user roles.
* **JWT (JSON Web Token)** – Supports token-based authentication for protected backend operations.
* **AES-256-CBC Encryption + SHA-256 Integrity Hashing** – Uploaded medical documents are encrypted and hashed before being stored, with integrity verified on every download.

### AI-Assisted Healthcare

* **AI-Based Medical Report Summarization** – Helps condense medical information into readable summaries.
* **Medical Image Analysis** – Supports AI-assisted analysis of medical images.
* **Drug Interaction Checker** – Helps identify potential interactions between medications.
* **Intelligent Medical Record Search** – Helps users locate relevant medical information.

## Key Features

### 1. Facial Biometric Authentication

Provides face-based patient verification to simplify identity validation and reduce dependence on conventional login credentials.

### 2. OTP-Based Alternative Verification

Offers OTP verification as an alternative patient authentication method when facial recognition is unavailable or unsuccessful.

### 3. Cross-Hospital Medical Record Access

Enables authorized healthcare professionals at connected facilities to retrieve patient medical histories, supporting continuity of care across PHCs and hospitals.

### 4. Patient Registration and Record Management

Supports patient registration and the management of medical information, allowing patient records to be maintained digitally.

### 5. Medical Report Upload and Encrypted Cloud Storage

Allows medical reports and supporting documents to be uploaded and stored using cloud-based media storage. Each file is AES-256-CBC encrypted and SHA-256 hashed before upload, with integrity verified on retrieval, making them securely accessible to authorized users only.

### 6. Role-Based Healthcare Dashboards

Provides dedicated portals for patients, doctors, nurses, administrators, and scan centres, with functionalities tailored to their respective roles.

### 7. Patient Dashboard

Allows patients to access their healthcare information, visit history, appointments, and available health-monitoring features.

### 8. Doctor Dashboard

Enables doctors to manage patient information, access medical records, review appointments, and use healthcare assistance tools.

### 9. Appointment and Medication Management

Supports scheduling, updating, and tracking patient appointments and prescribed medications across the doctor, nurse, patient, and scan centre portals.

### 10. Clinical Early-Warning Scoring and Alerts

Calculates a vitals-based early-warning score to flag at-risk patients, and automatically generates critical alerts for abnormal readings or significant clinical events.

### 11. Administrative Management

Provides administrative facilities for managing users, healthcare personnel, patients, scan centres, hospital settings, and system access.

### 12. Audit and Access Monitoring

Provides administrative audit facilities to support monitoring and accountability for healthcare system operations.

### 13. AI-Assisted Medical Report Summarization

Helps present important medical information in a concise and understandable format for easier review.

### 14. Medical Image Analysis

Provides an AI-assisted facility for analysing medical images to support healthcare information review.

### 15. Drug Interaction Checking

Offers a tool for checking potential interactions between medications, supporting safer medication review.

### 16. Intelligent Medical Record Search

Helps healthcare users find relevant patient information and medical records through search functionality.

## Project Objectives

* Digitize patient health records and reduce dependence on fragmented paper-based documentation.
* Enable secure access to patient medical histories across connected healthcare facilities.
* Improve patient identification through facial biometrics and alternative OTP verification.
* Protect sensitive health information through role-based access control and end-to-end encryption.
* Simplify medical report storage, retrieval, and management.
* Support continuity of care between rural PHCs and larger hospitals.
* Assist healthcare professionals with AI-based medical information tools.
* Provide a unified platform for patients and healthcare providers.

## System Workflow

1. **User Authentication:** Patients access the system through facial recognition or OTP verification. Healthcare personnel access their respective portals.
2. **Identity and Role Validation:** The application identifies the user and provides access according to the assigned role.
3. **Medical Record Management:** Patient information and medical records are stored and managed through the backend and database.
4. **Report Storage:** Medical documents are encrypted, hashed, and uploaded to cloud storage, with the corresponding information made available through the application.
5. **Scheduling and Monitoring:** Appointments and medications are scheduled and tracked, and vitals are screened through the early-warning scoring system to surface critical alerts.
6. **Cross-Hospital Access:** Authorized healthcare professionals retrieve relevant patient records through the connected healthcare platform.
7. **AI-Assisted Review:** Available AI tools support medical report summarization, medical image analysis, drug interaction checking, and record search.
8. **Administrative Oversight:** Administrators manage users and healthcare facilities and access the system's audit facilities.

## Project Structure

The application is organized into frontend pages, reusable components, authentication context, API utilities, and backend services.

* **Frontend:** React.js application with role-specific portals and dashboards.
* **Components:** Reusable UI elements and authentication components.
* **Authentication Context:** Manages application login state and user roles.
* **API Layer:** Connects the frontend to backend endpoints.
* **Backend:** Node.js and Express.js services for application operations.
* **Database:** MongoDB for application and medical record data.
* **Cloud Storage:** Cloudinary for uploaded medical documents and media.

```
BACKEND/        Express API, MongoDB models, routes, services
unified-app/    React frontend (all 5 portals)
```

## Getting Started

### Backend

```bash
cd BACKEND
npm install
cp .env.example .env   # fill in your own MongoDB URI, API keys, etc.
npm start
```

### Frontend

```bash
cd unified-app
npm install
npm start
```

The frontend expects the backend at `http://localhost:5002` by default (see `unified-app/.env`).

### Seed demo data (optional)

```bash
cd BACKEND
node seed_demo_data.js
node seed_appointments_medications.js
```

## Future Enhancements

* Integration with Ayushman Bharat Digital Mission (ABDM) and ABHA services.
* Standardized health data exchange using interoperability standards.
* Enhanced patient consent management and access permissions.
* Improved support for low-connectivity healthcare environments.
* Multilingual patient interfaces and medical reports.
* Further enhancements to AI-assisted healthcare tools.
* Expansion to support additional PHCs, hospitals, and healthcare networks.

## Project Goals

MediVault aims to provide a secure, accessible, and patient-centric digital healthcare platform that improves medical record availability, strengthens identity verification, and supports collaboration between healthcare facilities. By combining biometric authentication, encrypted cloud-based record management, and AI-assisted healthcare functionalities, the project seeks to contribute to more connected and efficient healthcare delivery.
