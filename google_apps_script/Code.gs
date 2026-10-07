/**
 * ==============================================================================
 * HOSPITAL BED MONITORING SYSTEM - ALL-IN-ONE GOOGLE APPS SCRIPT
 * Semester 3 C Programming Mini Project - Cloud Database & REST API Backend
 * ==============================================================================
 * 
 * FEATURES IN THIS SCRIPT:
 * 1. onOpen() Menu: Adds "🏥 Hospital Bed System" menu right in Google Sheets UI!
 * 2. createAndPopulateAllTables(): 1-Click creation of all 4 tables with professional
 *    headers, column sizing, frozen rows, color-coded conditional formatting,
 *    and 64 preloaded sample beds matching the C program data.
 * 3. In-Sheet Custom Functions: =BED_COUNT(status), =WARD_AVAILABLE_COUNT(ward)
 * 4. In-Sheet UI Modals: View statistics and reports inside Google Sheets.
 * 5. RESTful JSON API: Complete doGet() and doPost() endpoints for Web Dashboard.
 * ==============================================================================
 */

// Global Sheet Table Names
var SHEET_BEDS = "Beds";
var SHEET_PATIENTS = "Patients";
var SHEET_ACTIVITY = "Activity_Log";
var SHEET_WARDS = "Wards";

/**
 * ------------------------------------------------------------------------------
 * 1. UI MENU TRIGGER (Appears automatically when spreadsheet is opened)
 * ------------------------------------------------------------------------------
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🏥 Hospital Bed System')
      .addItem('⚡ 1-Click Setup: Create Tables & Populate All Data', 'createAndPopulateAllTables')
      .addSeparator()
      .addItem('📊 View Live Bed Statistics', 'showStatisticsDialog')
      .addItem('📄 View Availability Report', 'generateAndShowReport')
      .addSeparator()
      .addItem('🔄 Reset Database to Default 64 Beds', 'resetDatabasePrompt')
      .addToUi();
  } catch (e) {
    // Suppress if running in headless context
  }
}

/**
 * ------------------------------------------------------------------------------
 * 2. MASTER FUNCTION: CREATE TABLES, FORMAT, & POPULATE DATA
 * ------------------------------------------------------------------------------
 * Run this function from the Apps Script editor or from the Sheets menu to build
 * all 4 database tables, apply colors and styles, and populate all 64 beds!
 */
function createAndPopulateAllTables() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- TABLE 1: BEDS ---
  var bedSheet = getOrCreateSheet(SHEET_BEDS);
  bedSheet.clear();
  
  // Headers
  var bedHeaders = ["Bed_ID", "Ward", "Floor", "Room", "Status", "Patient_ID", "Last_Updated"];
  bedSheet.appendRow(bedHeaders);
  formatHeaderRow(bedSheet, 7);

  // 64 Sample Beds Data (matching the C core system)
  var sampleBeds = [
    // Ground Floor (Floor 0): General Ward (12 beds)
    ["G101", "General Ward", 0, "G01", "AVAILABLE", "-", "10:00 AM"],
    ["G102", "General Ward", 0, "G01", "OCCUPIED", "P1001", "10:00 AM"],
    ["G103", "General Ward", 0, "G01", "AVAILABLE", "-", "10:00 AM"],
    ["G104", "General Ward", 0, "G02", "CLEANING", "-", "10:00 AM"],
    ["G105", "General Ward", 0, "G02", "OCCUPIED", "P1002", "10:00 AM"],
    ["G106", "General Ward", 0, "G02", "AVAILABLE", "-", "10:00 AM"],
    ["G107", "General Ward", 0, "G03", "OCCUPIED", "P1003", "10:00 AM"],
    ["G108", "General Ward", 0, "G03", "AVAILABLE", "-", "10:00 AM"],
    ["G109", "General Ward", 0, "G03", "RESERVED", "-", "10:00 AM"],
    ["G110", "General Ward", 0, "G04", "OCCUPIED", "P1004", "10:00 AM"],
    ["G111", "General Ward", 0, "G04", "AVAILABLE", "-", "10:00 AM"],
    ["G112", "General Ward", 0, "G04", "MAINTENANCE", "-", "10:00 AM"],

    // Ground Floor (Floor 0): Emergency (8 beds)
    ["E201", "Emergency", 0, "EMG01", "AVAILABLE", "-", "10:00 AM"],
    ["E202", "Emergency", 0, "EMG01", "OCCUPIED", "P1005", "10:00 AM"],
    ["E203", "Emergency", 0, "EMG01", "AVAILABLE", "-", "10:00 AM"],
    ["E204", "Emergency", 0, "EMG02", "OCCUPIED", "P1006", "10:00 AM"],
    ["E205", "Emergency", 0, "EMG02", "OCCUPIED", "P1007", "10:00 AM"],
    ["E206", "Emergency", 0, "EMG02", "CLEANING", "-", "10:00 AM"],
    ["E207", "Emergency", 0, "EMG03", "AVAILABLE", "-", "10:00 AM"],
    ["E208", "Emergency", 0, "EMG03", "OCCUPIED", "P1008", "10:00 AM"],

    // First Floor (Floor 1): General Ward (8 beds)
    ["G201", "General Ward", 1, "G11", "AVAILABLE", "-", "10:00 AM"],
    ["G202", "General Ward", 1, "G11", "OCCUPIED", "P1009", "10:00 AM"],
    ["G203", "General Ward", 1, "G11", "OCCUPIED", "P1010", "10:00 AM"],
    ["G204", "General Ward", 1, "G12", "AVAILABLE", "-", "10:00 AM"],
    ["G205", "General Ward", 1, "G12", "CLEANING", "-", "10:00 AM"],
    ["G206", "General Ward", 1, "G12", "OCCUPIED", "P1011", "10:00 AM"],
    ["G207", "General Ward", 1, "G13", "AVAILABLE", "-", "10:00 AM"],
    ["G208", "General Ward", 1, "G13", "RESERVED", "-", "10:00 AM"],

    // First Floor (Floor 1): ICU (10 beds)
    ["ICU301", "ICU", 1, "ICU01", "AVAILABLE", "-", "10:00 AM"],
    ["ICU302", "ICU", 1, "ICU01", "OCCUPIED", "P1012", "10:00 AM"],
    ["ICU303", "ICU", 1, "ICU02", "OCCUPIED", "P1013", "10:00 AM"],
    ["ICU304", "ICU", 1, "ICU02", "AVAILABLE", "-", "10:00 AM"],
    ["ICU305", "ICU", 1, "ICU03", "OCCUPIED", "P1014", "10:00 AM"],
    ["ICU306", "ICU", 1, "ICU03", "CLEANING", "-", "10:00 AM"],
    ["ICU307", "ICU", 1, "ICU04", "OCCUPIED", "P1015", "10:00 AM"],
    ["ICU308", "ICU", 1, "ICU04", "AVAILABLE", "-", "10:00 AM"],
    ["ICU309", "ICU", 1, "ICU05", "OCCUPIED", "P1016", "10:00 AM"],
    ["ICU310", "ICU", 1, "ICU05", "MAINTENANCE", "-", "10:00 AM"],

    // First Floor (Floor 1): Pediatric (6 beds)
    ["P401", "Pediatric", 1, "PED01", "AVAILABLE", "-", "10:00 AM"],
    ["P402", "Pediatric", 1, "PED01", "OCCUPIED", "P1017", "10:00 AM"],
    ["P403", "Pediatric", 1, "PED02", "AVAILABLE", "-", "10:00 AM"],
    ["P404", "Pediatric", 1, "PED02", "OCCUPIED", "P1018", "10:00 AM"],
    ["P405", "Pediatric", 1, "PED03", "AVAILABLE", "-", "10:00 AM"],
    ["P406", "Pediatric", 1, "PED03", "RESERVED", "-", "10:00 AM"],

    // Second Floor (Floor 2): Surgical Ward (8 beds)
    ["S501", "Surgical Ward", 2, "SUR01", "AVAILABLE", "-", "10:00 AM"],
    ["S502", "Surgical Ward", 2, "SUR01", "OCCUPIED", "P1019", "10:00 AM"],
    ["S503", "Surgical Ward", 2, "SUR01", "AVAILABLE", "-", "10:00 AM"],
    ["S504", "Surgical Ward", 2, "SUR02", "OCCUPIED", "P1020", "10:00 AM"],
    ["S505", "Surgical Ward", 2, "SUR02", "CLEANING", "-", "10:00 AM"],
    ["S506", "Surgical Ward", 2, "SUR02", "AVAILABLE", "-", "10:00 AM"],
    ["S507", "Surgical Ward", 2, "SUR03", "OCCUPIED", "P1021", "10:00 AM"],
    ["S508", "Surgical Ward", 2, "SUR03", "AVAILABLE", "-", "10:00 AM"],

    // Second Floor (Floor 2): Maternity (6 beds)
    ["M601", "Maternity", 2, "MAT01", "AVAILABLE", "-", "10:00 AM"],
    ["M602", "Maternity", 2, "MAT01", "OCCUPIED", "P1022", "10:00 AM"],
    ["M603", "Maternity", 2, "MAT02", "AVAILABLE", "-", "10:00 AM"],
    ["M604", "Maternity", 2, "MAT02", "OCCUPIED", "P1023", "10:00 AM"],
    ["M605", "Maternity", 2, "MAT03", "CLEANING", "-", "10:00 AM"],
    ["M606", "Maternity", 2, "MAT03", "AVAILABLE", "-", "10:00 AM"],

    // Second Floor (Floor 2): ICU (6 beds)
    ["ICU311", "ICU", 2, "ICU06", "AVAILABLE", "-", "10:00 AM"],
    ["ICU312", "ICU", 2, "ICU06", "OCCUPIED", "P1024", "10:00 AM"],
    ["ICU313", "ICU", 2, "ICU07", "OCCUPIED", "P1025", "10:00 AM"],
    ["ICU314", "ICU", 2, "ICU07", "AVAILABLE", "-", "10:00 AM"],
    ["ICU315", "ICU", 2, "ICU08", "RESERVED", "-", "10:00 AM"],
    ["ICU316", "ICU", 2, "ICU08", "AVAILABLE", "-", "10:00 AM"]
  ];

  bedSheet.getRange(2, 1, sampleBeds.length, 7).setValues(sampleBeds);
  applyBedStatusConditionalFormatting(bedSheet, sampleBeds.length + 1);
  autoFitColumns(bedSheet, 7);

  // --- TABLE 2: PATIENTS ---
  var patSheet = getOrCreateSheet(SHEET_PATIENTS);
  patSheet.clear();
  var patHeaders = ["Patient_ID", "Patient_Name", "Bed_ID", "Admission_Time", "Discharge_Time", "Status"];
  patSheet.appendRow(patHeaders);
  formatHeaderRow(patSheet, 6);

  var samplePatients = [
    ["P1001", "Ramesh Sharma", "G102", "08:15 AM", "-", "ADMITTED"],
    ["P1002", "Priya Nair", "G105", "09:30 AM", "-", "ADMITTED"],
    ["P1003", "Anand Kulkarni", "G107", "09:45 AM", "-", "ADMITTED"],
    ["P1004", "Sunita Menon", "G110", "10:10 AM", "-", "ADMITTED"],
    ["P1005", "David Joseph", "E202", "07:20 AM", "-", "ADMITTED"],
    ["P1006", "Kavita Verma", "E204", "08:05 AM", "-", "ADMITTED"],
    ["P1007", "Mohammed Rafi", "E205", "08:50 AM", "-", "ADMITTED"],
    ["P1008", "Deepak Gupta", "E208", "09:15 AM", "-", "ADMITTED"],
    ["P1009", "Meera Sen", "G202", "06:40 AM", "-", "ADMITTED"],
    ["P1010", "Vikram Patel", "G203", "07:10 AM", "-", "ADMITTED"],
    ["P1011", "Sneha Rao", "G206", "08:25 AM", "-", "ADMITTED"],
    ["P1012", "Arun Kumar", "ICU302", "05:15 AM", "-", "ADMITTED"],
    ["P1013", "Lakshmi Iyer", "ICU303", "06:00 AM", "-", "ADMITTED"],
    ["P1014", "Rajesh Pillai", "ICU305", "07:45 AM", "-", "ADMITTED"],
    ["P1015", "Anita Roy", "ICU307", "08:30 AM", "-", "ADMITTED"],
    ["P1016", "Suresh Deshmukh", "ICU309", "09:10 AM", "-", "ADMITTED"],
    ["P1017", "Master Aryan (Ped)", "P402", "08:00 AM", "-", "ADMITTED"],
    ["P1018", "Baby Diya (Ped)", "P404", "09:20 AM", "-", "ADMITTED"],
    ["P1019", "George Thomas", "S502", "07:35 AM", "-", "ADMITTED"],
    ["P1020", "Fatima Begum", "S504", "08:10 AM", "-", "ADMITTED"],
    ["P1021", "Bala Chandran", "S507", "09:05 AM", "-", "ADMITTED"],
    ["P1022", "Pooja Hegde", "M602", "06:50 AM", "-", "ADMITTED"],
    ["P1023", "Shalini Reddy", "M604", "08:40 AM", "-", "ADMITTED"],
    ["P1024", "Karthik Krishnan", "ICU312", "07:15 AM", "-", "ADMITTED"],
    ["P1025", "Manoj Nambiar", "ICU313", "08:20 AM", "-", "ADMITTED"]
  ];
  patSheet.getRange(2, 1, samplePatients.length, 6).setValues(samplePatients);
  autoFitColumns(patSheet, 6);

  // --- TABLE 3: ACTIVITY LOG ---
  var actSheet = getOrCreateSheet(SHEET_ACTIVITY);
  actSheet.clear();
  var actHeaders = ["Timestamp", "Action", "Bed_ID", "Patient_ID", "Previous_Status", "New_Status", "User"];
  actSheet.appendRow(actHeaders);
  formatHeaderRow(actSheet, 7);

  var sampleLogs = [
    ["10:00 AM", "SYSTEM_INIT", "ALL", "-", "-", "SYSTEM_ONLINE", "System Admin"],
    ["09:45 AM", "ADMISSION", "G107", "P1003", "AVAILABLE", "OCCUPIED", "Reception"],
    ["09:30 AM", "ADMISSION", "G105", "P1002", "AVAILABLE", "OCCUPIED", "Reception"],
    ["09:15 AM", "UPDATE_STATUS", "G104", "-", "OCCUPIED", "CLEANING", "Nursing Dept"]
  ];
  actSheet.getRange(2, 1, sampleLogs.length, 7).setValues(sampleLogs);
  autoFitColumns(actSheet, 7);

  // --- TABLE 4: WARDS ---
  var wardSheet = getOrCreateSheet(SHEET_WARDS);
  wardSheet.clear();
  var wardHeaders = ["Ward_ID", "Ward_Name", "Floor", "Total_Beds"];
  wardSheet.appendRow(wardHeaders);
  formatHeaderRow(wardSheet, 4);

  var sampleWards = [
    ["W01", "General Ward", 0, 12],
    ["W02", "Emergency", 0, 8],
    ["W03", "General Ward", 1, 8],
    ["W04", "ICU", 1, 10],
    ["W05", "Pediatric", 1, 6],
    ["W06", "Surgical Ward", 2, 8],
    ["W07", "Maternity", 2, 6],
    ["W08", "ICU", 2, 6]
  ];
  wardSheet.getRange(2, 1, sampleWards.length, 4).setValues(sampleWards);
  autoFitColumns(wardSheet, 4);

  // Remove default unused "Sheet1" if present
  try {
    var defSheet = ss.getSheetByName("Sheet1");
    if (defSheet && ss.getSheets().length > 1) {
      ss.deleteSheet(defSheet);
    }
  } catch (err) {}

  // Set Beds as active front sheet
  ss.setActiveSheet(bedSheet);

  var msg = "✅ All 4 Hospital Tables (Beds, Patients, Activity_Log, Wards) created and populated with 64 beds successfully!";
  try {
    SpreadsheetApp.getUi().alert("Setup Complete", msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    Logger.log(msg);
  }

  return { success: true, message: msg };
}

/**
 * Helper: Format Table Header Row with Professional Medical Theme
 */
function formatHeaderRow(sheet, numCols) {
  sheet.setFrozenRows(1);
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setBackground("#0284c7") // Medical Blue
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);
}

/**
 * Helper: Apply Conditional Formatting to Status Column (Column E)
 */
function applyBedStatusConditionalFormatting(sheet, numRows) {
  var range = sheet.getRange(2, 5, numRows, 1); // Column E: Status

  var ruleAvailable = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("AVAILABLE")
    .setBackground("#dcfce7")
    .setFontColor("#166534")
    .setRanges([range])
    .build();

  var ruleOccupied = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("OCCUPIED")
    .setBackground("#fee2e2")
    .setFontColor("#991b1b")
    .setRanges([range])
    .build();

  var ruleCleaning = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("CLEANING")
    .setBackground("#ffedd5")
    .setFontColor("#9a3412")
    .setRanges([range])
    .build();

  var ruleReserved = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("RESERVED")
    .setBackground("#f3e8ff")
    .setFontColor("#6b21a8")
    .setRanges([range])
    .build();

  var ruleMaintenance = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("MAINTENANCE")
    .setBackground("#f1f5f9")
    .setFontColor("#334155")
    .setRanges([range])
    .build();

  sheet.setConditionalFormatRules([ruleAvailable, ruleOccupied, ruleCleaning, ruleReserved, ruleMaintenance]);
}

/**
 * Helper: Auto-fit column widths
 */
function autoFitColumns(sheet, numCols) {
  for (var col = 1; col <= numCols; col++) {
    sheet.autoResizeColumn(col);
  }
}

/**
 * Helper: Find or create sheet by name
 */
function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Reset confirmation prompt from menu
 */
function resetDatabasePrompt() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.alert("Reset Hospital Database", "Are you sure you want to reset all 64 beds and sample patients?", ui.ButtonSet.YES_NO);
  if (res == ui.Button.YES) {
    createAndPopulateAllTables();
  }
}

/**
 * ------------------------------------------------------------------------------
 * 3. IN-SHEET CUSTOM FUNCTIONS (Usable directly in cell formulas)
 * ------------------------------------------------------------------------------
 */

/**
 * Returns the count of beds by status (e.g. =BED_COUNT("AVAILABLE") or =BED_COUNT())
 * @param {string} status Optional: "AVAILABLE", "OCCUPIED", "CLEANING", etc.
 * @return {number} Count of beds
 * @customfunction
 */
function BED_COUNT(status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_BEDS);
  if (!sheet) return 0;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 0;

  if (!status || status === "" || status === "ALL") {
    return data.length - 1;
  }

  var count = 0;
  var target = String(status).toUpperCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][4]).toUpperCase() === target) {
      count++;
    }
  }
  return count;
}

/**
 * Returns available bed count in a given ward (e.g. =WARD_AVAILABLE_COUNT("ICU"))
 * @param {string} wardName Name of ward
 * @return {number} Count of available beds
 * @customfunction
 */
function WARD_AVAILABLE_COUNT(wardName) {
  if (!wardName) return 0;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_BEDS);
  if (!sheet) return 0;
  var data = sheet.getDataRange().getValues();
  var count = 0;
  var targetWard = String(wardName).toLowerCase();

  for (var i = 1; i < data.length; i++) {
    var ward = String(data[i][1]).toLowerCase();
    var status = String(data[i][4]).toUpperCase();
    if (ward.indexOf(targetWard) !== -1 && status === "AVAILABLE") {
      count++;
    }
  }
  return count;
}

/**
 * ------------------------------------------------------------------------------
 * 4. IN-SHEET UI POPUP DIALOGS (View Stats & Reports without leaving Sheets)
 * ------------------------------------------------------------------------------
 */
function showStatisticsDialog() {
  var stats = handleGetStats().stats;
  var html = '<div style="font-family: Arial, sans-serif; padding: 15px;">' +
    '<h3 style="color: #0284c7; margin-top: 0;">🏥 Hospital Bed Statistics</h3>' +
    '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
    '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Total Beds:</td><td style="font-weight: bold; text-align: right;">' + stats.total + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px; color: #166534;">Available Beds:</td><td style="font-weight: bold; text-align: right; color: #166534;">' + stats.available + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px; color: #991b1b;">Occupied Beds:</td><td style="font-weight: bold; text-align: right; color: #991b1b;">' + stats.occupied + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px; color: #9a3412;">Cleaning Beds:</td><td style="font-weight: bold; text-align: right; color: #9a3412;">' + stats.cleaning + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px; color: #6b21a8;">Reserved Beds:</td><td style="font-weight: bold; text-align: right; color: #6b21a8;">' + stats.reserved + '</td></tr>' +
    '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px; color: #475569;">Maintenance Beds:</td><td style="font-weight: bold; text-align: right; color: #475569;">' + stats.maintenance + '</td></tr>' +
    '</table>' +
    '<div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 6px; font-size: 13px;">' +
    '<div>Availability Rate: <strong>' + stats.availability_rate + '%</strong></div>' +
    '<div>Occupancy Rate: <strong>' + stats.occupancy_rate + '%</strong></div>' +
    '</div></div>';

  var htmlOutput = HtmlService.createHtmlOutput(html).setWidth(350).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'System Capacity Overview');
}

function generateAndShowReport() {
  var rep = handleGetReport();
  var rows = "";
  rep.ward_report.forEach(function(w) {
    var pct = w.total > 0 ? Math.round((w.available / w.total) * 100) : 0;
    rows += '<tr><td style="padding: 6px; border-bottom: 1px solid #eee;">' + w.ward + '</td>' +
      '<td style="text-align: center; border-bottom: 1px solid #eee;">' + w.total + '</td>' +
      '<td style="text-align: center; color: #166534; font-weight: bold; border-bottom: 1px solid #eee;">' + w.available + '</td>' +
      '<td style="text-align: center; color: #991b1b; border-bottom: 1px solid #eee;">' + w.occupied + '</td>' +
      '<td style="text-align: right; border-bottom: 1px solid #eee;">' + pct + '%</td></tr>';
  });

  var html = '<div style="font-family: Arial, sans-serif; padding: 10px;">' +
    '<h3 style="color: #0284c7; margin-top: 0;">Hospital Ward Availability Report</h3>' +
    '<div style="font-size: 12px; color: #666; margin-bottom: 12px;">Audited at: ' + rep.generated_at + '</div>' +
    '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">' +
    '<tr style="background: #f1f5f9;"><th style="padding: 6px; text-align: left;">Ward</th><th>Total</th><th>Avail</th><th>Occ</th><th style="text-align: right;">Rate</th></tr>' +
    rows + '</table>' +
    '<div style="margin-top: 15px; font-size: 13px; text-align: right;">Overall Availability: <strong>' + rep.stats.availability_rate + '%</strong></div></div>';

  var htmlOutput = HtmlService.createHtmlOutput(html).setWidth(480).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Ward Availability Report');
}

/**
 * ------------------------------------------------------------------------------
 * 5. RESTFUL JSON API ENDPOINTS (HTTP GET & POST FOR WEB DASHBOARD)
 * ------------------------------------------------------------------------------
 */

function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "getBeds";

    var result;
    switch (action) {
      case "getBeds":
        result = handleGetBeds(params);
        break;
      case "getBedById":
        result = handleGetBedById(params.bedId);
        break;
      case "getStats":
        result = handleGetStats();
        break;
      case "getReport":
        result = handleGetReport();
        break;
      case "getActivityLog":
        result = handleGetActivityLog();
        break;
      case "ping":
        result = {
          success: true,
          message: "Hospital Bed Monitoring API is online",
          timestamp: new Date().toISOString(),
          spreadsheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),
          sheets_available: [SHEET_BEDS, SHEET_PATIENTS, SHEET_ACTIVITY, SHEET_WARDS]
        };
        break;
      case "seedDatabase":
      case "createTables":
        result = createAndPopulateAllTables();
        break;
      default:
        result = { success: false, message: "Unknown action: " + action };
        break;
    }

    return respondJson(result);
  } catch (err) {
    return respondJson({ success: false, message: "Server error: " + err.toString() });
  }
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (ex) {
        data = e.parameter;
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "";
    var result;

    switch (action) {
      case "updateBedStatus":
        result = handleUpdateBedStatus(data);
        break;
      case "admitPatient":
        result = handleAdmitPatient(data);
        break;
      case "dischargePatient":
        result = handleDischargePatient(data);
        break;
      case "addBed":
        result = handleAddBed(data);
        break;
      case "seedDatabase":
      case "createTables":
        result = createAndPopulateAllTables();
        break;
      default:
        result = { success: false, message: "Unknown POST action: " + action };
        break;
    }

    return respondJson(result);
  } catch (err) {
    return respondJson({ success: false, message: "Server error: " + err.toString() });
  }
}

function respondJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetBeds(params) {
  var sheet = getOrCreateSheet(SHEET_BEDS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: true, count: 0, beds: [] };
  }

  var beds = [];
  var filterWard = params.ward ? params.ward.toLowerCase() : null;
  var filterFloor = params.floor !== undefined && params.floor !== "" && params.floor !== "all" ? parseInt(params.floor, 10) : null;
  var filterStatus = params.status && params.status !== "all" ? params.status.toUpperCase() : null;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var bed = {
      bed_id: String(row[0]),
      ward: String(row[1]),
      floor: parseInt(row[2], 10),
      room: String(row[3]),
      status: String(row[4]),
      patient_id: String(row[5]),
      last_updated: String(row[6])
    };

    if (filterWard && bed.ward.toLowerCase().indexOf(filterWard) === -1) continue;
    if (filterFloor !== null && bed.floor !== filterFloor) continue;
    if (filterStatus && bed.status !== filterStatus) continue;

    beds.push(bed);
  }

  return { success: true, count: beds.length, beds: beds };
}

function handleGetBedById(bedId) {
  if (!bedId) return { success: false, message: "Bed ID is required" };
  var sheet = getOrCreateSheet(SHEET_BEDS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(bedId).toUpperCase()) {
      var bed = {
        bed_id: String(data[i][0]),
        ward: String(data[i][1]),
        floor: parseInt(data[i][2], 10),
        room: String(data[i][3]),
        status: String(data[i][4]),
        patient_id: String(data[i][5]),
        last_updated: String(data[i][6])
      };
      return { success: true, bed: bed };
    }
  }

  return { success: false, message: "Bed ID not found" };
}

function handleGetStats() {
  var bedsResp = handleGetBeds({});
  var beds = bedsResp.beds || [];

  var stats = {
    total: beds.length,
    available: 0,
    occupied: 0,
    cleaning: 0,
    reserved: 0,
    maintenance: 0,
    availability_rate: 0,
    occupancy_rate: 0
  };

  beds.forEach(function(b) {
    if (b.status === "AVAILABLE") stats.available++;
    else if (b.status === "OCCUPIED") stats.occupied++;
    else if (b.status === "CLEANING") stats.cleaning++;
    else if (b.status === "RESERVED") stats.reserved++;
    else if (b.status === "MAINTENANCE") stats.maintenance++;
  });

  if (stats.total > 0) {
    stats.availability_rate = Math.round((stats.available / stats.total) * 1000) / 10;
    stats.occupancy_rate = Math.round((stats.occupied / stats.total) * 1000) / 10;
  }

  return { success: true, stats: stats };
}

function handleUpdateBedStatus(data) {
  var bedId = data.bed_id || data.bedId;
  var newStatus = (data.new_status || data.newStatus || "").toUpperCase();
  var user = data.user || "Staff";

  if (!bedId) return { success: false, message: "Bed ID is required" };
  var validStatuses = ["AVAILABLE", "OCCUPIED", "CLEANING", "RESERVED", "MAINTENANCE"];
  if (validStatuses.indexOf(newStatus) === -1) {
    return { success: false, message: "Invalid status: " + newStatus };
  }

  var sheet = getOrCreateSheet(SHEET_BEDS);
  var rows = sheet.getDataRange().getValues();
  var targetRow = -1;
  var currentStatus = "";
  var patientId = "-";

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(bedId).toUpperCase()) {
      targetRow = i + 1;
      currentStatus = String(rows[i][4]);
      patientId = String(rows[i][5]);
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, message: "Bed ID not found" };
  }

  if (currentStatus === newStatus) {
    return {
      success: false,
      message: "Bed " + bedId + " is already " + newStatus + ". No status change required."
    };
  }

  if (newStatus === "OCCUPIED" && (patientId === "-" || patientId === "")) {
    return {
      success: false,
      message: "Cannot mark bed as OCCUPIED without patient admission details."
    };
  }

  var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "hh:mm a");

  sheet.getRange(targetRow, 5).setValue(newStatus);
  sheet.getRange(targetRow, 7).setValue(timeStr);

  if (newStatus === "AVAILABLE" || newStatus === "CLEANING") {
    if (currentStatus !== "OCCUPIED") {
      sheet.getRange(targetRow, 6).setValue("-");
    }
  }

  logActivity("UPDATE_STATUS", bedId, patientId, currentStatus, newStatus, user);

  return {
    success: true,
    message: "Bed updated successfully",
    bed_id: bedId,
    previous_status: currentStatus,
    new_status: newStatus,
    last_updated: timeStr
  };
}

function handleAdmitPatient(data) {
  var patientId = (data.patient_id || data.patientId || "").trim();
  var patientName = (data.patient_name || data.patientName || "").trim();
  var bedId = (data.bed_id || data.bedId || "").trim().toUpperCase();
  var user = data.user || "Reception";

  if (!patientId || !patientName || !bedId) {
    return { success: false, message: "Patient ID, Patient Name, and Bed ID are all required." };
  }

  var bedSheet = getOrCreateSheet(SHEET_BEDS);
  var bData = bedSheet.getDataRange().getValues();
  var bRow = -1;
  var bStatus = "";

  for (var i = 1; i < bData.length; i++) {
    if (String(bData[i][0]).toUpperCase() === bedId) {
      bRow = i + 1;
      bStatus = String(bData[i][4]);
      break;
    }
  }

  if (bRow === -1) return { success: false, message: "Bed ID not found: " + bedId };
  if (bStatus !== "AVAILABLE") {
    return { success: false, message: "Cannot admit patient. Bed " + bedId + " is currently " + bStatus + "." };
  }

  var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "hh:mm a");

  bedSheet.getRange(bRow, 5).setValue("OCCUPIED");
  bedSheet.getRange(bRow, 6).setValue(patientId);
  bedSheet.getRange(bRow, 7).setValue(timeStr);

  var patSheet = getOrCreateSheet(SHEET_PATIENTS);
  patSheet.appendRow([patientId, patientName, bedId, timeStr, "-", "ADMITTED"]);

  logActivity("ADMISSION", bedId, patientId, "AVAILABLE", "OCCUPIED", user);

  return {
    success: true,
    message: "Patient " + patientName + " admitted to Bed " + bedId + " successfully.",
    bed_id: bedId,
    patient_id: patientId
  };
}

function handleDischargePatient(data) {
  var searchId = (data.identifier || data.bed_id || data.patient_id || "").trim();
  var user = data.user || "Nursing Dept";

  if (!searchId) return { success: false, message: "Identifier (Bed ID or Patient ID) required" };

  var bedSheet = getOrCreateSheet(SHEET_BEDS);
  var bData = bedSheet.getDataRange().getValues();
  var bRow = -1;
  var bedId = "";
  var patientId = "";

  for (var i = 1; i < bData.length; i++) {
    if (String(bData[i][0]).toUpperCase() === searchId.toUpperCase() ||
        String(bData[i][5]).toUpperCase() === searchId.toUpperCase()) {
      bRow = i + 1;
      bedId = String(bData[i][0]);
      patientId = String(bData[i][5]);
      break;
    }
  }

  if (bRow === -1 || !bedId) {
    return { success: false, message: "No active bed/patient record matching: " + searchId };
  }

  var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "hh:mm a");

  bedSheet.getRange(bRow, 5).setValue("CLEANING");
  bedSheet.getRange(bRow, 6).setValue("-");
  bedSheet.getRange(bRow, 7).setValue(timeStr);

  var patSheet = getOrCreateSheet(SHEET_PATIENTS);
  var pData = patSheet.getDataRange().getValues();
  for (var j = 1; j < pData.length; j++) {
    if (String(pData[j][0]).toUpperCase() === patientId.toUpperCase() && String(pData[j][5]) === "ADMITTED") {
      patSheet.getRange(j + 1, 5).setValue(timeStr);
      patSheet.getRange(j + 1, 6).setValue("DISCHARGED");
      break;
    }
  }

  logActivity("DISCHARGE", bedId, patientId, "OCCUPIED", "CLEANING", user);

  return {
    success: true,
    message: "Patient discharged. Bed " + bedId + " transitioned to CLEANING.",
    bed_id: bedId,
    patient_id: patientId
  };
}

function handleAddBed(data) {
  var bedId = (data.bed_id || "").trim().toUpperCase();
  var ward = (data.ward || "").trim();
  var floor = parseInt(data.floor, 10);
  var room = (data.room || "").trim();
  var status = (data.status || "AVAILABLE").toUpperCase();
  var user = data.user || "Admin";

  if (!bedId || !ward) return { success: false, message: "Bed ID and Ward are required" };

  var bedSheet = getOrCreateSheet(SHEET_BEDS);
  var bData = bedSheet.getDataRange().getValues();
  for (var i = 1; i < bData.length; i++) {
    if (String(bData[i][0]).toUpperCase() === bedId) {
      return { success: false, message: "Duplicate Bed ID: " + bedId + " already exists." };
    }
  }

  var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "hh:mm a");
  bedSheet.appendRow([bedId, ward, floor, room, status, "-", timeStr]);

  logActivity("ADD_BED", bedId, "-", "-", status, user);

  return { success: true, message: "Bed " + bedId + " added successfully", bed_id: bedId };
}

function logActivity(action, bedId, patientId, prevStatus, newStatus, user) {
  var sheet = getOrCreateSheet(SHEET_ACTIVITY);
  var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "hh:mm a");
  sheet.appendRow([timeStr, action, bedId, patientId, prevStatus, newStatus, user]);
}

function handleGetActivityLog() {
  var sheet = getOrCreateSheet(SHEET_ACTIVITY);
  var data = sheet.getDataRange().getValues();
  var logs = [];

  for (var i = Math.max(1, data.length - 25); i < data.length; i++) {
    logs.push({
      timestamp: String(data[i][0]),
      action: String(data[i][1]),
      bed_id: String(data[i][2]),
      patient_id: String(data[i][3]),
      previous_status: String(data[i][4]),
      new_status: String(data[i][5]),
      user: String(data[i][6])
    });
  }

  return { success: true, count: logs.length, logs: logs.reverse() };
}

function handleGetReport() {
  var bedsResp = handleGetBeds({});
  var beds = bedsResp.beds || [];
  var statsResp = handleGetStats();

  var wardMap = {};
  beds.forEach(function(b) {
    if (!wardMap[b.ward]) {
      wardMap[b.ward] = { total: 0, available: 0, occupied: 0 };
    }
    wardMap[b.ward].total++;
    if (b.status === "AVAILABLE") wardMap[b.ward].available++;
    if (b.status === "OCCUPIED") wardMap[b.ward].occupied++;
  });

  var wardReport = [];
  for (var w in wardMap) {
    wardReport.push({
      ward: w,
      total: wardMap[w].total,
      available: wardMap[w].available,
      occupied: wardMap[w].occupied
    });
  }

  return {
    success: true,
    stats: statsResp.stats,
    ward_report: wardReport,
    generated_at: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "hh:mm a")
  };
}

function handleGetWards() {
  var sheet = getOrCreateSheet(SHEET_WARDS);
  var data = sheet.getDataRange().getValues();
  var wards = [];

  for (var i = 1; i < data.length; i++) {
    wards.push({
      ward_id: String(data[i][0]),
      ward_name: String(data[i][1]),
      floor: parseInt(data[i][2], 10),
      total_beds: parseInt(data[i][3], 10)
    });
  }
  return { success: true, wards: wards };
}
