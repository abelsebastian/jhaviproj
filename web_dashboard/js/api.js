/**
 * Hospital Bed Monitoring System - API & Data Layer
 * Handles remote Google Apps Script calls with offline LocalStorage fallback.
 */

const STORAGE_KEY_API  = "hbms_api_url";
const STORAGE_KEY_BEDS = "hbms_beds_v2";
const STORAGE_KEY_PATS = "hbms_patients_v2";
const STORAGE_KEY_LOGS = "hbms_logs_v2";

const BedAPI = {
  getApiUrl() {
    return (localStorage.getItem(STORAGE_KEY_API) || "").trim();
  },

  setApiUrl(url) {
    if (url && url.trim()) localStorage.setItem(STORAGE_KEY_API, url.trim());
    else localStorage.removeItem(STORAGE_KEY_API);
  },

  isLive() {
    const url = this.getApiUrl();
    return Boolean(url && url.startsWith("http"));
  },

  /**
   * Diagnostic connection test with detailed status reporting
   */
  async testConnection(targetUrl = null) {
    const url = (targetUrl !== null ? targetUrl : this.getApiUrl()).trim();

    if (!url) {
      return {
        ok: false,
        mode: "local",
        status: "LOCAL_ONLY",
        message: "No API URL configured. Operating in local browser storage mode.",
        latency: 0
      };
    }

    // 1. Syntax & Domain check
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return {
        ok: false,
        status: "INVALID_PROTOCOL",
        message: "URL must start with https:// (e.g., https://script.google.com/macros/s/.../exec)",
        latency: 0
      };
    }

    if (url.includes("/edit")) {
      return {
        ok: false,
        status: "EDITOR_URL_DETECTED",
        message: "You provided the Apps Script Editor URL. You must click 'Deploy' > 'New deployment' > 'Web app' and use the URL ending with '/exec'.",
        latency: 0
      };
    }

    if (url.includes("docs.google.com/spreadsheets")) {
      return {
        ok: false,
        status: "SPREADSHEET_URL_DETECTED",
        message: "You provided the Google Sheet spreadsheet link. Please deploy the Apps Script (Extensions > Apps Script > Deploy > Web App) to get the API URL.",
        latency: 0
      };
    }

    if (!url.includes("/exec")) {
      return {
        ok: false,
        status: "NON_EXEC_URL",
        message: "Web App URLs typically end in '/exec'. Please check your deployment URL.",
        latency: 0
      };
    }

    // 2. Network Ping & Latency Measurement
    const t0 = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const testEndpoint = url.includes("?") ? `${url}&action=getStats` : `${url}?action=getStats`;
      const res = await fetch(testEndpoint, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - t0);

      if (!res.ok) {
        return {
          ok: false,
          status: `HTTP_${res.status}`,
          message: `Server returned HTTP ${res.status} (${res.statusText}).`,
          latency
        };
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        if (text.includes("accounts.google.com") || text.includes("<html")) {
          return {
            ok: false,
            status: "AUTH_REQUIRED",
            message: "Google returned a login page. In Apps Script Deploy settings, make sure 'Who has access' is set to 'Anyone'!",
            latency
          };
        }
        return {
          ok: false,
          status: "INVALID_JSON",
          message: "API did not return valid JSON. Check your Code.gs doGet() implementation.",
          latency,
          rawResponse: text.substring(0, 150)
        };
      }

      if (!data.success) {
        return {
          ok: false,
          status: "API_ERROR",
          message: data.message || "API returned success: false.",
          latency,
          data
        };
      }

      const bedsCount = (data.stats && data.stats.total !== undefined) ? data.stats.total : "Verified";

      return {
        ok: true,
        status: "CONNECTED",
        message: `Successfully connected to Google Apps Script API! Total beds found in sheet: ${bedsCount}.`,
        latency,
        stats: data.stats,
        endpoint: url
      };

    } catch (err) {
      const latency = Math.round(performance.now() - t0);
      if (err.name === "AbortError") {
        return {
          ok: false,
          status: "TIMEOUT",
          message: "Connection timed out after 8 seconds. Check your network or Google Apps Script status.",
          latency
        };
      }
      return {
        ok: false,
        status: "NETWORK_ERROR",
        message: `Network or CORS error: ${err.message}. Ensure your Web App is deployed with access 'Anyone'.`,
        latency
      };
    }
  },

  /* Local Storage Fallbacks */
  _load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  _save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  getLocalBeds() {
    let beds = this._load(STORAGE_KEY_BEDS, null);
    if (!beds) {
      beds = DEFAULT_SAMPLE_BEDS;
      this._save(STORAGE_KEY_BEDS, beds);
    }
    return beds;
  },

  getLocalPatients() {
    let pats = this._load(STORAGE_KEY_PATS, null);
    if (!pats) {
      pats = DEFAULT_SAMPLE_PATIENTS;
      this._save(STORAGE_KEY_PATS, pats);
    }
    return pats;
  },

  getLocalLogs() {
    let logs = this._load(STORAGE_KEY_LOGS, null);
    if (!logs) {
      logs = DEFAULT_ACTIVITY_LOGS;
      this._save(STORAGE_KEY_LOGS, logs);
    }
    return logs;
  },

  log(action, bedId, patientId, prev, next, user) {
    const logs = this.getLocalLogs();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    logs.unshift({
      timestamp: time,
      action,
      bed_id: bedId || "-",
      patient_id: patientId || "-",
      previous_status: prev || "-",
      new_status: next || "-",
      user: user || "Staff"
    });
    this._save(STORAGE_KEY_LOGS, logs.slice(0, 50));
  },

  /* Data queries */
  async getBeds(filters = {}) {
    if (this.isLive()) {
      try {
        const query = new URLSearchParams({ action: "getBeds" });
        if (filters.floor !== undefined && filters.floor !== "all") query.set("floor", filters.floor);
        if (filters.ward && filters.ward !== "all") query.set("ward", filters.ward);
        if (filters.status && filters.status !== "all") query.set("status", filters.status);

        const res = await fetch(`${this.getApiUrl()}?${query}`);
        const data = await res.json();
        if (data.success) return { success: true, source: "live", beds: data.beds };
      } catch (err) {
        console.warn("API request failed, falling back to local storage:", err);
      }
    }

    /* Fast local filter */
    let beds = this.getLocalBeds();
    const fl = filters.floor !== undefined && filters.floor !== "all" ? parseInt(filters.floor, 10) : null;
    const wd = filters.ward && filters.ward !== "all" ? filters.ward.toLowerCase() : null;
    const st = filters.status && filters.status !== "all" ? filters.status : null;
    const q  = filters.search ? filters.search.trim().toLowerCase() : null;

    if (fl !== null || wd || st || q) {
      beds = beds.filter(b => {
        if (fl !== null && b.floor !== fl) return false;
        if (wd && !b.ward.toLowerCase().includes(wd)) return false;
        if (st && b.status !== st) return false;
        if (q && !(
          b.bed_id.toLowerCase().includes(q) ||
          b.ward.toLowerCase().includes(q) ||
          b.room.toLowerCase().includes(q) ||
          (b.patient_id && b.patient_id.toLowerCase().includes(q))
        )) return false;
        return true;
      });
    }

    return { success: true, source: "local", beds };
  },

  async getBedById(id) {
    if (!id) return { success: false, message: "Bed ID required" };

    if (this.isLive()) {
      try {
        const res = await fetch(`${this.getApiUrl()}?action=getBedById&bedId=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.success) return { success: true, bed: data.bed };
      } catch {}
    }

    const bed = this.getLocalBeds().find(b => b.bed_id.toUpperCase() === id.toUpperCase());
    return bed ? { success: true, bed } : { success: false, message: "Bed ID not found" };
  },

  async updateStatus(id, newStatus, user = "Staff") {
    if (!id || !newStatus) return { success: false, message: "Missing required parameters" };

    if (this.isLive()) {
      try {
        const res = await fetch(this.getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ action: "updateBedStatus", bed_id: id, new_status: newStatus, user })
        });
        const data = await res.json();
        if (data.success) return data;
      } catch {}
    }

    const beds = this.getLocalBeds();
    const b = beds.find(x => x.bed_id.toUpperCase() === id.toUpperCase());
    if (!b) return { success: false, message: "Bed ID not found" };

    if (b.status === newStatus) {
      return { success: false, message: `Bed ${id} is already ${newStatus}. No change required.` };
    }

    if (newStatus === "OCCUPIED" && (!b.patient_id || b.patient_id === "-")) {
      return { success: false, message: "Cannot set OCCUPIED without patient registration." };
    }

    const prev = b.status;
    b.status = newStatus;
    b.last_updated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if ((newStatus === "AVAILABLE" || newStatus === "CLEANING") && prev !== "OCCUPIED") {
      b.patient_id = "-";
    }

    this._save(STORAGE_KEY_BEDS, beds);
    this.log("UPDATE_STATUS", id, b.patient_id, prev, newStatus, user);
    return { success: true, message: `Bed ${id} status updated to ${newStatus}.`, bed: b };
  },

  async admit(bid, pid, name, user = "Reception") {
    if (!bid || !pid || !name) return { success: false, message: "All fields are required" };

    if (this.isLive()) {
      try {
        const res = await fetch(this.getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ action: "admitPatient", bed_id: bid, patient_id: pid, patient_name: name, user })
        });
        const data = await res.json();
        if (data.success) return data;
      } catch {}
    }

    const beds = this.getLocalBeds();
    const b = beds.find(x => x.bed_id.toUpperCase() === bid.toUpperCase());
    if (!b) return { success: false, message: `Bed ${bid} not found` };
    if (b.status !== "AVAILABLE") return { success: false, message: `Bed ${bid} is currently ${b.status}` };

    const patients = this.getLocalPatients();
    if (patients.some(p => p.patient_id.toUpperCase() === pid.toUpperCase() && p.status === "ADMITTED")) {
      return { success: false, message: `Patient ${pid} is already admitted.` };
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    b.status = "OCCUPIED";
    b.patient_id = pid;
    b.last_updated = now;
    this._save(STORAGE_KEY_BEDS, beds);

    patients.unshift({
      patient_id: pid,
      patient_name: name,
      bed_id: bid,
      admission_time: now,
      discharge_time: "-",
      status: "ADMITTED"
    });
    this._save(STORAGE_KEY_PATS, patients);

    this.log("ADMISSION", bid, pid, "AVAILABLE", "OCCUPIED", user);
    return { success: true, message: `Patient ${name} admitted to Bed ${bid}.`, bed: b };
  },

  async discharge(query, user = "Nurse") {
    if (!query) return { success: false, message: "Bed ID or Patient ID required" };

    if (this.isLive()) {
      try {
        const res = await fetch(this.getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ action: "dischargePatient", identifier: query, user })
        });
        const data = await res.json();
        if (data.success) return data;
      } catch {}
    }

    const beds = this.getLocalBeds();
    const q = query.toUpperCase();
    const b = beds.find(x => x.bed_id.toUpperCase() === q || (x.patient_id && x.patient_id.toUpperCase() === q));
    if (!b) return { success: false, message: `No active bed or patient found for '${query}'.` };
    if (b.status !== "OCCUPIED") return { success: false, message: `Bed ${b.bed_id} is not OCCUPIED.` };

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const pid = b.patient_id;
    b.status = "CLEANING";
    b.patient_id = "-";
    b.last_updated = now;
    this._save(STORAGE_KEY_BEDS, beds);

    const patients = this.getLocalPatients();
    const p = patients.find(x => x.patient_id.toUpperCase() === pid.toUpperCase() && x.status === "ADMITTED");
    if (p) {
      p.status = "DISCHARGED";
      p.discharge_time = now;
      this._save(STORAGE_KEY_PATS, patients);
    }

    this.log("DISCHARGE", b.bed_id, pid, "OCCUPIED", "CLEANING", user);
    return { success: true, message: `Discharge complete. Bed ${b.bed_id} transitioned to CLEANING.`, bed: b };
  },

  /* Single-pass O(N) statistics reducer */
  async getStats() {
    const beds = (await this.getBeds()).beds || [];
    const stats = beds.reduce((acc, b) => {
      acc.total++;
      if (b.status === "AVAILABLE") acc.available++;
      else if (b.status === "OCCUPIED") acc.occupied++;
      else if (b.status === "CLEANING") acc.cleaning++;
      else if (b.status === "RESERVED") acc.reserved++;
      else if (b.status === "MAINTENANCE") acc.maintenance++;
      return acc;
    }, { total: 0, available: 0, occupied: 0, cleaning: 0, reserved: 0, maintenance: 0 });

    stats.availability_rate = stats.total ? Math.round((stats.available / stats.total) * 1000) / 10 : 0;
    stats.occupancy_rate = stats.total ? Math.round((stats.occupied / stats.total) * 1000) / 10 : 0;
    return stats;
  },

  reset() {
    this._save(STORAGE_KEY_BEDS, DEFAULT_SAMPLE_BEDS);
    this._save(STORAGE_KEY_PATS, DEFAULT_SAMPLE_PATIENTS);
    this._save(STORAGE_KEY_LOGS, DEFAULT_ACTIVITY_LOGS);
  }
};
