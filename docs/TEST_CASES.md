# Hospital Bed Monitoring System - Test Cases Report

**Course**: Semester 3 C Programming Mini Project  
**System Under Test**: Hospital Bed Monitoring System (C Core Engine & Web Dashboard)  
**Date of Testing**: Academic Session 2026-2027  
**Test Environment**: Windows OS, GCC 15.2.0 (C99), Modern Chromium/Edge Browser  

---

## 1. Test Execution Summary

| Total Test Cases | Passed | Failed | Blocked | Pass Percentage |
| :---: | :---: | :---: | :---: | :---: |
| **16** | **16** | **0** | **0** | **100%** |

---

## 2. Detailed Test Cases

### TC01: Search Valid Bed by ID
- **Module**: Search Module (`search.c`)
- **Test Objective**: Verify that entering an existing Bed ID returns complete bed details.
- **Input**: Bed ID = `ICU301`
- **Expected Result**: Displays Bed ID, Ward: `ICU`, Floor: `1`, Room: `ICU01`, Status: `AVAILABLE`, Patient ID: `-`, Last Updated time.
- **Actual Result**: Bed details printed in formatted card with exact matching attributes.
- **Status**: **PASS**

---

### TC02: Search Invalid Bed by ID
- **Module**: Search Module (`search.c`)
- **Test Objective**: Verify system displays a clear error when an unrecognized Bed ID is searched.
- **Input**: Bed ID = `XYZ999`
- **Expected Result**: Displays `ERROR: Bed ID not found.` without crashing or segfault.
- **Actual Result**: `ERROR: Bed ID not found.` displayed accurately; returned to search menu.
- **Status**: **PASS**

---

### TC03: Bed Status Transition (AVAILABLE &rarr; OCCUPIED via Direct Update)
- **Module**: Bed Status Management (`bed.c`)
- **Test Objective**: Prevent manual status override to OCCUPIED without patient admission details.
- **Input**: Bed ID = `ICU301`, New Status = `OCCUPIED`
- **Expected Result**: Validation rejection: `[ERROR] Cannot set bed to OCCUPIED without patient details. Please use Menu Option 8.`
- **Actual Result**: Transition blocked; informative error prompt displayed.
- **Status**: **PASS**

---

### TC04: Attempt Duplicate Status Update
- **Module**: Bed Status Management (`bed.c`)
- **Test Objective**: Reject redundant status updates when bed already has the specified status.
- **Input**: Bed ID = `ICU301`, Target Status = `AVAILABLE` (when already AVAILABLE)
- **Expected Result**: `Bed ICU301 is already AVAILABLE. [WARNING] No status change required.`
- **Actual Result**: Duplicate state update rejected cleanly; no write performed.
- **Status**: **PASS**

---

### TC05: Patient Admission to Available Bed
- **Module**: Patient Module (`patient.c`)
- **Test Objective**: Admit a patient to an available bed, updating bed status to OCCUPIED and storing patient ID.
- **Input**: Patient ID = `P1026`, Name = `Arun Kumar`, Bed ID = `ICU301`, Confirm = `Y`
- **Expected Result**: Patient record created, Bed status updated to `OCCUPIED`, `patient_id` set to `P1026`, activity logged.
- **Actual Result**: `[SUCCESS] Patient Arun Kumar (P1026) successfully admitted to Bed ICU301! Bed status changed: ICU301 -> OCCUPIED`.
- **Status**: **PASS**

---

### TC06: Attempt Admission to Already Occupied Bed
- **Module**: Patient Module (`patient.c`)
- **Test Objective**: Prevent admitting a patient to a bed that is already occupied.
- **Input**: Patient ID = `P1027`, Name = `Test Patient`, Bed ID = `G102` (Status: OCCUPIED by P1001)
- **Expected Result**: `[ERROR] Cannot admit patient. Bed G102 is already OCCUPIED by Patient P1001.`
- **Actual Result**: Admission refused; patient record not created; existing bed data preserved.
- **Status**: **PASS**

---

### TC07: Attempt Admission to Bed Under Cleaning
- **Module**: Patient Module (`patient.c`)
- **Test Objective**: Ensure safety rule that beds under sanitation/cleaning cannot receive patients.
- **Input**: Patient ID = `P1028`, Name = `Test Patient`, Bed ID = `G104` (Status: CLEANING)
- **Expected Result**: `[ERROR] Cannot admit patient. Bed G104 is under CLEANING/sanitization. Bed must be marked AVAILABLE first.`
- **Actual Result**: Admission blocked with sanitization safety warning.
- **Status**: **PASS**

---

### TC08: Patient Discharge Workflow
- **Module**: Patient Module (`patient.c`)
- **Test Objective**: Discharge an admitted patient and automatically transition bed to CLEANING.
- **Input**: Identifier = `P1026` (or `ICU301`), Confirm = `Y`
- **Expected Result**: Patient status updated to `DISCHARGED` with timestamp; Bed status transitioned to `CLEANING`; `patient_id` cleared to `-`.
- **Actual Result**: `[SUCCESS] Patient Arun Kumar (P1026) discharged successfully. Bed ICU301 status changed: OCCUPIED -> CLEANING`.
- **Status**: **PASS**

---

### TC09: Discharge Non-Existent or Inactive Patient
- **Module**: Patient Module (`patient.c`)
- **Test Objective**: Handle discharging an identifier that has no active admission.
- **Input**: Identifier = `P9999`
- **Expected Result**: `[ERROR] No active admitted patient found for identifier 'P9999'.`
- **Actual Result**: Displayed expected error message; system state unchanged.
- **Status**: **PASS**

---

### TC10: Filter Beds by Ward
- **Module**: Search/Filter Module (`search.c`)
- **Test Objective**: Filter and display only beds located in the ICU ward.
- **Input**: Ward = `ICU`
- **Expected Result**: Displays all 16 ICU beds (ICU301-ICU316) across Floors 1 and 2 with availability count.
- **Actual Result**: Output showed 16 ICU beds; summary correctly calculated available vs occupied beds.
- **Status**: **PASS**

---

### TC11: Filter Beds by Floor
- **Module**: Search/Filter Module (`search.c`)
- **Test Objective**: Display all beds situated on Ground Floor (Floor 0).
- **Input**: Floor = `0`
- **Expected Result**: Lists all 20 Ground Floor beds (General Ward G101-G112 and Emergency E201-E208).
- **Actual Result**: Formatted table displayed all 20 beds with floor summary.
- **Status**: **PASS**

---

### TC12: Add New Bed with Duplicate ID
- **Module**: Bed Module (`bed.c`)
- **Test Objective**: Ensure primary key constraint prevents adding a bed with an existing Bed ID.
- **Input**: Bed ID = `G101` (already exists), Ward = `General Ward`, Floor = `0`
- **Expected Result**: `[ERROR] Duplicate Bed ID 'G101' already exists in the system.`
- **Actual Result**: Bed addition aborted; count unchanged.
- **Status**: **PASS**

---

### TC13: Invalid Menu Option Handling
- **Module**: Main Loop (`main.c`)
- **Test Objective**: Ensure program gracefully handles invalid numeric or alphabetic choices without crashing or infinite looping.
- **Input**: Menu input = `99` and `abc`
- **Expected Result**: Clear error message: `[ERROR] Invalid menu choice. Please select an option between 0 and 13.` Prompt redisplayed.
- **Actual Result**: Buffer safely cleared; error displayed; menu re-rendered.
- **Status**: **PASS**

---

### TC14: Bed Report Generation & File Export
- **Module**: Report Module (`report.c`)
- **Test Objective**: Compute total, available, occupied, and ward-wise metrics, and persist to `reports/bed_report.txt`.
- **Input**: Menu Option = `10`
- **Expected Result**: On-screen report printed; file written to `reports/bed_report.txt` with correct percentage calculations.
- **Actual Result**: Bed report displayed and verified in `reports/bed_report.txt` (64 beds, 27 available, 42.2% availability rate).
- **Status**: **PASS**

---

### TC15: Empty Search Query Result in Web Dashboard
- **Module**: Web Frontend (`app.js`)
- **Test Objective**: Verify web dashboard displays user-friendly empty state card when search returns zero results.
- **Input**: Web Search Input = `NONEXISTENT_BED`
- **Expected Result**: Bed table body hidden; "No matching beds found. Try modifying your search query." card displayed.
- **Actual Result**: Empty state displayed instantly with icon and clear instruction.
- **Status**: **PASS**

---

### TC16: API Graceful Offline Fallback
- **Module**: Web API Layer (`api.js`)
- **Test Objective**: Verify frontend smoothly continues working with local mock storage if Google Apps Script URL is empty or unreachable.
- **Input**: Empty Google Apps Script URL or simulated network disconnect.
- **Expected Result**: System indicator reflects `SYSTEM ONLINE (LOCAL ENGINE)`; all operations (filter, admit, discharge, status update) succeed in LocalStorage.
- **Actual Result**: Operations executed smoothly in local storage without unhandled promise rejections or crashes.
- **Status**: **PASS**

---

### TC17: Live API Connection Health-Check & Latency Diagnostic
- **Module**: Web Diagnostic Engine (`BedAPI.testConnection()`)
- **Test Objective**: Ping deployed Google Apps Script endpoint and measure latency and bed count.
- **Input**: Live Web App URL ending in `/exec` &rarr; Click `⚡ Test Connection`.
- **Expected Result**: Diagnostic card displays `🟢 Connection Verified & Active`, round-trip latency (e.g. `180 ms`), and live beds verified.
- **Actual Result**: Status verified, latency calculated, and header badge updated to `ONLINE: GOOGLE SHEETS`.
- **Status**: **PASS**

---

### TC18: API URL Misconfiguration & Auth Detection
- **Module**: Web Diagnostic Engine (`BedAPI.testConnection()`)
- **Test Objective**: Detect when a student pastes an Apps Script Editor URL (`/edit`) or private permissions.
- **Input**: Editor URL (`https://script.google.com/macros/d/.../edit`).
- **Expected Result**: Rejection with specific guidance: `You provided the Apps Script Editor URL. You must deploy it as a Web App ending with '/exec'`.
- **Actual Result**: Specific actionable guidance displayed in the troubleshooting box without crashing.
- **Status**: **PASS**
