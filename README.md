# HOSPITAL BED MONITORING SYSTEM

> **Academic Project**: Semester 3 C Programming & Data Structures Mini Project  
> **Architecture**: Dual-Tier (C Core Logic Engine + Responsive Web Telemetry Dashboard)  
> **Database & Backend**: Google Sheets & Google Apps Script API (with Local Mock Storage fallback)

---

## 1. Project Overview

The **Hospital Bed Monitoring System** is a focused healthcare telemetry system designed to streamline bed allocation, tracking, and sanitization across hospital wards and floors.

The project strictly adheres to academic criteria:
- **Core Business Logic in C**: Implements structures, arrays, pointers, conditional validation, file I/O streams, searching, filtering, and report generation in modular C.
- **Modern Web Dashboard**: Provides receptionists, nurses, and hospital administrators with an intuitive interface featuring real-time statistics cards, floor-wise capacity meters, search filters, and modal workflows.
- **Cloud Database Integration**: Connected to Google Sheets via Google Apps Script for persistent, multi-device access.
- **Zero Heavy Dependencies**: Built with zero external dependencies (no React, no Node.js, no MongoDB, no Docker) — simple, lightweight, and easy to explain during academic viva examinations.

---

## 2. Directory Structure

```
d:/JHAVIPROJ/
├── hospital_bed_system/          # Core C Programming Application
│   ├── main.c                    # Interactive menu loop & workflow dispatch
│   ├── bed.h / bed.c             # Bed structure, sorting, validation & sample data
│   ├── patient.h / patient.c     # Admission & discharge state management
│   ├── search.h / search.c       # Search by ID/Ward/Room & filtering routines
│   ├── report.h / report.c       # Statistics aggregation & report file generation
│   ├── file.h / file.c           # Flat file persistence (fopen/fgets) & JSON export
│   ├── Makefile                  # Standard compilation script
│   ├── build.bat                 # 1-click Windows compilation & launch script
│   ├── data/                     # Persistent storage directory
│   │   ├── beds.txt              # Pipe-delimited bed records
│   │   ├── patients.txt          # Patient registry
│   │   └── activity_log.txt      # Audit trail
│   └── reports/                  # Generated reports directory
│       └── bed_report.txt        # Hospital availability audit report
│
├── web_dashboard/                # Modern Responsive Web Dashboard
│   ├── index.html                # Medical technology dashboard interface
│   ├── css/
│   │   └── styles.css            # Medical UI styling, badges & responsive CSS Grid
│   └── js/
│       ├── data.js               # 64 default sample beds matching C database
│       ├── api.js                # Google Apps Script client & LocalStorage engine
│       ├── app.js                # UI controller, filters, search & modals
│       └── data_live.json        # Exported JSON bridge from C engine
│
├── google_apps_script/           # Cloud API Backend
│   ├── Code.gs                   # Complete Apps Script code (doGet/doPost)
│   └── sheets_schema.md          # Google Sheets schema & deployment guide
│
├── docs/                         # Academic Documentation & Examination Assets
│   ├── ACADEMIC_PROJECT_REPORT.md# Complete 28-chapter formal academic report
│   ├── VIVA_VOCE_PREPARATION.md  # 25+ detailed Viva Voce questions & answers
│   └── TEST_CASES.md             # 16 comprehensive test cases with execution status
│
└── README.md                     # Master project documentation
```

---

## 3. Hospital Structure & Sample Data (64 Beds)

The system is pre-seeded with 64 beds distributed across 3 floors and 6 clinical wards:

- **Ground Floor (Floor 0)**:
  - *General Ward*: 12 beds (`G101` to `G112`)
  - *Emergency*: 8 beds (`E201` to `E208`)
- **First Floor (Floor 1)**:
  - *General Ward*: 8 beds (`G201` to `G208`)
  - *ICU*: 10 beds (`ICU301` to `ICU310`)
  - *Pediatric*: 6 beds (`P401` to `P406`)
- **Second Floor (Floor 2)**:
  - *Surgical Ward*: 8 beds (`S501` to `S508`)
  - *Maternity*: 6 beds (`M601` to `M606`)
  - *ICU*: 6 beds (`ICU311` to `ICU316`)

### Supported Statuses & Color Badges:
- **`AVAILABLE`** (Green): Vacant, sanitized, ready for patient admission.
- **`OCCUPIED`** (Red): Assigned to an admitted patient.
- **`CLEANING`** (Orange): Discharged; undergoing environmental sanitization.
- **`RESERVED`** (Purple): Held for incoming emergency/surgery transfers.
- **`MAINTENANCE`** (Gray): Bio-medical equipment repair or room maintenance.

---

## 4. How to Run the C Program

### Prerequisites:
- Any standard C compiler (GCC, Clang, or MSVC).

### Option A: Using Windows Batch Script (Easiest)
1. Open PowerShell or Command Prompt.
2. Navigate to `hospital_bed_system`:
   ```cmd
   cd d:\JHAVIPROJ\hospital_bed_system
   ```
3. Run:
   ```cmd
   .\build.bat
   ```

### Option B: Using GCC directly
```bash
cd d:\JHAVIPROJ\hospital_bed_system
gcc -Wall -Wextra -std=c99 main.c bed.c patient.c search.c report.c file.c -o hospital_bed_system.exe
.\hospital_bed_system.exe
```

### Option C: Using Make
```bash
cd d:\JHAVIPROJ\hospital_bed_system
make run
```

---

## 5. How to Run the Web Dashboard

1. Navigate to `d:\JHAVIPROJ\web_dashboard`.
2. Open `index.html` in any web browser (Chrome, Edge, Firefox, Safari).
3. **Instant Demo Mode**: The dashboard loads immediately with 64 pre-configured beds, dynamic statistics, live search, and activity logs powered by the built-in browser engine. No web server or configuration is needed for immediate demonstration.

---

## 6. How to Connect Google Sheets & Google Apps Script

To connect the dashboard with Google Sheets:
1. Create a new Google Sheet at [sheets.new](https://sheets.new) named `Hospital_Bed_Monitoring_DB`.
2. Open **Extensions** > **Apps Script**.
3. Replace the contents of `Code.gs` with the code in [`google_apps_script/Code.gs`](file:///D:/JHAVIPROJ/google_apps_script/Code.gs).
4. Run `seedInitialDatabase` once in Apps Script to automatically build and seed all 4 sheets (`Beds`, `Patients`, `Activity_Log`, `Wards`).
5. Deploy as **Web App** (Execute as: *Me*, Who has access: *Anyone*).
6. In the Web Dashboard, click **API Settings** (gear icon) and paste your Web App URL.

*(See [`google_apps_script/sheets_schema.md`](file:///D:/JHAVIPROJ/google_apps_script/sheets_schema.md) for full step-by-step instructions).*

---

## 7. Clinical Workflow Demonstration Guide

### Demonstration 1: Search Bed by ID
1. In C Terminal: Select `3` (Search Bed) &rarr; `1` (Search by Bed ID) &rarr; Enter `ICU301`.
2. Observe: Bed details displayed with status `AVAILABLE`.
3. In Web Dashboard: Type `ICU301` into the search bar. The table immediately filters to `ICU301`.

### Demonstration 2: Admit Patient
1. In C Terminal: Select `8` (Patient Admission).
2. Enter Patient ID: `P1026`, Name: `Arun Kumar`, Bed ID: `ICU301`, Confirm: `Y`.
3. Observe: Bed `ICU301` status changes to `OCCUPIED`.
4. In Web Dashboard: Click **Admit Patient**, enter ID, Name, and choose bed `ICU301`. Observe the red badge and counter updates.

### Demonstration 3: Clinical Discharge & Sanitization
1. In C Terminal: Select `9` (Patient Discharge) &rarr; Enter `ICU301` &rarr; Confirm: `Y`.
2. Observe: Bed `ICU301` transitions from `OCCUPIED` &rarr; `CLEANING` (Bed cannot be re-occupied until sanitized!).
3. In Web Dashboard: Click **Manage** on `ICU301` &rarr; Notice status is `CLEANING` with patient cleared.

### Demonstration 4: Duplicate Update Validation
1. In C Terminal: Select `4` (Update Bed Status) &rarr; Enter `ICU301` &rarr; Select `3` (`CLEANING`).
2. Observe validation warning:
   ```
   Bed ICU301 is already CLEANING.
   [WARNING] No status change required.
   ```

### Demonstration 5: Capacity Report Generation
1. In C Terminal: Select `10` (Generate Report).
2. Observe formatted breakdown by ward and availability rate. File saved to `reports/bed_report.txt`.

---

## 8. Academic Deliverables & Documentation Index

- **Formal 28-Chapter Report**: [`docs/ACADEMIC_PROJECT_REPORT.md`](file:///D:/JHAVIPROJ/docs/ACADEMIC_PROJECT_REPORT.md)
- **16 Detailed Test Cases**: [`docs/TEST_CASES.md`](file:///D:/JHAVIPROJ/docs/TEST_CASES.md)
- **25+ Viva Voce Questions & Answers**: [`docs/VIVA_VOCE_PREPARATION.md`](file:///D:/JHAVIPROJ/docs/VIVA_VOCE_PREPARATION.md)
- **Google Sheets Database Guide**: [`google_apps_script/sheets_schema.md`](file:///D:/JHAVIPROJ/google_apps_script/sheets_schema.md)
- **C Source Code Directory**: [`hospital_bed_system/`](file:///D:/JHAVIPROJ/hospital_bed_system/)
- **Web Dashboard Directory**: [`web_dashboard/`](file:///D:/JHAVIPROJ/web_dashboard/)
