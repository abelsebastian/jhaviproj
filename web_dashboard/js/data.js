/**
 * HOSPITAL BED MONITORING SYSTEM - DEFAULT BED DATA
 * Exactly matches the 64 sample beds in C core system.
 */

const DEFAULT_SAMPLE_BEDS = [
  /* Ground Floor (0): General Ward (12 beds) */
  { bed_id: "G101", ward: "General Ward", floor: 0, room: "G01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G102", ward: "General Ward", floor: 0, room: "G01", status: "OCCUPIED", patient_id: "P1001", last_updated: "10:00 AM" },
  { bed_id: "G103", ward: "General Ward", floor: 0, room: "G01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G104", ward: "General Ward", floor: 0, room: "G02", status: "CLEANING", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G105", ward: "General Ward", floor: 0, room: "G02", status: "OCCUPIED", patient_id: "P1002", last_updated: "10:00 AM" },
  { bed_id: "G106", ward: "General Ward", floor: 0, room: "G02", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G107", ward: "General Ward", floor: 0, room: "G03", status: "OCCUPIED", patient_id: "P1003", last_updated: "10:00 AM" },
  { bed_id: "G108", ward: "General Ward", floor: 0, room: "G03", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G109", ward: "General Ward", floor: 0, room: "G03", status: "RESERVED", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G110", ward: "General Ward", floor: 0, room: "G04", status: "OCCUPIED", patient_id: "P1004", last_updated: "10:00 AM" },
  { bed_id: "G111", ward: "General Ward", floor: 0, room: "G04", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G112", ward: "General Ward", floor: 0, room: "G04", status: "MAINTENANCE", patient_id: "-", last_updated: "10:00 AM" },

  /* Ground Floor (0): Emergency (8 beds) */
  { bed_id: "E201", ward: "Emergency", floor: 0, room: "EMG01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "E202", ward: "Emergency", floor: 0, room: "EMG01", status: "OCCUPIED", patient_id: "P1005", last_updated: "10:00 AM" },
  { bed_id: "E203", ward: "Emergency", floor: 0, room: "EMG01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "E204", ward: "Emergency", floor: 0, room: "EMG02", status: "OCCUPIED", patient_id: "P1006", last_updated: "10:00 AM" },
  { bed_id: "E205", ward: "Emergency", floor: 0, room: "EMG02", status: "OCCUPIED", patient_id: "P1007", last_updated: "10:00 AM" },
  { bed_id: "E206", ward: "Emergency", floor: 0, room: "EMG02", status: "CLEANING", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "E207", ward: "Emergency", floor: 0, room: "EMG03", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "E208", ward: "Emergency", floor: 0, room: "EMG03", status: "OCCUPIED", patient_id: "P1008", last_updated: "10:00 AM" },

  /* First Floor (1): General Ward (8 beds) */
  { bed_id: "G201", ward: "General Ward", floor: 1, room: "G11", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G202", ward: "General Ward", floor: 1, room: "G11", status: "OCCUPIED", patient_id: "P1009", last_updated: "10:00 AM" },
  { bed_id: "G203", ward: "General Ward", floor: 1, room: "G11", status: "OCCUPIED", patient_id: "P1010", last_updated: "10:00 AM" },
  { bed_id: "G204", ward: "General Ward", floor: 1, room: "G12", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G205", ward: "General Ward", floor: 1, room: "G12", status: "CLEANING", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G206", ward: "General Ward", floor: 1, room: "G12", status: "OCCUPIED", patient_id: "P1011", last_updated: "10:00 AM" },
  { bed_id: "G207", ward: "General Ward", floor: 1, room: "G13", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "G208", ward: "General Ward", floor: 1, room: "G13", status: "RESERVED", patient_id: "-", last_updated: "10:00 AM" },

  /* First Floor (1): ICU (10 beds) */
  { bed_id: "ICU301", ward: "ICU", floor: 1, room: "ICU01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU302", ward: "ICU", floor: 1, room: "ICU01", status: "OCCUPIED", patient_id: "P1012", last_updated: "10:00 AM" },
  { bed_id: "ICU303", ward: "ICU", floor: 1, room: "ICU02", status: "OCCUPIED", patient_id: "P1013", last_updated: "10:00 AM" },
  { bed_id: "ICU304", ward: "ICU", floor: 1, room: "ICU02", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU305", ward: "ICU", floor: 1, room: "ICU03", status: "OCCUPIED", patient_id: "P1014", last_updated: "10:00 AM" },
  { bed_id: "ICU306", ward: "ICU", floor: 1, room: "ICU03", status: "CLEANING", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU307", ward: "ICU", floor: 1, room: "ICU04", status: "OCCUPIED", patient_id: "P1015", last_updated: "10:00 AM" },
  { bed_id: "ICU308", ward: "ICU", floor: 1, room: "ICU04", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU309", ward: "ICU", floor: 1, room: "ICU05", status: "OCCUPIED", patient_id: "P1016", last_updated: "10:00 AM" },
  { bed_id: "ICU310", ward: "ICU", floor: 1, room: "ICU05", status: "MAINTENANCE", patient_id: "-", last_updated: "10:00 AM" },

  /* First Floor (1): Pediatric (6 beds) */
  { bed_id: "P401", ward: "Pediatric", floor: 1, room: "PED01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "P402", ward: "Pediatric", floor: 1, room: "PED01", status: "OCCUPIED", patient_id: "P1017", last_updated: "10:00 AM" },
  { bed_id: "P403", ward: "Pediatric", floor: 1, room: "PED02", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "P404", ward: "Pediatric", floor: 1, room: "PED02", status: "OCCUPIED", patient_id: "P1018", last_updated: "10:00 AM" },
  { bed_id: "P405", ward: "Pediatric", floor: 1, room: "PED03", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "P406", ward: "Pediatric", floor: 1, room: "PED03", status: "RESERVED", patient_id: "-", last_updated: "10:00 AM" },

  /* Second Floor (2): Surgical Ward (8 beds) */
  { bed_id: "S501", ward: "Surgical Ward", floor: 2, room: "SUR01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "S502", ward: "Surgical Ward", floor: 2, room: "SUR01", status: "OCCUPIED", patient_id: "P1019", last_updated: "10:00 AM" },
  { bed_id: "S503", ward: "Surgical Ward", floor: 2, room: "SUR01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "S504", ward: "Surgical Ward", floor: 2, room: "SUR02", status: "OCCUPIED", patient_id: "P1020", last_updated: "10:00 AM" },
  { bed_id: "S505", ward: "Surgical Ward", floor: 2, room: "SUR02", status: "CLEANING", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "S506", ward: "Surgical Ward", floor: 2, room: "SUR02", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "S507", ward: "Surgical Ward", floor: 2, room: "SUR03", status: "OCCUPIED", patient_id: "P1021", last_updated: "10:00 AM" },
  { bed_id: "S508", ward: "Surgical Ward", floor: 2, room: "SUR03", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },

  /* Second Floor (2): Maternity (6 beds) */
  { bed_id: "M601", ward: "Maternity", floor: 2, room: "MAT01", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "M602", ward: "Maternity", floor: 2, room: "MAT01", status: "OCCUPIED", patient_id: "P1022", last_updated: "10:00 AM" },
  { bed_id: "M603", ward: "Maternity", floor: 2, room: "MAT02", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "M604", ward: "Maternity", floor: 2, room: "MAT02", status: "OCCUPIED", patient_id: "P1023", last_updated: "10:00 AM" },
  { bed_id: "M605", ward: "Maternity", floor: 2, room: "MAT03", status: "CLEANING", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "M606", ward: "Maternity", floor: 2, room: "MAT03", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },

  /* Second Floor (2): ICU (6 beds) */
  { bed_id: "ICU311", ward: "ICU", floor: 2, room: "ICU06", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU312", ward: "ICU", floor: 2, room: "ICU06", status: "OCCUPIED", patient_id: "P1024", last_updated: "10:00 AM" },
  { bed_id: "ICU313", ward: "ICU", floor: 2, room: "ICU07", status: "OCCUPIED", patient_id: "P1025", last_updated: "10:00 AM" },
  { bed_id: "ICU314", ward: "ICU", floor: 2, room: "ICU07", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU315", ward: "ICU", floor: 2, room: "ICU08", status: "RESERVED", patient_id: "-", last_updated: "10:00 AM" },
  { bed_id: "ICU316", ward: "ICU", floor: 2, room: "ICU08", status: "AVAILABLE", patient_id: "-", last_updated: "10:00 AM" }
];

const DEFAULT_SAMPLE_PATIENTS = [
  { patient_id: "P1001", patient_name: "Ramesh Sharma", bed_id: "G102", admission_time: "08:15 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1002", patient_name: "Priya Nair", bed_id: "G105", admission_time: "09:30 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1003", patient_name: "Anand Kulkarni", bed_id: "G107", admission_time: "09:45 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1004", patient_name: "Sunita Menon", bed_id: "G110", admission_time: "10:10 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1005", patient_name: "David Joseph", bed_id: "E202", admission_time: "07:20 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1006", patient_name: "Kavita Verma", bed_id: "E204", admission_time: "08:05 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1007", patient_name: "Mohammed Rafi", bed_id: "E205", admission_time: "08:50 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1008", patient_name: "Deepak Gupta", bed_id: "E208", admission_time: "09:15 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1009", patient_name: "Meera Sen", bed_id: "G202", admission_time: "06:40 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1010", patient_name: "Vikram Patel", bed_id: "G203", admission_time: "07:10 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1011", patient_name: "Sneha Rao", bed_id: "G206", admission_time: "08:25 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1012", patient_name: "Arun Kumar", bed_id: "ICU302", admission_time: "05:15 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1013", patient_name: "Lakshmi Iyer", bed_id: "ICU303", admission_time: "06:00 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1014", patient_name: "Rajesh Pillai", bed_id: "ICU305", admission_time: "07:45 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1015", patient_name: "Anita Roy", bed_id: "ICU307", admission_time: "08:30 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1016", patient_name: "Suresh Deshmukh", bed_id: "ICU309", admission_time: "09:10 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1017", patient_name: "Master Aryan (Ped)", bed_id: "P402", admission_time: "08:00 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1018", patient_name: "Baby Diya (Ped)", bed_id: "P404", admission_time: "09:20 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1019", patient_name: "George Thomas", bed_id: "S502", admission_time: "07:35 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1020", patient_name: "Fatima Begum", bed_id: "S504", admission_time: "08:10 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1021", patient_name: "Bala Chandran", bed_id: "S507", admission_time: "09:05 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1022", patient_name: "Pooja Hegde", bed_id: "M602", admission_time: "06:50 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1023", patient_name: "Shalini Reddy", bed_id: "M604", admission_time: "08:40 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1024", patient_name: "Karthik Krishnan", bed_id: "ICU312", admission_time: "07:15 AM", discharge_time: "-", status: "ADMITTED" },
  { patient_id: "P1025", patient_name: "Manoj Nambiar", bed_id: "ICU313", admission_time: "08:20 AM", discharge_time: "-", status: "ADMITTED" }
];

const DEFAULT_ACTIVITY_LOGS = [
  { timestamp: "10:00 AM", action: "SYSTEM_INIT", bed_id: "ALL", patient_id: "-", previous_status: "-", new_status: "SYSTEM_ONLINE", user: "System" },
  { timestamp: "09:45 AM", action: "ADMISSION", bed_id: "G107", patient_id: "P1003", previous_status: "AVAILABLE", new_status: "OCCUPIED", user: "Reception" },
  { timestamp: "09:30 AM", action: "ADMISSION", bed_id: "G105", patient_id: "P1002", previous_status: "AVAILABLE", new_status: "OCCUPIED", user: "Reception" },
  { timestamp: "09:15 AM", action: "UPDATE_STATUS", bed_id: "G104", patient_id: "-", previous_status: "OCCUPIED", new_status: "CLEANING", user: "Nursing Staff" }
];
