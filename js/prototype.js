// ECG Canvas Animation
(function() {
  const canvas = document.getElementById('ecgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animFrame;
  let offset = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
  }

  function generateECGPoint(x) {
    const period = 120;
    const pos = ((x + offset) % period + period) % period;
    const h = canvas.height / 4;
    const mid = h * 1.05;

    if (pos > 40 && pos < 45) return mid - h * 0.08;
    if (pos > 45 && pos < 50) return mid + h * 0.05;
    if (pos > 50 && pos < 53) return mid - h * 0.7;
    if (pos > 53 && pos < 56) return mid + h * 0.35;
    if (pos > 56 && pos < 60) return mid - h * 0.05;
    if (pos > 70 && pos < 80) {
      const t = (pos - 70) / 10;
      return mid - Math.sin(t * Math.PI) * h * 0.15;
    }
    return mid;
  }

  function draw() {
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // ECG line
    ctx.beginPath();
    ctx.strokeStyle = '#e8651a';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let x = 0; x < w; x++) {
      const y = generateECGPoint(x);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(232, 101, 26, 0.15)';
    ctx.lineWidth = 6;
    for (let x = 0; x < w; x++) {
      const y = generateECGPoint(x);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ms labels above each spike
    const period = 120;
    const spikePos = 52;
    const msValues = [868, 858, 862, 870, 855, 864];
    for (let i = -1; i < Math.ceil(w / period) + 1; i++) {
      const peakX = (i * period + spikePos - (offset % period) + period) % (w + period) - period / 2;
      if (peakX > -30 && peakX < w + 30) {
        const val = msValues[((i + Math.floor(offset / period)) % msValues.length + msValues.length) % msValues.length];
        ctx.font = '400 11px Outfit, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText(val, peakX, 12);
      }
    }

    offset += 0.5;
    animFrame = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

// Timer animation
(function() {
  let seconds = 11;
  const display = document.getElementById('timerDisplay');
  const progress = document.getElementById('timerProgress');
  const circumference = 2 * Math.PI * 70;

  progress.style.strokeDasharray = circumference;

  function updateTimer() {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;

    const fraction = (seconds % 60) / 60;
    progress.style.strokeDashoffset = circumference * (1 - fraction);
  }

  setInterval(updateTimer, 1000);

  const initialFraction = 11 / 60;
  progress.style.strokeDashoffset = circumference * (1 - initialFraction);
})();

// HRV Bar Chart
(function() {
  const container = document.getElementById('hrvBarChart');
  const barHeights = [
    35, 45, 55, 40, 60, 50, 70, 45, 55, 65, 40, 50,
    30, 45, 55, 35, 60, 50, 75, 55, 65, 45, 40, 55,
    60, 80, 70, 65, 85, 75, 90, 70, 80, 60, 55, 50,
    45, 65, 75, 55, 70, 60, 85, 75, 95, 80, 90, 70,
    55, 60, 45, 50, 40, 35, 30, 25, 35, 30, 20, 25
  ];

  barHeights.forEach((h, i) => {
    const col = document.createElement('div');
    col.className = 'bar-col';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = h + '%';
    const opacity = 0.5 + (h / 100) * 0.5;
    bar.style.opacity = opacity;
    col.appendChild(bar);
    container.appendChild(col);
  });
})();

// Match Detail Charts
(function() {
  // Donut Chart - Game Balance
  const donutCanvas = document.getElementById('donutChart');
  if (donutCanvas) {
    const ctx = donutCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    donutCanvas.width = 200 * dpr;
    donutCanvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    const cx = 100, cy = 100, r = 40, lw = 22;
    const data = [
      { val: 6, color: '#ef4444' },
      { val: 9, color: '#f59e0b' },
      { val: 6, color: '#3b82f6' },
      { val: 77, color: '#d1d5db' }
    ];
    const total = data.reduce((a, d) => a + d.val, 0);
    let start = -Math.PI / 2;

    data.forEach(d => {
      const sweep = (d.val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + sweep);
      ctx.lineWidth = lw;
      ctx.strokeStyle = d.color;
      ctx.lineCap = 'butt';
      ctx.stroke();
      start += sweep;
    });
  }

  // Score Difference Chart
  const sdCanvas = document.getElementById('scoreDiffChart');
  if (sdCanvas) {
    const ctx = sdCanvas.getContext('2d');
    const rect = sdCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    sdCanvas.width = rect.width * dpr;
    sdCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;

    const points = [0,1,2,1,3,5,8,10,12,15,18,16,13,10,8,5,3,1,-1,-3,
      -5,-3,0,2,5,8,12,15,12,10,7,4,2,0,-2,-4,-3,0,3,6,
      10,13,16,18,15,12,9,6,3,1,-1,0,2,5,8,10,7,4,1,-1];
    const maxAbs = 20;
    const mid = h / 2;
    const xStep = w / (points.length - 1);

    // Zero line dashed
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.font = '300 10px Outfit, sans-serif';
    ctx.fillStyle = '#bbb';
    ctx.textAlign = 'right';
    [20, 15, 10, 5, 0, -5].forEach(v => {
      const y = mid - (v / maxAbs) * (h / 2 - 10);
      ctx.fillText(v + 'p', w - 2, y + 3);
    });

    // Set dividers
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    [20, 40].forEach(i => {
      const x = i * xStep;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    });

    // Fill area
    ctx.beginPath();
    ctx.moveTo(0, mid);
    points.forEach((p, i) => {
      const x = i * xStep;
      const y = mid - (p / maxAbs) * (h / 2 - 10);
      ctx.lineTo(x, y);
    });
    ctx.lineTo((points.length - 1) * xStep, mid);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(34,197,94,0.25)');
    grad.addColorStop(0.5, 'rgba(34,197,94,0.05)');
    grad.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => {
      const x = i * xStep;
      const y = mid - (p / maxAbs) * (h / 2 - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Shots per Point Chart
  const sppCanvas = document.getElementById('shotsPerPointChart');
  if (sppCanvas) {
    const ctx = sppCanvas.getContext('2d');
    const rect = sppCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    sppCanvas.width = rect.width * dpr;
    sppCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;

    // 60 mocked rallies: shots per rally + winning team (1 = us, 2 = them).
    const rallies = [
      { s: 3, w: 1 }, { s: 5, w: 2 }, { s: 7, w: 1 }, { s: 2, w: 1 },
      { s: 4, w: 2 }, { s: 9, w: 1 }, { s: 6, w: 1 }, { s: 11, w: 2 },
      { s: 4, w: 1 }, { s: 3, w: 1 }, { s: 8, w: 2 }, { s: 5, w: 1 },
      { s: 2, w: 1 }, { s: 7, w: 2 }, { s: 6, w: 1 }, { s: 4, w: 2 },
      { s: 10, w: 1 }, { s: 3, w: 1 }, { s: 5, w: 2 }, { s: 8, w: 1 },
      { s: 4, w: 2 }, { s: 6, w: 2 }, { s: 9, w: 1 }, { s: 3, w: 1 },
      { s: 12, w: 2 }, { s: 4, w: 1 }, { s: 7, w: 1 }, { s: 5, w: 2 },
      { s: 3, w: 1 }, { s: 6, w: 1 }, { s: 8, w: 2 }, { s: 4, w: 1 },
      { s: 5, w: 2 }, { s: 9, w: 1 }, { s: 6, w: 1 }, { s: 3, w: 2 },
      { s: 7, w: 1 }, { s: 4, w: 2 }, { s: 11, w: 1 }, { s: 5, w: 1 },
      { s: 6, w: 2 }, { s: 8, w: 1 }, { s: 3, w: 1 }, { s: 4, w: 2 },
      { s: 7, w: 1 }, { s: 5, w: 2 }, { s: 9, w: 1 }, { s: 6, w: 1 },
      { s: 2, w: 2 }, { s: 5, w: 1 }, { s: 7, w: 1 }, { s: 4, w: 2 },
      { s: 6, w: 1 }, { s: 8, w: 1 }, { s: 3, w: 2 }, { s: 5, w: 1 },
      { s: 7, w: 1 }, { s: 4, w: 2 }, { s: 6, w: 1 }, { s: 9, w: 1 }
    ];
    const maxShots = 12;
    const padTop = 10, padBottom = 18, padRight = 22;
    const innerH = h - padTop - padBottom;
    const innerW = w - padRight;
    const slot = innerW / rallies.length;
    const barW = Math.max(2, slot * 0.7);

    // Y-axis labels + horizontal gridlines
    ctx.font = '300 10px Outfit, sans-serif';
    ctx.fillStyle = '#bbb';
    ctx.textAlign = 'right';
    [0, 4, 8, 12].forEach(v => {
      const y = padTop + (1 - v / maxShots) * innerH;
      ctx.fillText(v, w - 2, y + 3);
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
    });

    // Set dividers (matches Score Difference chart at points 20 and 40)
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    [20, 40].forEach(i => {
      const x = i * slot;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + innerH);
      ctx.stroke();
    });

    // Bars
    rallies.forEach((r, i) => {
      const barH = (r.s / maxShots) * innerH;
      const x = i * slot + (slot - barW) / 2;
      const y = padTop + innerH - barH;
      ctx.fillStyle = r.w === 1 ? '#e8651a' : '#1a1a1a';
      const radius = 2;
      const bw = barW;
      const bh = Math.max(barH, 1);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + bw - radius, y);
      ctx.quadraticCurveTo(x + bw, y, x + bw, y + radius);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    });

    // X-axis labels
    ctx.fillStyle = '#bbb';
    ctx.textAlign = 'center';
    [1, 20, 40, 60].forEach(p => {
      const x = (p - 1) * slot + slot / 2;
      if (x < w - padRight) ctx.fillText('#' + p, x, h - 4);
    });
  }

  // Shots per Point — server filter chips: tap to toggle, tap again to clear.
  document.querySelectorAll('.md-spp-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      document.querySelectorAll('.md-spp-filter').forEach(b => b.classList.remove('active'));
      if (!wasActive) btn.classList.add('active');
    });
  });

  // Heart Rate Chart
  const hrCanvas = document.getElementById('hrChart');
  if (hrCanvas) {
    const ctx = hrCanvas.getContext('2d');
    const rect = hrCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    hrCanvas.width = rect.width * dpr;
    hrCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;

    const hrData = [75,76,76,77,78,80,82,81,80,79,78,77,76,76,75,76,
      77,78,80,82,84,82,80,78,77,76,76,75,76,77,78,79,
      80,81,80,79,78,77,76,76,75,75,76,77,78,80,79,78,77,76];
    const minHR = 70, maxHR = 90;
    const xStep = w / (hrData.length - 1);
    const pad = 14;

    // Y-axis labels
    ctx.font = '300 10px Outfit, sans-serif';
    ctx.fillStyle = '#bbb';
    ctx.textAlign = 'right';
    [90, 80, 70].forEach(v => {
      const y = pad + (1 - (v - minHR) / (maxHR - minHR)) * (h - pad * 2);
      ctx.fillText(v, w - 2, y + 3);
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    });

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bbb';
    ['0:00', '0:50', '1:40'].forEach((label, i) => {
      const x = (i / 2) * w * 0.85;
      ctx.fillText(label, x + 10, h - 2);
    });

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, h - pad);
    hrData.forEach((v, i) => {
      const x = i * xStep;
      const y = pad + (1 - (v - minHR) / (maxHR - minHR)) * (h - pad * 2);
      ctx.lineTo(x, y);
    });
    ctx.lineTo((hrData.length - 1) * xStep, h - pad);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(231,76,60,0.2)');
    grad.addColorStop(1, 'rgba(231,76,60,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    hrData.forEach((v, i) => {
      const x = i * xStep;
      const y = pad + (1 - (v - minHR) / (maxHR - minHR)) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
})();

// Apple Watch Status Cycling
(function() {
  const el = document.getElementById('watchStatus');
  const overlay = document.getElementById('watchOverlay');
  const label = document.getElementById('watchLabel');
  const sub = document.getElementById('watchSub');
  if (!el) return;

  const states = [
    {
      key: 'disconnected',
      label: 'Apple Watch',
      sub: 'Not connected',
      icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>'
    },
    {
      key: 'synced',
      label: 'Apple Watch',
      sub: 'All data synced',
      icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8.5 6.5 12 13 4"/></svg>'
    },
    {
      key: 'live',
      label: 'Match Live',
      sub: 'Recording',
      icon: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4"/></svg>'
    },
    {
      key: 'syncing',
      label: 'Apple Watch',
      sub: 'Syncing data...',
      icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8a6 6 0 0110.5-4"/><polyline points="13 1 13 5 9 5"/><path d="M14 8a6 6 0 01-10.5 4"/><polyline points="3 15 3 11 7 11"/></svg>'
    },
    {
      key: 'pending',
      label: 'Apple Watch',
      sub: 'Tap to sync 2 matches',
      icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="3" x2="8" y2="9"/><circle cx="8" cy="12.5" r="0.5" fill="currentColor" stroke="none"/></svg>'
    }
  ];

  let idx = 0;

  function applyState() {
    const s = states[idx];
    el.setAttribute('data-state', s.key);
    overlay.innerHTML = s.icon;
    label.textContent = s.label;
    sub.textContent = s.sub;
  }

  applyState();
  setInterval(function() {
    idx = (idx + 1) % states.length;
    applyState();
  }, 3000);
})();

// Live Match Elapsed Timer
(function() {
  const el = document.querySelector('.live-elapsed-timer');
  if (!el) return;
  let totalSeconds = 36;

  function format(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return m + ':' + sec;
  }

  setInterval(function() {
    totalSeconds++;
    el.textContent = format(totalSeconds);
  }, 1000);
})();

// Splash Pulse Line Animation
(function() {
  const canvas = document.getElementById('splashPulse');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let offset = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function beatVar(beatIndex) {
    const s = Math.sin(beatIndex * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  }

  function ecgPoint(x) {
    const period = 100;
    const raw = x + offset;
    const beatIndex = Math.floor(raw / period);
    const pos = ((raw % period) + period) % period;
    const mid = canvas.height / (2 * (window.devicePixelRatio || 1));

    const v = beatVar(beatIndex);
    const pWave   = 0.06 + v * 0.015;
    const qDip    = 0.04 + v * 0.01;
    const rSpike  = 0.55 + v * 0.08;
    const sDip    = 0.28 + v * 0.05;
    const stShift = 0.03 + v * 0.008;
    const tWave   = 0.12 + v * 0.025;

    if (pos > 38 && pos < 42) return mid - mid * pWave;
    if (pos > 42 && pos < 46) return mid + mid * qDip;
    if (pos > 46 && pos < 49) return mid - mid * rSpike;
    if (pos > 49 && pos < 52) return mid + mid * sDip;
    if (pos > 52 && pos < 55) return mid - mid * stShift;
    if (pos > 62 && pos < 72) {
      const t = (pos - 62) / 10;
      return mid - Math.sin(t * Math.PI) * mid * tWave;
    }
    return mid;
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.strokeStyle = '#e8651a';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let x = 0; x < w; x++) {
      const y = ecgPoint(x);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    offset += 0.6;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

// Shot Detail charts
(function() {
  function drawLineChart(id, datasets, yRange) {
    var c = document.getElementById(id);
    if (!c) return;
    var dpr = window.devicePixelRatio || 1;
    var rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = 160 * dpr;
    c.style.height = '160px';
    var ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    var w = rect.width, h = 160;
    var pad = { t: 8, b: 8, l: 4, r: 4 };
    var cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;

    datasets.forEach(function(ds) {
      ctx.beginPath();
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ds.data.forEach(function(v, i) {
        var x = pad.l + (i / (ds.data.length - 1)) * cw;
        var y = pad.t + (1 - (v - yRange[0]) / (yRange[1] - yRange[0])) * ch;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    var contactX = pad.l + 0.5 * cw;
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = '#e8651a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(contactX, pad.t);
    ctx.lineTo(contactX, h - pad.b);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e8651a';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('Contact', contactX + 4, pad.t + 10);
  }

  var accX = [0.1, 0.2, 0.15, -0.3, -1.2, -2.8, -3.5, -3.8, -2.1, -0.8, -0.2, 0.05, 0.1, 0.08, 0.05];
  var accY = [0.05, 0.1, 0.3, 0.8, 1.5, 2.2, 1.8, 0.5, -0.3, -0.5, -0.2, 0.0, 0.05, 0.03, 0.02];
  var accZ = [-1.0, -0.95, -0.9, -0.6, 0.2, 1.5, 2.8, 3.2, 2.0, 0.8, 0.1, -0.3, -0.5, -0.6, -0.7];
  drawLineChart('sdAccChart', [
    { data: accX, color: '#ff3b30' },
    { data: accY, color: '#34c759' },
    { data: accZ, color: '#007aff' }
  ], [-4.5, 4.0]);

  var gyrX = [0.2, 0.5, 1.0, 2.5, 5.0, 8.0, 6.0, 3.0, 1.0, 0.3, -0.2, -0.5, -0.3, -0.1, 0.0];
  var gyrY = [-0.3, -0.5, -1.5, -3.0, -5.5, -4.0, -1.5, 0.5, 1.0, 0.8, 0.3, 0.1, 0.0, -0.1, -0.1];
  var gyrZ = [0.1, 0.3, 1.2, 3.5, 7.0, 10.0, 7.5, 3.5, 1.2, 0.4, 0.1, -0.2, -0.3, -0.2, -0.1];
  drawLineChart('sdGyrChart', [
    { data: gyrX, color: '#ff3b30' },
    { data: gyrY, color: '#34c759' },
    { data: gyrZ, color: '#007aff' }
  ], [-6, 11]);

  // 3D trajectory (2D projection)
  var tc = document.getElementById('sdTrajectory');
  if (tc) {
    var dpr = window.devicePixelRatio || 1;
    var rect = tc.parentElement.getBoundingClientRect();
    tc.width = rect.width * dpr;
    tc.height = 200 * dpr;
    tc.style.height = '200px';
    var ctx = tc.getContext('2d');
    ctx.scale(dpr, dpr);
    var w = rect.width, h = 200;

    var pts = [
      [0.2,0.5],[0.22,0.48],[0.26,0.44],[0.32,0.38],[0.40,0.30],
      [0.50,0.22],[0.58,0.18],[0.64,0.20],[0.68,0.28],[0.70,0.38],
      [0.71,0.48],[0.70,0.55],[0.68,0.60],[0.65,0.63],[0.62,0.65]
    ];
    var gNorm = [0.05,0.08,0.12,0.25,0.55,0.85,1.0,0.9,0.5,0.3,0.15,0.08,0.05,0.04,0.03];

    function gCol(t) {
      if (t < 0.5) {
        var p = t / 0.5;
        return 'rgb(' + Math.round(p*255) + ',' + Math.round((0.8+0.2*(1-p))*255) + ',' + Math.round(0.2*(1-p)*255) + ')';
      }
      var p2 = (t - 0.5) / 0.5;
      return 'rgb(255,' + Math.round((1-p2)*255) + ',0)';
    }

    for (var i = 0; i < pts.length - 1; i++) {
      ctx.beginPath();
      ctx.strokeStyle = gCol(gNorm[i]);
      ctx.lineWidth = 3;
      ctx.moveTo(pts[i][0] * w, pts[i][1] * h);
      ctx.lineTo(pts[i+1][0] * w, pts[i+1][1] * h);
      ctx.stroke();
    }

    var ci = 5;
    ctx.beginPath();
    ctx.arc(pts[ci][0] * w, pts[ci][1] * h, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#d4f025';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Axes
    var ox = 20, oy = h - 20;
    var al = 30;
    ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+al,oy); ctx.stroke();
    ctx.fillStyle = '#ff3b30'; ctx.font = 'bold 10px system-ui'; ctx.fillText('X', ox+al+3, oy+4);
    ctx.strokeStyle = '#34c759'; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox,oy-al); ctx.stroke();
    ctx.fillStyle = '#34c759'; ctx.fillText('Y', ox-4, oy-al-4);
    ctx.strokeStyle = '#007aff'; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox-al*0.5,oy-al*0.5); ctx.stroke();
    ctx.fillStyle = '#007aff'; ctx.fillText('Z', ox-al*0.5-10, oy-al*0.5-4);
  }

  // G-force bar
  var bar = document.getElementById('sdGforceBar');
  if (bar) {
    for (var i = 0; i < 40; i++) {
      var t = i / 39;
      var seg = document.createElement('div');
      seg.style.flex = '1';
      seg.style.height = '100%';
      if (t < 0.5) {
        var p = t / 0.5;
        seg.style.background = 'rgb(' + Math.round(p*255) + ',' + Math.round((0.8+0.2*(1-p))*255) + ',' + Math.round(0.2*(1-p)*255) + ')';
      } else {
        var p2 = (t - 0.5) / 0.5;
        seg.style.background = 'rgb(255,' + Math.round((1-p2)*255) + ',0)';
      }
      bar.appendChild(seg);
    }
  }
})();

// Shot Guide expand/collapse
document.querySelectorAll('.sg-row').forEach(function(row) {
  row.addEventListener('click', function() { row.classList.toggle('open'); });
});

// Phone Scoreboard Elapsed Timer
(function() {
  var el = document.getElementById('phoneElapsed');
  if (!el) return;
  var total = 0 * 60 + 21;
  function fmt(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }
  setInterval(function() { total++; el.textContent = fmt(total); }, 1000);
})();

// Insight HR mini chart
(function() {
  var c = document.getElementById('insightHrChart');
  if (!c) return;
  var dpr = window.devicePixelRatio || 1;
  var rect = c.parentElement.getBoundingClientRect();
  c.width = rect.width * dpr;
  c.height = 120 * dpr;
  c.style.height = '120px';
  var ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  var w = rect.width, h = 120;
  var data = [128, 134, 140, 136, 142, 138, 145, 150];
  var minV = 120, maxV = 155;
  var xStep = w / (data.length - 1);

  ctx.beginPath();
  ctx.moveTo(0, h - 8);
  data.forEach(function(v, i) {
    var x = i * xStep;
    var y = 8 + (1 - (v - minV) / (maxV - minV)) * (h - 16);
    ctx.lineTo(x, y);
  });
  ctx.lineTo((data.length - 1) * xStep, h - 8);
  ctx.closePath();
  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(232,101,26,0.22)');
  grad.addColorStop(1, 'rgba(232,101,26,0)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = '#e8651a';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  data.forEach(function(v, i) {
    var x = i * xStep;
    var y = 8 + (1 - (v - minV) / (maxV - minV)) * (h - 16);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  data.forEach(function(v, i) {
    var x = i * xStep;
    var y = 8 + (1 - (v - minV) / (maxV - minV)) * (h - 16);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3b30';
    ctx.fill();
  });
})();

// Watch Elapsed Timer
(function() {
  const el = document.getElementById('watchElapsed');
  const rec = document.getElementById('watchRecTime');
  if (!el) return;
  let total = 23 * 60 + 45;
  function fmt(s) {
    var m = Math.floor(s / 60).toString().padStart(2, '0');
    var sec = (s % 60).toString().padStart(2, '0');
    return m + ':' + sec;
  }
  setInterval(function() {
    total++;
    el.textContent = fmt(total);
    if (rec) rec.textContent = fmt(total);
  }, 1000);
})();
