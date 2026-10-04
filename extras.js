// ===== PRABAL EXTRAS — New Features =====

// ===== DEMO LOGIN =====
function demoLogin() {
  document.getElementById('serviceNum').value = 'DEMO-OBS';
  document.getElementById('password').value = 'observer123';
  document.getElementById('loginBtnText').textContent = 'Authenticating Observer...';
  setTimeout(() => {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.body.style.background = '#0A1628';
    document.getElementById('loggedUser').textContent = 'Observer Mode';
    document.getElementById('loggedFormation').textContent = 'Read-Only Access';
    initApp();
  }, 800);
}

// ===== IOT LIVE SIMULATION =====
let iotInterval;
function startIoTSimulation() {
  iotInterval = setInterval(() => {
    // Slightly fluctuate data to simulate live sensors
    forwardPosts.forEach(p => {
      p.fuel = Math.max(10, Math.min(100, p.fuel + (Math.random() * 2 - 1)));
      p.ration = Math.max(10, Math.min(100, p.ration + (Math.random() * 1.5 - 0.8)));
      p.medicine = Math.max(10, Math.min(100, p.medicine + (Math.random() * 1 - 0.4)));
    });

    // Re-render table if visible
    if (document.getElementById('page-dashboard').classList.contains('active')) {
      renderPostsTable();
    }
    if (document.getElementById('page-inventory').classList.contains('active')) {
      renderInventory(document.getElementById('invSearch')?.value || '');
    }

    // Update IoT indicator
    const iotText = document.getElementById('iotText');
    if (iotText) {
      iotText.textContent = 'Synced ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Update KPI cards live
    document.querySelectorAll('.kpi-num').forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      if (target) {
        const variance = Math.floor(Math.random() * 10) - 5;
        el.textContent = (target + variance).toLocaleString();
      }
    });
  }, 5000); // every 5 seconds
}

// ===== CONVOY ANIMATION ON MAP =====
let convoyMarkers = [];
function addConvoyAnimations() {
  if (!map) return;
  convoyMarkers.forEach(m => map.removeLayer(m));
  convoyMarkers = [];

  const convoys = [
    { from: [32.7266, 74.8570], to: [35.4208, 76.8461], label: '🚚 Fuel Convoy A-12' },
    { from: [34.1526, 77.5771], to: [34.8481, 76.8286], label: '🚛 Ration Convoy B-3' },
  ];

  convoys.forEach(c => {
    // Draw animated route line
    const line = L.polyline([c.from, c.to], {
      color: '#C9A84C', weight: 3, dashArray: '8,6', opacity: 0.7
    }).addTo(map);
    convoyMarkers.push(line);

    // Add convoy label at midpoint
    const mid = [(c.from[0] + c.to[0]) / 2, (c.from[1] + c.to[1]) / 2];
    const icon = L.divIcon({
      html: `<div style="background:#0A1628;border:2px solid #C9A84C;border-radius:8px;padding:3px 8px;font-size:11px;font-family:Poppins,sans-serif;color:#C9A84C;white-space:nowrap;font-weight:600">${c.label}</div>`,
      className: '', iconAnchor: [60, 15]
    });
    const m = L.marker(mid, { icon }).addTo(map);
    convoyMarkers.push(m);
  });
}

// ===== TIMELINE PAGE =====
const timelinePhases = [
  {
    time: 'Hrs 0–6', name: 'Setup & Data Pipeline', status: 'done',
    progress: 100,
    tasks: [
      { text: 'DB schema design (PostgreSQL)', done: true },
      { text: 'Docker compose setup', done: true },
      { text: 'Apache Kafka stream configured', done: true },
      { text: 'FastAPI skeleton + routes', done: true },
      { text: 'SAP/DIME mock data ingested', done: true },
    ]
  },
  {
    time: 'Hrs 6–14', name: 'ML Model Training', status: 'done',
    progress: 100,
    tasks: [
      { text: 'LSTM demand forecasting model trained', done: true },
      { text: 'Prophet baseline model built', done: true },
      { text: 'Anomaly detection (Isolation Forest)', done: true },
      { text: 'Model validation — 94.2% accuracy', done: true },
      { text: 'Redis caching layer integrated', done: true },
    ]
  },
  {
    time: 'Hrs 14–22', name: 'GIS Route Optimizer', status: 'done',
    progress: 100,
    tasks: [
      { text: 'OpenStreetMap + Leaflet.js setup', done: true },
      { text: 'A* algorithm implemented', done: true },
      { text: 'Weather API (OpenWeatherMap) linked', done: true },
      { text: 'Forward post markers plotted', done: true },
      { text: 'Convoy route animations added', done: true },
    ]
  },
  {
    time: 'Hrs 22–28', name: 'Dashboard + Alert System', status: 'active',
    progress: 75,
    tasks: [
      { text: 'React.js dashboard — KPI cards', done: true },
      { text: 'Chart.js demand forecast graphs', done: true },
      { text: 'Live IoT simulation (5s refresh)', done: true },
      { text: 'Alert engine with severity levels', done: false },
      { text: 'Mobile responsive layout', done: false },
    ]
  },
  {
    time: 'Hrs 28–34', name: 'IoT + Docker + Integration', status: 'pending',
    progress: 20,
    tasks: [
      { text: 'MQTT protocol IoT simulation', done: false },
      { text: 'Docker containerize full app', done: false },
      { text: 'End-to-end API integration test', done: false },
      { text: 'Load testing (100 concurrent users)', done: false },
      { text: 'AFNET offline edge module test', done: false },
    ]
  },
  {
    time: 'Hrs 34–36', name: 'Demo + Final Polish', status: 'pending',
    progress: 0,
    tasks: [
      { text: 'Full end-to-end demo run', done: false },
      { text: 'Demo data loaded for all 6 posts', done: false },
      { text: 'Demo video recorded', done: false },
      { text: 'PPT final slide polish', done: false },
      { text: 'Netlify deployment live', done: false },
    ]
  }
];

function renderTimeline() {
  const wrapper = document.getElementById('timelineWrapper');
  if (!wrapper) return;

  wrapper.innerHTML = timelinePhases.map((phase, i) => `
    <div class="tl-phase">
      <div class="tl-time">${phase.time}</div>
      <div class="tl-center">
        <div class="tl-dot ${phase.status}"></div>
        ${i < timelinePhases.length - 1 ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-card ${phase.status}">
        <div class="tl-card-head">
          <div class="tl-phase-name">${phase.name}</div>
          <span class="tl-phase-status s-${phase.status}">
            ${phase.status === 'done' ? '✅ Complete' : phase.status === 'active' ? '🔄 In Progress' : '⏳ Upcoming'}
          </span>
        </div>
        <div class="tl-tasks">
          ${phase.tasks.map(t => `
            <div class="tl-task ${t.done ? 'struck' : ''}">
              <span>${t.done ? '✅' : '⬜'}</span>
              ${t.text}
            </div>
          `).join('')}
        </div>
        <div class="tl-prog">
          <div class="tl-prog-fill" style="width:${phase.progress}%"></div>
        </div>
        <div style="font-size:11px;color:var(--grey);margin-top:4px;text-align:right">${phase.progress}% complete</div>
      </div>
    </div>
  `).join('');
}

// ===== DOWNLOAD REPORT =====
function downloadReport() {
  const reportData = `PRABAL — Indian Army Predictive Logistics System
Generated: ${new Date().toLocaleString('en-IN')}
Formation: Northern Command — Udhampur
Officer: Col. R. Sharma
============================================================

FORWARD POST STATUS REPORT
------------------------------------------------------------
${forwardPosts.map(p => `
Post: ${p.name} (${p.location})
  Fuel:     ${p.fuel.toFixed(1)}%  ${p.fuel < 40 ? '⚠️ CRITICAL' : p.fuel < 70 ? '⚠️ LOW' : '✅ OK'}
  Ration:   ${p.ration.toFixed(1)}%  ${p.ration < 40 ? '⚠️ CRITICAL' : p.ration < 70 ? '⚠️ LOW' : '✅ OK'}
  Medicine: ${p.medicine.toFixed(1)}%  ${p.medicine < 40 ? '⚠️ CRITICAL' : p.medicine < 70 ? '⚠️ LOW' : '✅ OK'}
  Ammo:     ${p.ammo.toFixed(1)}%  ${p.ammo < 40 ? '⚠️ CRITICAL' : p.ammo < 70 ? '⚠️ LOW' : '✅ OK'}
  Status:   ${p.status.toUpperCase()}
`).join('')}

============================================================
ACTIVE ALERTS
------------------------------------------------------------
1. [CRITICAL] Fuel shortage — Daulat Beg Oldi — Action Required
2. [WARNING]  Ration low — Kargil Sector Post — Schedule resupply in 7 days
3. [WARNING]  Route NH-1D blocked — Use Mughal Road alternative

============================================================
AI FORECAST SUMMARY (LSTM Model — 94.2% accuracy)
------------------------------------------------------------
- Fuel demand: Peak expected in next 10-14 days
- Rations: Stable for 30 days across all posts
- Medicine: Low risk — adequate stocks for 45+ days
- Ammunition: Reorder recommended within 12 days at DBO

============================================================
SYSTEM STATUS
------------------------------------------------------------
IoT Sensors:       All 6 posts synced
AFNET Status:      Online
Model Version:     LSTM v2.3 (October 2026)
Last Sync:         ${new Date().toLocaleTimeString('en-IN')}
Forecast Accuracy: 94.2%

============================================================
PRABAL — Predictive Real-time Army Base Asset Logistics
SIH 2026 | Problem Statement: SIH26251
Ministry of Defence, Government of India
============================================================`;

  const blob = new Blob([reportData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PRABAL_Report_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Report downloaded successfully!', 'success');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ===== OVERRIDE initApp to add new features =====
const _origInitApp = initApp;
initApp = function() {
  _origInitApp();
  startIoTSimulation();
  renderTimeline();

  // Show toast after 2s
  setTimeout(() => showToast('📡 IoT sensors connected — Live data active', 'success'), 2000);
};

// ===== OVERRIDE showPage to handle timeline + convoy =====
const _origShowPage = showPage;
showPage = function(pageName) {
  _origShowPage(pageName);
  if (pageName === 'timeline') renderTimeline();
  if (pageName === 'routes') {
    setTimeout(() => {
      initMap();
      setTimeout(addConvoyAnimations, 500);
    }, 100);
  }
};

// ===== OVERRIDE toggleSidebar for mobile =====
toggleSidebar = function() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('open');
};
