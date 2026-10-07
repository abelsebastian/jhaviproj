# Google Sheets Database Schema & Setup Guide

## 1. Overview
The Hospital Bed Monitoring System utilizes Google Sheets as a lightweight, cloud-hosted relational database accessed via Google Apps Script (GAS) as a serverless REST API.

---

## 2. Spreadsheet Structure

The workbook contains four key sheets (tables):

### Table 1: `Beds`
Primary registry of all hospital beds.

| Column Index | Field Name | Data Type | Description | Example |
|---|---|---|---|---|
| A | `Bed_ID` | String | Unique Bed Identifier (PK) | `ICU301` |
| B | `Ward` | String | Clinical Department / Ward | `ICU` |
| C | `Floor` | Integer | Floor Number (0=Ground, 1=1st, 2=2nd) | `1` |
| D | `Room` | String | Room Identification Code | `ICU01` |
| E | `Status` | String | AVAILABLE, OCCUPIED, CLEANING, RESERVED, MAINTENANCE | `AVAILABLE` |
| F | `Patient_ID` | String | Admitted Patient ID (FK) or `-` if empty | `P1026` |
| G | `Last_Updated` | String | Timestamp of latest status transition | `10:42 AM` |

### Table 2: `Patients`
Clinical admission and discharge registry.

| Column Index | Field Name | Data Type | Description | Example |
|---|---|---|---|---|
| A | `Patient_ID` | String | Unique Patient Identifier (PK) | `P1025` |
| B | `Patient_Name` | String | Full Name of Patient | `Arun Kumar` |
| C | `Bed_ID` | String | Assigned Bed Identifier (FK) | `ICU301` |
| D | `Admission_Time` | String | Timestamp when admitted | `08:20 AM` |
| E | `Discharge_Time` | String | Timestamp when discharged (or `-`) | `11:15 AM` |
| F | `Status` | String | `ADMITTED` or `DISCHARGED` | `ADMITTED` |

### Table 3: `Activity_Log`
Immutable audit log tracking all bed state transitions.

| Column Index | Field Name | Data Type | Description | Example |
|---|---|---|---|---|
| A | `Timestamp` | String | Time event occurred | `10:42 AM` |
| B | `Action` | String | Operation type (ADMISSION, DISCHARGE, UPDATE_STATUS) | `UPDATE_STATUS` |
| C | `Bed_ID` | String | Target Bed ID | `ICU301` |
| D | `Patient_ID` | String | Associated Patient or `-` | `P1025` |
| E | `Previous_Status` | String | Status before update | `AVAILABLE` |
| F | `New_Status` | String | Status after update | `OCCUPIED` |
| G | `User` | String | Staff role performing action | `Reception Staff` |

### Table 4: `Wards`
Ward directory and capacity mapping.

| Column Index | Field Name | Data Type | Description | Example |
|---|---|---|---|---|
| A | `Ward_ID` | String | Unique Ward Identifier | `W04` |
| B | `Ward_Name` | String | Clinical Department Name | `ICU` |
| C | `Floor` | Integer | Floor Level | `1` |
| D | `Total_Beds` | Integer | Total Bed Capacity in Ward | `10` |

---

## 3. Step-by-Step Google Apps Script Deployment

1. **Create New Google Spreadsheet**:
   - Navigate to [Google Sheets](https://sheets.new).
   - Name the spreadsheet: `Hospital_Bed_Monitoring_DB`.

2. **Open Apps Script Editor**:
   - In the spreadsheet menu, click **Extensions** > **Apps Script**.

3. **Paste Code**:
   - Clear existing content in `Code.gs`.
   - Paste the complete code from `google_apps_script/Code.gs`.

4. **Initialize Database Tables**:
   - In the Apps Script toolbar function dropdown, select `seedInitialDatabase`.
   - Click **Run**.
   - Review permissions dialog: Click **Review Permissions** > Choose your Google Account > Click **Advanced** > Click **Go to Hospital Bed System (unsafe)** > Click **Allow**.
   - The script will automatically format and seed all 4 sheets with 64 beds and sample patients!

5. **Deploy as Web App**:
   - Click **Deploy** > **New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Set Description: `Hospital Bed Monitoring API v1`.
   - Set **Execute as**: `Me (your email)`.
   - Set **Who has access**: `Anyone`.
   - Click **Deploy**.
   - Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycbx.../exec`).

6. **Connect with Web Dashboard**:
   - Open `web_dashboard/index.html` in your browser.
   - Click the **API Settings** button (gear icon) in the header.
   - Paste your Web App URL and click **Save & Connect**.
   - The dashboard will immediately synchronize with your live Google Sheet!

---

## 4. API Endpoints Reference

### GET Requests
- `GET ?action=getBeds` — Returns list of all beds.
- `GET ?action=getBeds&ward=ICU` — Filter beds by ward.
- `GET ?action=getBeds&floor=1` — Filter beds by floor.
- `GET ?action=getBeds&status=AVAILABLE` — Filter beds by status.
- `GET ?action=getBedById&bedId=ICU301` — Returns details for specific bed.
- `GET ?action=getStats` — Returns total, available, occupied, and percentage metrics.
- `GET ?action=getReport` — Returns complete ward-wise report.
- `GET ?action=getActivityLog` — Returns recent bed audit logs.

### POST Requests
- `POST action=updateBedStatus`
  ```json
  {
    "action": "updateBedStatus",
    "bed_id": "ICU301",
    "new_status": "MAINTENANCE",
    "user": "Nurse Station 1"
  }
  ```

- `POST action=admitPatient`
  ```json
  {
    "action": "admitPatient",
    "bed_id": "ICU301",
    "patient_id": "P1026",
    "patient_name": "Arun Kumar",
    "user": "Reception"
  }
  ```

- `POST action=dischargePatient`
  ```json
  {
    "action": "dischargePatient",
    "identifier": "ICU301",
    "user": "ICU Supervisor"
  }
  ```
