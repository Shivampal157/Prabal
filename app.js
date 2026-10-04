// ===== PRABAL — Main Application Logic =====

// ===== DATA =====
const forwardPosts = [
  { name: "Siachen Base Camp", location: "Ladakh, J&K", lat: 35.4208, lng: 76.8461, fuel: 72, ration: 85, medicine: 91, ammo: 60, status: "ok" },
  { name: "Daulat Beg Oldi", location: "Ladakh, J&K", lat: 35.3871, lng: 77.3044, fuel: 28, ration: 45, medicine: 70, ammo: 55, status: "critical" },
  { name: "Kargil Sector Post", location: "Kargil, J&K", lat: 34.5595, lng: 76.1326, fuel: 63, ration: 55, medicine: 80, ammo: 72, status: "low" },
  { name: "Turtuk Forward Post", location: "Nubra, Ladakh", lat: 34.8481, lng: 76.8286, fuel: 88, ration: 92, medicine: 65, ammo: 80, status: "ok" },
  { name: "Nathu La Pass", location: "Sikkim", lat: 27.3897, lng: 88.8287, fuel: 40, ration: 70, medicine: 88, ammo: 65, status: "low" },
  { name: "Tawang Sector", location: "Arunachal Pradesh", lat: 27.5860, lng: 91.8696, fuel: 78, ration: 82, medicine: 74, ammo: 90, status: "ok" },
];

const alerts = [
  {
    type: "critical", icon: "🚨",
    title: "CRITICAL: Fuel shortage predicted at Daulat Beg Oldi",
    desc: "AI model predicts fuel stocks will reach critical levels (< 20%) within 6 days. Current stock: 28%. Immediate resupply convoy required. Route via Leh–DBO axis recommended.",
    time: "2 minutes ago", severity: "CRITICAL",
    actions: ["Dispatch Convoy", "View Route"]
  },
  {
    type: "warning", icon: "⚠️",
    title: "WARNING: Ration stock low at Kargil Sector Post",
    desc: "Ration levels at 55% — below the 60% alert threshold. Based on consumption patterns, estimated depletion in 18 days. Schedule resupply within the next 7 days.",
    time: "34 minutes ago", severity: "WARNING",
    actions: ["Schedule Resupply", "View Details"]
  },
  {
    type: "warning", icon: "⛰️",
    title: "WARNING: Route NH-1D blocked due to landslide",
    desc: "PRABAL GIS detects NH-1D (Jammu–Srinagar) blocked near Ramban. Affecting 3 scheduled convoys. Alternative route via Mughal Road available — ETA +4 hours.",
    time: "1 hour ago", severity: "WARNING",
    actions: ["Use Alt Route", "Notify Convoys"]
  },
  {
    type: "info", icon: "📦",
    title: "INFO: Ammunition resupply completed — Turtuk Post",
    desc: "Scheduled ammunition resupply successfully completed at Turtuk Forward Post. Stock level: 80%. Next scheduled resupply: 25 days.",
    time: "3 hours ago", severity: "INFO",
    actions: ["View Report"]
  },
  {
    type: "info", icon: "🧠",
    title: "INFO: AI model retrained with latest consumption data",
    desc: "LSTM demand forecasting model updated with October 2026 consumption patterns. New model shows 94.2% accuracy on validation set. Updated predictions now active.",
    time: "6 hours ago", severity: "INFO",
    actions: ["View Model Report"]
  }
];

const activities = [
  { icon: "🚚", text: "Convoy A-12 departed Leh Depot for Siachen", time: "8 min ago" },
  { icon: "📦", text: "Ration stock updated — Tawang Sector: 82%", time: "22 min ago" },
  { icon: "🧠", text: "AI forecast generated for November requirements", time: "45 min ago" },
  { icon: "🗺️", text: "Route optimized: Jammu → Kargil (via Srinagar)", time: "1 hr ago" },
  { icon: "⚠️", text: "Low fuel alert triggered — Kargil Sector Post", time: "1.5 hr ago" },
  { icon: "✅", text: "Medical resupply confirmed — Nathu La Pass", time: "2 hr ago" },
  { icon: "📡", text: "IoT sync completed — all 6 forward posts", time: "3 hr ago" },
];

const inventoryData = [...forwardPosts];

// ===== CHART INSTANCES =====
let forecastChart, categoryChart, fcDetailChart;
let map, mapInitialized = false;

// ===== UTILS =====
function getStatusClass(val) {
  if (val >= 70) return "status-ok";
  if (val >= 40) return "status-low";
  return "status-critical";
}
function getStatusLabel(val) {
  if (val >= 70) return "OK";
  if (val >= 40) return "LOW";
  return "CRITICAL";
}
function getBarClass(val) {
  if (val >= 70) return "bar-green";
  if (val >= 40) return "bar-yellow";
  return "bar-red";
}

// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button');
  btn.textContent = "Authenticating...";
  btn.disabled = true;
  setTimeout(() => {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.body.style.background = '#0A1628';
    initApp();
  }, 1200);
});

function logout() {
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginForm').querySelector('button').textContent = "Access PRABAL Dashboard";
  document.getElementById('loginForm').querySelector('button').disabled = false;
}

// ===== INIT =====
function initApp() {
  updateClock();
  setInterval(updateClock, 1000);
  animateKPIs();
  renderPostsTable();
  renderActivity();
  initCharts();
  renderInventory();
  renderAlerts();
  fetchWeather();
}

function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const d = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const el = document.getElementById('timeDisplay');
  if (el) el.textContent = `${d}  ${t}`;
}

// ===== KPI ANIMATION =====
function animateKPIs() {
  document.querySelectorAll('.kpi-num').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString();
    }, 20);
  });
}

// ===== POSTS TABLE =====
function renderPostsTable() {
  const tbody = document.getElementById('postsTableBody');
  if (!tbody) return;
  tbody.innerHTML = forwardPosts.map(p => `
    <tr>
      <td style="font-weight:600">${p.name}</td>
      <td style="color:var(--grey)">${p.location}</td>
      <td>
        <div class="prog-bar-wrap">
          <div style="font-size:11px;margin-bottom:2px;color:${p.fuel<40?'#FF6B6B':p.fuel<70?'#FF9F43':'#40C074'}">${p.fuel}%</div>
          <div class="prog-bar"><div class="prog-fill ${getBarClass(p.fuel)}" style="width:${p.fuel}%"></div></div>
        </div>
      </td>
      <td>
        <div class="prog-bar-wrap">
          <div style="font-size:11px;margin-bottom:2px;color:${p.ration<40?'#FF6B6B':p.ration<70?'#FF9F43':'#40C074'}">${p.ration}%</div>
          <div class="prog-bar"><div class="prog-fill ${getBarClass(p.ration)}" style="width:${p.ration}%"></div></div>
        </div>
      </td>
      <td>
        <div class="prog-bar-wrap">
          <div style="font-size:11px;margin-bottom:2px;color:${p.medicine<40?'#FF6B6B':p.medicine<70?'#FF9F43':'#40C074'}">${p.medicine}%</div>
          <div class="prog-bar"><div class="prog-fill ${getBarClass(p.medicine)}" style="width:${p.medicine}%"></div></div>
        </div>
      </td>
      <td><span class="status-badge ${getStatusClass(Math.min(p.fuel,p.ration,p.medicine))}">${getStatusLabel(Math.min(p.fuel,p.ration,p.medicine))}</span></td>
    </tr>
  `).join('');
}

// ===== ACTIVITY =====
function renderActivity() {
  const el = document.getElementById('activityList');
  if (!el) return;
  el.innerHTML = activities.map(a => `
    <div class="act-item">
      <div class="act-icon">${a.icon}</div>
      <div>
        <div class="act-text">${a.text}</div>
        <div class="act-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

// ===== CHARTS =====
function initCharts() {
  const chartOpts = {
    plugins: { legend: { labels: { color: '#8892A4', font: { family: 'Poppins', size: 11 } } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892A4', font: { family: 'Poppins', size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892A4', font: { family: 'Poppins', size: 10 } } }
    }
  };

  // Forecast Chart
  const fc = document.getElementById('forecastChart');
  if (fc) {
    const labels = Array.from({length: 30}, (_, i) => `Oct ${i+3}`);
    forecastChart = new Chart(fc, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'AI Prediction (LSTM)',
            data: labels.map(() => Math.floor(Math.random()*400)+800),
            borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.1)',
            tension: 0.4, fill: true, pointRadius: 0
          },
          {
            label: 'Actual Consumption',
            data: labels.map((_,i) => i<7 ? Math.floor(Math.random()*350)+820 : null),
            borderColor: '#40C074', backgroundColor: 'rgba(64,192,116,0.1)',
            tension: 0.4, fill: true, pointRadius: 3
          }
        ]
      },
      options: { ...chartOpts, responsive: true }
    });
  }

  // Category Chart
  const cc = document.getElementById('categoryChart');
  if (cc) {
    categoryChart = new Chart(cc, {
      type: 'doughnut',
      data: {
        labels: ['Fuel', 'Ration', 'Medicine', 'Ammo', 'Spare Parts'],
        datasets: [{
          data: [30, 25, 15, 20, 10],
          backgroundColor: ['#C9A84C','#40C074','#2563EB','#FF6B6B','#FF9F43'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#8892A4', font: { family: 'Poppins', size: 10 }, padding: 10 } } }
      }
    });
  }
}

function updateForecastChart(category) {
  if (!forecastChart) return;
  const base = { fuel: 900, ammo: 600, ration: 1200, medicine: 350 };
  const b = base[category] || 800;
  forecastChart.data.datasets[0].data = forecastChart.data.labels.map(() => Math.floor(Math.random()*300)+b);
  forecastChart.data.datasets[1].data = forecastChart.data.labels.map((_,i) => i<7 ? Math.floor(Math.random()*280)+(b+20) : null);
  forecastChart.update();
}

// ===== FORECAST PAGE =====
function runForecast() {
  const post = document.getElementById('fcPost').value;
  const cat = document.getElementById('fcCategory').value;

  const data = {
    req: Math.floor(Math.random()*500)+800,
    acc: (92 + Math.random()*4).toFixed(1) + "%",
    status: Math.random() > 0.3 ? "✅ Sufficient" : "⚠️ Order Soon",
    reorder: Math.floor(Math.random()*10)+5 + " days"
  };

  document.getElementById('fc30day').textContent = data.req + " units";
  document.getElementById('fcAccuracy').textContent = data.acc;
  document.getElementById('fcStatus').textContent = data.status;
  document.getElementById('fcReorder').textContent = data.reorder;

  // Draw detail chart
  if (fcDetailChart) fcDetailChart.destroy();
  const ctx = document.getElementById('fcDetailChart');
  if (ctx) {
    const labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
    fcDetailChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Predicted Demand',
            data: labels.map(() => Math.floor(Math.random()*80)+(data.req/30-10)),
            backgroundColor: 'rgba(201,168,76,0.7)', borderRadius: 4
          },
          {
            label: 'Safety Stock Level',
            data: labels.map(() => 40),
            type: 'line', borderColor: '#FF6B6B', borderDash: [5,5],
            pointRadius: 0, fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#8892A4', font: { family: 'Poppins', size: 11 } } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8892A4', font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8892A4', font: { size: 9 } } }
        }
      }
    });
  }

  // AI Insight
  callGeminiForInsight(post, cat);
}

async function callGeminiForInsight(post, category) {
  const el = document.getElementById('aiInsightText');
  el.textContent = "⏳ Analyzing with Gemini AI...";

  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    // Demo mode without API key
    const insights = [
      `Based on historical consumption patterns at ${post}, ${category} requirements are expected to peak in the next 10-14 days due to increased operational tempo. Recommend pre-positioning 15% extra buffer stock. Current weather forecast shows potential road blockages — suggest dispatching convoy within 3 days via optimal route.`,
      `AI analysis indicates a 23% spike in ${category} consumption expected at ${post} during November due to seasonal factors (temperature drop → increased fuel consumption for heating). Current stock levels are adequate for 28 days. However, the Zojila Pass closure window is approaching — schedule resupply before October 15.`,
      `Anomaly detected in ${category} consumption at ${post}: 18% higher than predicted over last 7 days. Possible cause: additional equipment deployment. Recommend immediate stock audit and revision of 30-day forecast. Adjusted requirement: +120 units above baseline prediction.`
    ];
    el.innerHTML = insights[Math.floor(Math.random() * insights.length)];
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are PRABAL, an AI logistics assistant for the Indian Army. Analyze the supply situation for: Post: ${post}, Category: ${category}. Give a 3-4 sentence practical logistics insight about demand prediction, risk factors, and recommended action. Be specific and military-logistics focused. Keep it professional and concise.`
          }]
        }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    el.textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis complete. Please review the forecast chart above.";
  } catch(err) {
    console.warn('Gemini error:', err);
    el.textContent = "AI analysis complete. Demand forecast shows elevated consumption trend. Recommend pre-positioning 15% buffer stock at this forward post before the next weather window.";
  }
}

// ===== MAP / ROUTES =====
function initMap() {
  if (mapInitialized) return;
  map = L.map('map').setView([33.7, 76.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 16
  }).addTo(map);

  // Add forward post markers
  forwardPosts.forEach(p => {
    const color = p.status === 'critical' ? '#FF6B6B' : p.status === 'low' ? '#FF9F43' : '#40C074';
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 8, fillColor: color, color: 'white', weight: 2, fillOpacity: 0.9
    }).addTo(map);
    marker.bindPopup(`
      <div style="font-family:Poppins,sans-serif;min-width:160px">
        <strong>${p.name}</strong><br/>
        <span style="color:#666;font-size:11px">${p.location}</span><br/>
        <div style="margin-top:6px;font-size:12px">
          ⛽ Fuel: <strong>${p.fuel}%</strong><br/>
          🍽️ Ration: <strong>${p.ration}%</strong><br/>
          💊 Medicine: <strong>${p.medicine}%</strong>
        </div>
      </div>
    `);
  });

  // Depot marker
  L.marker([32.7266, 74.8570]).addTo(map)
    .bindPopup('<strong>Jammu Supply Depot</strong><br/>Northern Command HQ');

  mapInitialized = true;
}

function optimizeRoute() {
  const from = document.getElementById('routeFrom').value;
  const to = document.getElementById('routeTo').value;

  const routes = {
    "Siachen Base Camp": { dist: "386 km", time: "11-14 hrs", terrain: "High Altitude (5,400m)", weather: "Clear ✅", lat: 35.4208, lng: 76.8461 },
    "Daulat Beg Oldi": { dist: "516 km", time: "14-18 hrs", terrain: "Extreme (5,200m)", weather: "Light Snow ⚠️", lat: 35.3871, lng: 77.3044 },
    "Kargil Post": { dist: "218 km", time: "6-8 hrs", terrain: "Mountain (2,800m)", weather: "Clear ✅", lat: 34.5595, lng: 76.1326 },
    "Turtuk Post": { dist: "210 km", time: "7-9 hrs", terrain: "Valley (3,000m)", weather: "Partly Cloudy", lat: 34.8481, lng: 76.8286 },
  };

  const r = routes[to] || routes["Kargil Post"];
  document.getElementById('rDistance').textContent = r.dist;
  document.getElementById('rTime').textContent = r.time;
  document.getElementById('rTerrain').textContent = r.terrain;
  document.getElementById('rWeather').textContent = r.weather;

  const sb = document.getElementById('rStatus');
  const isOk = r.weather.includes('✅');
  sb.textContent = isOk ? "✅ Route Clear — Convoy Approved" : "⚠️ Proceed with Caution";
  sb.style.background = isOk ? 'rgba(64,192,116,0.15)' : 'rgba(255,159,67,0.15)';
  sb.style.color = isOk ? '#40C074' : '#FF9F43';
  document.getElementById('routeResult').style.display = 'block';

  // Draw route on map
  if (map) {
    map.eachLayer(l => { if (l instanceof L.Polyline) map.removeLayer(l); });
    const depotCoords = { "Leh Main Depot": [34.1526, 77.5771], "Jammu Supply Depot": [32.7266, 74.8570], "Srinagar Base": [34.0837, 74.7973], "Chandigarh Depot": [30.7333, 76.7794] };
    const fromCoords = depotCoords[from] || [32.7266, 74.8570];
    L.polyline([fromCoords, [r.lat, r.lng]], {
      color: isOk ? '#40C074' : '#FF9F43', weight: 4, dashArray: '10,6', opacity: 0.8
    }).addTo(map);
    map.fitBounds([[fromCoords[0], fromCoords[1]], [r.lat, r.lng]], { padding: [40, 40] });
  }
}

// ===== INVENTORY =====
function renderInventory(filter = '') {
  const grid = document.getElementById('invGrid');
  if (!grid) return;
  const filtered = inventoryData.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.location.toLowerCase().includes(filter.toLowerCase()));
  grid.innerHTML = filtered.map(p => `
    <div class="inv-card">
      <div class="inv-card-header">
        <div>
          <div class="inv-post-name">${p.name}</div>
          <div class="inv-location">📍 ${p.location}</div>
        </div>
        <span class="status-badge ${getStatusClass(Math.min(p.fuel,p.ration,p.medicine,p.ammo))}">${getStatusLabel(Math.min(p.fuel,p.ration,p.medicine,p.ammo))}</span>
      </div>
      <div class="inv-bars">
        ${[['⛽ Fuel', p.fuel], ['🍽️ Ration', p.ration], ['💊 Medicine', p.medicine], ['🔫 Ammo', p.ammo]].map(([label, val]) => `
          <div class="inv-bar-item">
            <div class="inv-bar-label">${label}</div>
            <div class="inv-bar-bg"><div class="inv-bar-fill ${getBarClass(val)}" style="width:${val}%"></div></div>
            <div class="inv-bar-val" style="color:${val<40?'#FF6B6B':val<70?'#FF9F43':'#40C074'}">${val}%</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function filterInventory() {
  const q = document.getElementById('invSearch')?.value || '';
  renderInventory(q);
}

// ===== ALERTS =====
function renderAlerts() {
  const el = document.getElementById('alertsList');
  if (!el) return;
  el.innerHTML = alerts.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-icon">${a.icon}</div>
      <div class="alert-content">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <div class="alert-title">${a.title}</div>
          <span class="alert-severity sev-${a.type}">${a.severity}</span>
        </div>
        <div class="alert-desc">${a.desc}</div>
        <div class="alert-meta">🕐 ${a.time}</div>
        <div class="alert-actions">
          ${a.actions.map((act, i) => `<button class="alert-btn ${i===0?'primary':'secondary'}" onclick="handleAlert('${act}')">${act}</button>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function handleAlert(action) {
  if (action === 'Dispatch Convoy' || action === 'View Route') showPage('routes');
  else alert(`✅ Action "${action}" has been logged and initiated.`);
}

// ===== WEATHER =====
async function fetchWeather() {
  const el = document.getElementById('weatherText');
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=32.7266&lon=74.8570&appid=${CONFIG.WEATHER_API_KEY}&units=metric`);
    const d = await res.json();
    if (d.cod !== 200) throw new Error('API error');
    const icons = { Clear:'☀️', Clouds:'☁️', Rain:'🌧️', Snow:'❄️', Fog:'🌫️', Haze:'🌫️', Mist:'🌫️', Thunderstorm:'⛈️', Drizzle:'🌦️' };
    const icon = icons[d.weather[0].main] || '🌤️';
    el.innerHTML = `${icon} Jammu: <strong>${Math.round(d.main.temp)}°C</strong>, ${d.weather[0].description}`;
    // Also fetch Leh weather
    fetchLehWeather();
  } catch(err) {
    console.warn('Weather API:', err);
    el.textContent = 'Jammu: 24°C, Clear';
  }
}

async function fetchLehWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=34.1526&lon=77.5771&appid=${CONFIG.WEATHER_API_KEY}&units=metric`);
    const d = await res.json();
    if (d.cod !== 200) return;
    const el = document.getElementById('weatherText');
    el.innerHTML += ` &nbsp;|&nbsp; ❄️ Leh: <strong>${Math.round(d.main.temp)}°C</strong>`;
  } catch {}
}

// ===== AI CHAT =====
async function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const messages = document.getElementById('chatMessages');

  // User message
  messages.innerHTML += `
    <div class="chat-msg user">
      <div class="cm-avatar">👤</div>
      <div class="cm-bubble">${msg}</div>
    </div>`;

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  messages.innerHTML += `
    <div class="chat-msg bot" id="${typingId}">
      <div class="cm-avatar">🪖</div>
      <div class="cm-bubble typing"><span></span><span></span><span></span></div>
    </div>`;
  messages.scrollTop = messages.scrollHeight;

  let reply = "";

  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    // Smart demo responses
    const q = msg.toLowerCase();
    if (q.includes('fuel') || q.includes('siachen')) {
      reply = "⛽ Fuel Status Update:\n• Siachen Base Camp: 72% — OK\n• Daulat Beg Oldi: 28% — CRITICAL ⚠️\n• Kargil Sector: 63% — OK\n\nRecommendation: Immediately dispatch fuel convoy to Daulat Beg Oldi. Estimated route via Leh: 516 km, 14-18 hours.";
    } else if (q.includes('route') || q.includes('convoy')) {
      reply = "🗺️ Current Route Status:\n• Leh → Siachen: Clear ✅ (11-14 hrs)\n• Leh → DBO: Clear ✅ (14-18 hrs)\n• Jammu → Kargil: NH-1D blocked ⚠️ — Use Mughal Road (+4 hrs)\n\nAll active convoys have been notified. Go to Route Optimizer for detailed planning.";
    } else if (q.includes('forecast') || q.includes('predict')) {
      reply = "🧠 30-Day Demand Forecast Summary:\n• Fuel: 94.2% accuracy | Peak demand: Oct 15-18\n• Rations: 91.8% accuracy | Stable\n• Medicine: 96.1% accuracy | Low risk\n• Ammunition: 89.3% accuracy | Reorder in 12 days\n\nGo to AI Demand Forecast for post-specific predictions.";
    } else if (q.includes('alert') || q.includes('critical')) {
      reply = "🚨 Active Alerts (3):\n1. CRITICAL: Fuel shortage — Daulat Beg Oldi (6 days)\n2. WARNING: Ration low — Kargil Sector (18 days)\n3. WARNING: NH-1D route blocked — Ramban\n\nAll alerts have been notified to Northern Command logistics cell.";
    } else {
      reply = "Understood. PRABAL is monitoring all 6 forward posts in real-time. Current system status: 4 posts OK, 1 LOW (Kargil), 1 CRITICAL (DBO). All IoT sensors synced. AI forecast models running at 94%+ accuracy. How can I assist further with logistics planning?";
    }
    await new Promise(r => setTimeout(r, 1200));
  } else {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are PRABAL AI, an intelligent logistics assistant for the Indian Army's PRABAL system (Predictive Real-time Army Base Asset Logistics). You help military logistics officers with supply chain queries, demand forecasts, route planning, and inventory management. The system monitors 6 forward posts: Siachen Base Camp (fuel:72%), Daulat Beg Oldi (fuel:28% - CRITICAL shortage), Kargil Sector (fuel:63%), Turtuk Post (fuel:88%), Nathu La Pass (fuel:40%), Tawang Sector (fuel:78%). Respond in professional military logistics style. Keep response under 100 words. User query: ${msg}`
            }]
          }]
        })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "Query processed. Please check the dashboard for latest data.";
    } catch(err) {
      console.warn('Gemini chat error:', err);
      reply = "PRABAL AI processing your query. Based on current data: All 6 posts monitored. 1 critical (DBO - fuel 28%), 1 warning (Kargil - ration 55%). Recommend immediate resupply dispatch to DBO via Leh axis.";
    }
  }

  document.getElementById(typingId)?.remove();
  messages.innerHTML += `
    <div class="chat-msg bot">
      <div class="cm-avatar">🪖</div>
      <div class="cm-bubble" style="white-space:pre-line">${reply}</div>
    </div>`;
  messages.scrollTop = messages.scrollHeight;
}

// ===== PAGE NAVIGATION =====
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + pageName);
  if (page) page.classList.add('active');

  const navItem = document.querySelector(`.nav-item[onclick="showPage('${pageName}')"]`);
  if (navItem) navItem.classList.add('active');

  const titles = {
    dashboard: 'Dashboard Overview',
    forecast: 'AI Demand Forecast Engine',
    routes: 'GIS Route Optimizer',
    inventory: 'Inventory Tracker',
    alerts: 'Alert Center',
    aiassist: 'PRABAL AI Assistant'
  };
  document.getElementById('pageTitle').textContent = titles[pageName] || 'PRABAL';

  if (pageName === 'routes') {
    setTimeout(initMap, 100);
  }
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const mc = document.querySelector('.main-content');
  if (sb.style.transform === 'translateX(-100%)') {
    sb.style.transform = '';
    mc.style.marginLeft = 'var(--sidebar-w)';
  } else {
    sb.style.transform = 'translateX(-100%)';
    mc.style.marginLeft = '0';
  }
}
