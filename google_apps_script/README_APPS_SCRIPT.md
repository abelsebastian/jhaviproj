# Complete Google Apps Script Setup & 1-Click Table Creator

This file guides you through creating all the tables, styles, and sample data in Google Sheets using **Google Apps Script**.

---

## ⚡ 1-Minute Setup Guide

### Step 1: Open Google Sheets
1. Open your web browser and go to: **[https://sheets.new](https://sheets.new)**
2. Rename the spreadsheet to: `Hospital_Bed_Monitoring_DB`

### Step 2: Open Apps Script Editor
1. In the Google Sheets top menu bar, click: **Extensions** > **Apps Script**.
2. A new tab will open with a code editor showing `Code.gs`.

### Step 3: Paste the Script
1. Delete any default code in `Code.gs`.
2. Copy and paste the entire code from **[`google_apps_script/Code.gs`](file:///D:/JHAVIPROJ/google_apps_script/Code.gs)** into the editor.
3. Click the **Save** icon (disk icon) or press `Ctrl + S`.

### Step 4: Run the Table Creator Function
1. In the toolbar at the top of Apps Script, find the function dropdown (it might say `myFunction` or `onOpen`).
2. Select **`createAndPopulateAllTables`**.
3. Click **Run** (play button ▶).
4. **Grant Permissions**:
   - Google will show an *"Authorization Required"* dialog.
   - Click **Review Permissions**.
   - Choose your Google Account.
   - Click **Advanced** (at the bottom left of the popup).
   - Click **Go to Hospital Bed System (unsafe)**.
   - Click **Allow**.
5. The script will execute in ~3 seconds.

---

## 🌟 What the Script Creates Automatically:

When `createAndPopulateAllTables` runs, it builds:

### 1. `Beds` Sheet (Table 1)
- Formats headers in **Deep Medical Blue** (`#0284c7`) with white bold text.
- Freezes row 1.
- Automatically inserts all **64 realistic sample beds** across Ground Floor, Floor 1, and Floor 2.
- Sets up **Automatic Color Coding** (Conditional Formatting) on the `Status` column:
  - 🟢 `AVAILABLE` (Soft Green)
  - 🔴 `OCCUPIED` (Soft Red)
  - 🟠 `CLEANING` (Soft Orange)
  - 🟣 `RESERVED` (Soft Purple)
  - ⚪ `MAINTENANCE` (Soft Gray)
- Auto-fits column widths.

### 2. `Patients` Sheet (Table 2)
- Formats headers.
- Populates the **25 currently admitted patients** assigned to the occupied beds (matching the C program records).

### 3. `Activity_Log` Sheet (Table 3)
- Creates the audit log with timestamped event columns: `Timestamp`, `Action`, `Bed_ID`, `Patient_ID`, `Previous_Status`, `New_Status`, `User`.

### 4. `Wards` Sheet (Table 4)
- Creates clinical capacity directory listing all 8 wards, floor levels, and bed capacities.

---

## 🏥 Custom In-Sheet Menu

When you return to your Google Sheet and refresh the page (`F5`), you will see a new menu in the top Google Sheets menu bar:

```
[File]  [Edit]  [View]  [Insert]  [Format] ... [🏥 Hospital Bed System]
```

Clicking **`🏥 Hospital Bed System`** gives you:
- **⚡ 1-Click Setup: Create Tables & Populate All Data**: Recreates or initializes all tables anytime.
- **📊 View Live Bed Statistics**: Opens an interactive modal dialog showing total beds, available, occupied, and availability rate!
- **📄 View Availability Report**: Opens an on-screen ward-wise breakdown modal!
- **🔄 Reset Database to Default 64 Beds**: Prompts confirmation to reset data.

---

## 🧮 Custom Formulas You Can Type in Google Sheets

You can type these custom functions directly into any cell:

| Formula | Description | Example Output |
|---|---|---|
| `=BED_COUNT()` | Returns total number of beds | `64` |
| `=BED_COUNT("AVAILABLE")` | Returns number of available beds | `27` |
| `=BED_COUNT("OCCUPIED")` | Returns number of occupied beds | `25` |
| `=BED_COUNT("CLEANING")` | Returns beds under cleaning | `6` |
| `=WARD_AVAILABLE_COUNT("ICU")` | Returns available beds in ICU | `6` |
| `=WARD_AVAILABLE_COUNT("Emergency")` | Returns available beds in Emergency | `3` |

---

## 🌐 Deploying as Web API (Connect to Web Dashboard)

To connect this Google Sheet to the Web Dashboard:
1. In Apps Script, click **Deploy** (blue button top right) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Description**: `Hospital Bed API v1`.
4. Set **Execute as**: `Me`.
5. Set **Who has access**: `Anyone`.
6. Click **Deploy**.
7. Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).
8. Open `web_dashboard/index.html` in your browser &rarr; Click **API Settings** &rarr; Paste your URL &rarr; Click **Save & Connect**.
