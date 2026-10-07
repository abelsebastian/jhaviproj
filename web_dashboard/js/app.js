/**
 * Hospital Bed Monitoring System - Client UI Controller
 */

document.addEventListener("DOMContentLoaded", () => App.init());

const App = {
  currentBedId: null,

  init() {
    this.setupListeners();
    this.updateApiBadge();
    this.refresh();
  },

  setupListeners() {
    document.getElementById("refreshBtn").addEventListener("click", () => this.refresh(true));

    // Debounced search
    let timer;
    document.getElementById("searchInput").addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.filterBeds(), 150);
    });

    // Filter selectors
    ["floorFilter", "wardFilter", "statusFilter"].forEach(id => {
      document.getElementById(id).addEventListener("change", () => this.filterBeds());
    });

    document.getElementById("resetFiltersBtn").addEventListener("click", () => {
      document.getElementById("searchInput").value = "";
      document.getElementById("floorFilter").value = "all";
      document.getElementById("wardFilter").value = "all";
      document.getElementById("statusFilter").value = "all";
      this.filterBeds();
    });

    // Top action triggers
    document.getElementById("quickAdmitBtn").addEventListener("click", () => this.openAdmitModal());
    document.getElementById("quickDischargeBtn").addEventListener("click", () => this.openDischargeModal());
    document.getElementById("addBedModalBtn").addEventListener("click", () => this.openModal("addBedModal"));
    document.getElementById("openReportBtn").addEventListener("click", () => this.openReportModal());
    document.getElementById("apiConfigBtn").addEventListener("click", () => this.openApiConfigModal());
    document.getElementById("systemStatusBadge").addEventListener("click", () => this.openApiConfigModal());
    document.getElementById("testApiBtn").addEventListener("click", () => this.runApiDiagnostics());
    document.getElementById("disconnectApiBtn").addEventListener("click", () => this.disconnectApi());

    // Modal forms
    document.getElementById("saveStatusBtn").addEventListener("click", () => this.saveStatus());
    document.getElementById("modalAdmitBtn").addEventListener("click", () => {
      this.closeModal("bedDetailsModal");
      this.openAdmitModal(this.currentBedId);
    });
    document.getElementById("modalDischargeBtn").addEventListener("click", () => {
      this.closeModal("bedDetailsModal");
      this.openDischargeModal(this.currentBedId);
    });

    document.getElementById("confirmAdmitBtn").addEventListener("click", () => this.submitAdmission());
    document.getElementById("confirmDischargeBtn").addEventListener("click", () => this.submitDischarge());
    document.getElementById("confirmAddBedBtn").addEventListener("click", () => this.submitAddBed());
    document.getElementById("saveApiConfigBtn").addEventListener("click", () => this.saveApiSettings());

    document.getElementById("resetDemoDataBtn").addEventListener("click", () => {
      if (confirm("Reset to default 64 sample beds?")) {
        BedAPI.reset();
        this.toast("Database reset to defaults.", "success");
        this.closeModal("apiConfigModal");
        this.refresh();
      }
    });

    // Modal dismissals
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => this.closeModal(btn.dataset.close));
    });

    window.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
      }
    });

    document.querySelectorAll(".modal-backdrop").forEach(el => {
      el.addEventListener("click", e => {
        if (e.target === el) el.classList.remove("open");
      });
    });
  },

  async refresh(isManual = false) {
    if (isManual) this.toast("Synchronizing data...", "info");

    try {
      await Promise.all([
        this.loadStats(),
        this.filterBeds(),
        this.loadVisualizer(),
        this.loadLogs()
      ]);

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      document.getElementById("syncTimeLabel").textContent = `Last synchronized: ${now}`;
      if (isManual) this.toast("Dashboard updated.", "success");
    } catch (e) {
      console.error(e);
      this.toast("Sync failed.", "error");
    }
  },

  async loadStats() {
    const s = await BedAPI.getStats();
    document.getElementById("statTotal").textContent = s.total;
    document.getElementById("statAvailable").textContent = s.available;
    document.getElementById("statOccupied").textContent = s.occupied;
    document.getElementById("statCleaning").textContent = s.cleaning;
    document.getElementById("statReserved").textContent = s.reserved;
    document.getElementById("statMaintenance").textContent = s.maintenance;
    document.getElementById("statAvailRate").textContent = `${s.availability_rate}% Availability`;
    document.getElementById("statOccRate").textContent = `${s.occupancy_rate}% Occupancy`;
  },

  async filterBeds() {
    const filters = {
      search: document.getElementById("searchInput").value,
      floor: document.getElementById("floorFilter").value,
      ward: document.getElementById("wardFilter").value,
      status: document.getElementById("statusFilter").value
    };

    const beds = (await BedAPI.getBeds(filters)).beds || [];
    const tbody = document.getElementById("bedTableBody");
    const empty = document.getElementById("emptyState");
    const countLabel = document.getElementById("tableCountLabel");

    countLabel.textContent = `Showing ${beds.length} bed${beds.length === 1 ? "" : "s"}`;
    if (!beds.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    // Optimized batch rendering
    const rows = beds.map(b => {
      const flDesc = b.floor === 0 ? "Ground (0)" : (b.floor === 1 ? "1st Floor (1)" : "2nd Floor (2)");
      const stClass = `status-${b.status.toLowerCase()}`;
      const patTag = (b.patient_id && b.patient_id !== "-")
        ? `<span class="patient-tag">${b.patient_id}</span>`
        : `<span class="empty-val">&mdash;</span>`;

      return `<tr>
        <td class="bed-id-cell">${b.bed_id}</td>
        <td><strong>${b.ward}</strong></td>
        <td>${flDesc}</td>
        <td><code>${b.room}</code></td>
        <td><span class="status-badge ${stClass}"><span class="badge-dot"></span>${b.status}</span></td>
        <td>${patTag}</td>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${b.last_updated}</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="App.openBedDetails('${b.bed_id}')">Manage</button>
        </td>
      </tr>`;
    }).join("");

    tbody.innerHTML = rows;
  },

  async loadVisualizer() {
    const beds = (await BedAPI.getBeds()).beds || [];
    const floorMap = { 0: {}, 1: {}, 2: {} };

    beds.forEach(b => {
      if (!floorMap[b.floor]) return;
      if (!floorMap[b.floor][b.ward]) floorMap[b.floor][b.ward] = { total: 0, avail: 0 };
      floorMap[b.floor][b.ward].total++;
      if (b.status === "AVAILABLE") floorMap[b.floor][b.ward].avail++;
    });

    [0, 1, 2].forEach(fl => {
      const container = document.getElementById(`floor${fl}Wards`);
      const badge = document.getElementById(`floor${fl}Badge`);
      let fTot = 0, fAvail = 0, html = "";

      for (const w in floorMap[fl]) {
        const item = floorMap[fl][w];
        fTot += item.total;
        fAvail += item.avail;
        const pct = item.total ? Math.round((item.avail / item.total) * 100) : 0;
        html += `<div class="ward-card-item">
          <div class="ward-card-header">
            <span>${w}</span>
            <span class="ward-card-avail">${item.avail} / ${item.total} available</span>
          </div>
          <div class="ward-meter-track">
            <div class="ward-meter-fill" style="width: ${pct}%;"></div>
          </div>
        </div>`;
      }
      container.innerHTML = html;
      badge.textContent = `${fAvail} / ${fTot} Avail`;
    });
  },

  async loadLogs() {
    const logs = BedAPI.getLocalLogs().slice(0, 8);
    const list = document.getElementById("activityLogList");
    if (!logs.length) {
      list.innerHTML = `<li style="color: var(--text-muted); font-size: 0.8rem; padding: 10px 0;">No events logged.</li>`;
      return;
    }

    list.innerHTML = logs.map(l => {
      let desc = "";
      if (l.action === "ADMISSION") desc = `Patient <strong>${l.patient_id}</strong> &rarr; Bed <strong>${l.bed_id}</strong>`;
      else if (l.action === "DISCHARGE") desc = `Bed <strong>${l.bed_id}</strong> discharged &rarr; CLEANING`;
      else if (l.action === "UPDATE_STATUS") desc = `Bed <strong>${l.bed_id}</strong>: ${l.previous_status} &rarr; <strong>${l.new_status}</strong>`;
      else desc = `${l.action} on Bed ${l.bed_id}`;

      return `<li class="log-item">
        <span class="log-time">${l.timestamp}</span>
        <div class="log-desc">
          <div class="log-action">${desc}</div>
          <div class="log-sub">Staff: ${l.user}</div>
        </div>
      </li>`;
    }).join("");
  },

  async openBedDetails(id) {
    this.currentBedId = id;
    const res = await BedAPI.getBedById(id);
    if (!res.success) return this.toast("Bed not found", "error");

    const b = res.bed;
    document.getElementById("modalBedIdTitle").textContent = `Bed Details: ${b.bed_id}`;
    document.getElementById("detailBedId").textContent = b.bed_id;
    document.getElementById("detailStatus").textContent = b.status;
    document.getElementById("detailWard").textContent = b.ward;
    document.getElementById("detailFloorRoom").textContent = `Floor ${b.floor} • Room ${b.room}`;
    document.getElementById("detailPatient").textContent = (b.patient_id && b.patient_id !== "-") ? b.patient_id : "None";
    document.getElementById("detailUpdated").textContent = b.last_updated;
    document.getElementById("detailNewStatus").value = b.status;

    const admitBtn = document.getElementById("modalAdmitBtn");
    const dischargeBtn = document.getElementById("modalDischargeBtn");
    admitBtn.style.display = b.status === "AVAILABLE" ? "inline-flex" : "none";
    dischargeBtn.style.display = b.status === "OCCUPIED" ? "inline-flex" : "none";

    this.openModal("bedDetailsModal");
  },

  async saveStatus() {
    if (!this.currentBedId) return;
    const next = document.getElementById("detailNewStatus").value;
    const res = await BedAPI.updateStatus(this.currentBedId, next, "Staff");

    if (!res.success) return this.toast(res.message, "warning");

    this.toast(res.message, "success");
    this.closeModal("bedDetailsModal");
    this.refresh();
  },

  async openAdmitModal(prefillBed = null) {
    const sel = document.getElementById("admitBedSelect");
    const avail = (await BedAPI.getBeds({ status: "AVAILABLE" })).beds || [];

    if (!avail.length) return this.toast("No vacant beds available right now.", "warning");

    sel.innerHTML = avail.map(b => `
      <option value="${b.bed_id}" ${prefillBed === b.bed_id ? "selected" : ""}>
        ${b.bed_id} — ${b.ward} (Floor ${b.floor}, Room ${b.room})
      </option>
    `).join("");

    document.getElementById("admitPatientId").value = "";
    document.getElementById("admitPatientName").value = "";
    this.openModal("admitModal");
  },

  async submitAdmission() {
    const pid = document.getElementById("admitPatientId").value.trim();
    const name = document.getElementById("admitPatientName").value.trim();
    const bid = document.getElementById("admitBedSelect").value;

    if (!pid || !name || !bid) return this.toast("Please fill in all admission fields.", "warning");

    const res = await BedAPI.admit(bid, pid, name, "Reception");
    if (!res.success) return this.toast(res.message, "error");

    this.toast(res.message, "success");
    this.closeModal("admitModal");
    this.refresh();
  },

  openDischargeModal(prefill = "") {
    document.getElementById("dischargeIdentifier").value = prefill;
    this.openModal("dischargeModal");
  },

  async submitDischarge() {
    const q = document.getElementById("dischargeIdentifier").value.trim();
    if (!q) return this.toast("Please enter a Bed ID or Patient ID", "warning");

    if (!confirm(`Discharge '${q}' and transition bed to CLEANING?`)) return;

    const res = await BedAPI.discharge(q, "Nurse");
    if (!res.success) return this.toast(res.message, "error");

    this.toast(res.message, "success");
    this.closeModal("dischargeModal");
    this.refresh();
  },

  async submitAddBed() {
    const id = document.getElementById("addBedId").value.trim().toUpperCase();
    const ward = document.getElementById("addBedWard").value;
    const floor = parseInt(document.getElementById("addBedFloor").value, 10);
    const room = document.getElementById("addBedRoom").value.trim() || "R01";
    const status = document.getElementById("addBedStatus").value;

    if (!id) return this.toast("Bed ID is required", "warning");

    const beds = BedAPI.getLocalBeds();
    if (beds.some(b => b.bed_id === id)) return this.toast(`Bed ${id} already exists`, "error");

    beds.push({
      bed_id: id,
      ward,
      floor,
      room,
      status,
      patient_id: "-",
      last_updated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    BedAPI._save(STORAGE_KEY_BEDS, beds);
    BedAPI.log("ADD_BED", id, "-", "-", status, "Admin");
    this.toast(`Bed ${id} created.`, "success");
    this.closeModal("addBedModal");
    this.refresh();
  },

  async openReportModal() {
    const stats = await BedAPI.getStats();
    const beds = (await BedAPI.getBeds()).beds || [];

    const map = {};
    beds.forEach(b => {
      if (!map[b.ward]) map[b.ward] = { total: 0, avail: 0, occ: 0 };
      map[b.ward].total++;
      if (b.status === "AVAILABLE") map[b.ward].avail++;
      if (b.status === "OCCUPIED") map[b.ward].occ++;
    });

    const rows = Object.entries(map).map(([w, item]) => {
      const pct = item.total ? Math.round((item.avail / item.total) * 100) : 0;
      return `<tr>
        <td><strong>${w}</strong></td>
        <td>${item.total}</td>
        <td style="color: #166534; font-weight: bold;">${item.avail}</td>
        <td style="color: #991b1b;">${item.occ}</td>
        <td>${pct}%</td>
      </tr>`;
    }).join("");

    const now = new Date().toLocaleString();
    document.getElementById("reportModalContent").innerHTML = `
      <div style="font-family: monospace; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="text-align: center; margin-bottom: 4px;">HOSPITAL BED AVAILABILITY REPORT</h4>
        <div style="text-align: center; font-size: 0.78rem; color: #64748b; margin-bottom: 12px;">Audited: ${now}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.84rem;">
          <div>Total Capacity: <strong>${stats.total} beds</strong></div>
          <div>Available Beds: <strong>${stats.available} beds</strong></div>
          <div>Occupied Beds: <strong>${stats.occupied} beds</strong></div>
          <div>Under Cleaning: <strong>${stats.cleaning} beds</strong></div>
          <div>Reserved Beds: <strong>${stats.reserved} beds</strong></div>
          <div>Maintenance: <strong>${stats.maintenance} beds</strong></div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 0.88rem;">
          Availability Rate: <strong style="color: #166534;">${stats.availability_rate}%</strong> | Occupancy: <strong style="color: #991b1b;">${stats.occupancy_rate}%</strong>
        </div>
      </div>
      <table class="bed-table" style="font-size: 0.82rem;">
        <thead>
          <tr><th>Ward</th><th>Total</th><th>Available</th><th>Occupied</th><th>Rate</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    this.openModal("reportModal");
  },

  openApiConfigModal() {
    const url = BedAPI.getApiUrl();
    document.getElementById("apiEndpointInput").value = url;
    this.resetDiagnosticDisplay(url);
    this.openModal("apiConfigModal");
  },

  resetDiagnosticDisplay(url) {
    const title = document.getElementById("diagnosticTitle");
    const msg = document.getElementById("diagnosticMsg");
    const badge = document.getElementById("diagnosticLatencyBadge");
    const help = document.getElementById("diagnosticHelpBox");
    const card = document.getElementById("diagnosticCard");

    badge.style.display = "none";
    help.style.display = "none";
    card.style.borderColor = "var(--border-color)";
    card.style.background = "var(--bg-subtle)";

    if (url) {
      title.textContent = "Configured Endpoint Ready";
      title.style.color = "#0f172a";
      msg.textContent = `Target: ${url}. Click "Test Connection" to test real-time connectivity.`;
    } else {
      title.textContent = "Offline Mode Active";
      title.style.color = "#065f46";
      msg.textContent = "Running on the built-in 64-bed browser database. Paste a Google Apps Script Web App URL above to connect to Google Sheets.";
    }
  },

  async runApiDiagnostics() {
    const url = document.getElementById("apiEndpointInput").value.trim();
    const title = document.getElementById("diagnosticTitle");
    const msg = document.getElementById("diagnosticMsg");
    const badge = document.getElementById("diagnosticLatencyBadge");
    const help = document.getElementById("diagnosticHelpBox");
    const card = document.getElementById("diagnosticCard");
    const testBtn = document.getElementById("testApiBtn");

    if (!url) {
      this.toast("Please enter a Google Apps Script URL to test", "warning");
      this.resetDiagnosticDisplay("");
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = "Pinging...";
    title.textContent = "Connecting to Google Apps Script...";
    title.style.color = "#0284c7";
    msg.textContent = "Sending health-check request to endpoint...";
    badge.style.display = "none";
    help.style.display = "none";
    card.style.background = "#f0f9ff";
    card.style.borderColor = "#bae6fd";

    const res = await BedAPI.testConnection(url);
    testBtn.disabled = false;
    testBtn.textContent = "⚡ Test Connection";

    if (res.ok) {
      card.style.background = "#f0fdf4";
      card.style.borderColor = "#86efac";
      title.textContent = "🟢 Connection Verified & Active";
      title.style.color = "#166534";
      msg.textContent = res.message;
      badge.textContent = `${res.latency} ms`;
      badge.style.display = "inline-block";
      badge.style.background = "#dcfce7";
      badge.style.color = "#166534";
      this.toast("API connection test passed!", "success");
    } else {
      card.style.background = "#fef2f2";
      card.style.borderColor = "#fca5a5";
      title.textContent = `🔴 Connection Failed: ${res.status}`;
      title.style.color = "#991b1b";
      msg.textContent = res.message;
      if (res.latency > 0) {
        badge.textContent = `${res.latency} ms`;
        badge.style.display = "inline-block";
        badge.style.background = "#fee2e2";
        badge.style.color = "#991b1b";
      }

      help.style.display = "block";
      if (res.status === "EDITOR_URL_DETECTED") {
        help.innerHTML = "<strong>Fix:</strong> In the Apps Script editor, click the blue <strong>Deploy</strong> button &gt; <strong>New deployment</strong> &gt; Select <strong>Web app</strong> &gt; Set Access to <strong>Anyone</strong> &gt; Deploy and copy that URL.";
      } else if (res.status === "SPREADSHEET_URL_DETECTED") {
        help.innerHTML = "<strong>Fix:</strong> You pasted the Google Sheet link. Open <strong>Extensions &gt; Apps Script</strong>, deploy as Web App, and paste the Web App URL here.";
      } else if (res.status === "AUTH_REQUIRED") {
        help.innerHTML = "<strong>Fix:</strong> Google blocked the request because permissions are private. In Apps Script, click <strong>Deploy &gt; Manage deployments &gt; Edit &gt; Who has access: Anyone</strong>.";
      } else {
        help.innerHTML = "<strong>Troubleshooting:</strong> Verify you deployed Code.gs as a Web App with access set to <em>Anyone</em>, and check your internet connection.";
      }
      this.toast("API connection test failed", "error");
    }
  },

  disconnectApi() {
    BedAPI.setApiUrl("");
    document.getElementById("apiEndpointInput").value = "";
    this.resetDiagnosticDisplay("");
    this.updateApiBadge();
    this.toast("Disconnected from API. Switched to Local Offline Engine.", "info");
    this.closeModal("apiConfigModal");
    this.refresh(true);
  },

  async saveApiSettings() {
    const url = document.getElementById("apiEndpointInput").value.trim();
    if (url) {
      this.toast("Verifying API endpoint...", "info");
      const testRes = await BedAPI.testConnection(url);
      if (!testRes.ok) {
        if (!confirm(`Warning: The API connection test failed (${testRes.status}):\n\n${testRes.message}\n\nDo you still want to save this URL?`)) {
          return;
        }
      }
    }
    BedAPI.setApiUrl(url);
    this.updateApiBadge();
    this.toast(url ? "Google Apps Script connected & saved!" : "Switched to Local Offline Engine", "success");
    this.closeModal("apiConfigModal");
    this.refresh(true);
  },

  async updateApiBadge() {
    const badge = document.getElementById("systemStatusBadge");
    const text = document.getElementById("systemStatusText");

    if (BedAPI.isLive()) {
      badge.style.background = "#eff6ff";
      badge.style.borderColor = "#93c5fd";
      badge.style.color = "#1e40af";
      text.textContent = "CHECKING API...";

      // Asynchronous background health ping
      const res = await BedAPI.testConnection();
      if (res.ok) {
        badge.style.background = "#eff6ff";
        badge.style.borderColor = "#60a5fa";
        badge.style.color = "#1d4ed8";
        text.textContent = `ONLINE: GOOGLE SHEETS (${res.latency}ms)`;
      } else {
        badge.style.background = "#fef2f2";
        badge.style.borderColor = "#fca5a5";
        badge.style.color = "#991b1b";
        text.textContent = "API OFFLINE (LOCAL FALLBACK)";
      }
    } else {
      badge.style.background = "#ecfdf5";
      badge.style.borderColor = "#a7f3d0";
      badge.style.color = "#065f46";
      text.textContent = "SYSTEM ONLINE (LOCAL ENGINE)";
    }
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("open");
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("open");
  },

  toast(msg, type = "info") {
    const box = document.getElementById("toastContainer");
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 250);
    }, 2800);
  }
};
