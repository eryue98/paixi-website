/**
 * PAIXI TECH — 全局交互
 * GMV 数据看板：股票式逐步绘制 + 千万级数据 + 全部数字跳动
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initActiveNav();
  initContactForm();
  initGMVDashboard();
  initTiltEffect();
  initStudioGallery();
});

/* --- Header --- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.pageYOffset > 50);
  });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.25, 0, 0.25, 1)';
    observer.observe(el);
  });
}

/* --- Active Nav --- */
function initActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (href !== '/' && path.includes(href))) {
      link.classList.add('active');
    }
    if (path === '/' && href === 'index.html') link.classList.add('active');
  });
}

/* --- Contact Form --- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '发送中...';
    btn.disabled = true;

    const formData = new FormData(form);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '2a31561f-8cb6-4525-b9bb-e6e212d4244b',
        subject: '派玺科技官网 · 客户咨询',
        from_name: formData.get('name') || '',
        name: formData.get('name') || '',
        company: formData.get('company') || '',
        phone: formData.get('phone') || '',
        email: formData.get('email') || '',
        platform: formData.get('platform') || '',
        category: formData.get('category') || '',
        message: formData.get('message') || ''
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        btn.textContent = '✓ 发送成功';
        btn.style.background = '#10B981';
        form.reset();
      } else throw new Error('Failed');
    })
    .catch(() => {
      btn.textContent = '✓ 已复制，请发送至 1424779280@qq.com';
      btn.style.background = '#10B981';
    })
    .finally(() => {
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 5000);
    });
  });
}

/* --- Lightbox --- */
function openLightbox(src) {
  const existing = document.querySelector('.lightbox-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `<span class="lightbox-close">&times;</span><img src="${src}" class="lightbox-img" />`;
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) overlay.remove();
  });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
  });
  document.body.appendChild(overlay);
}

/* ============================================
   GMV 数据看板 — 股票式绘制 + 千万级 + 全部跳动
   ============================================ */
function initGMVDashboard() {
  const container = document.getElementById('heroDashboard');
  if (!container) return;

  // 配色：紫色 GMV + 金色在线人数，紫金搭配
  const C = {
    purple:   [167, 139, 250], // #A78BFA GMV 主线
    gold:     [250, 204, 21],  // #FACC15 在线人数（金色区分）
    white:    [255, 255, 255],
  };

  function rgba(c, a) { return `rgba(${c.join(',')},${a})`; }

  container.innerHTML = `
    <div class="dash-dates">
      <span class="dash-date">近7天</span>
      <span class="dash-date active">近30天</span>
      <span class="dash-date">近90天</span>
    </div>
    <div class="dash-top-cards">
      <div class="dash-card">
        <div class="dash-card-label">支付GMV</div>
        <div class="dash-card-value" id="cardGMV" style="color:rgba(167,139,250,0.95)">¥0</div>
        <div class="dash-card-sub up" id="cardGMVChg">▲ 0%</div>
      </div>
      <div class="dash-card">
        <div class="dash-card-label">成交订单</div>
        <div class="dash-card-value" id="cardOrders">0</div>
        <div class="dash-card-sub up" id="cardOrdersChg">▲ 0%</div>
      </div>
      <div class="dash-card">
        <div class="dash-card-label">在线人数</div>
        <div class="dash-card-value" id="cardOnline" style="color:rgba(250,204,21,0.95)">0</div>
        <div class="dash-card-sub up" id="cardOnlineChg">▲ 0%</div>
      </div>
      <div class="dash-card">
        <div class="dash-card-label">转化率</div>
        <div class="dash-card-value" id="cardRate">0%</div>
        <div class="dash-card-sub up" id="cardRateChg">▲ 0%</div>
      </div>
    </div>
    <canvas id="gmvCanvas"></canvas>
    <div class="dash-bottom-bar">
      <div class="dash-bar-item">
        <div class="dash-bar-label">支付GMV</div>
        <div class="dash-bar-value" id="barPayGMV">¥0</div>
        <div class="dash-bar-pct up" id="barPayGMVChg">▲ 0%</div>
      </div>
      <div class="dash-bar-item">
        <div class="dash-bar-label">成交GMV</div>
        <div class="dash-bar-value" id="barDealGMV">¥0</div>
        <div class="dash-bar-pct up" id="barDealGMVChg">▲ 0%</div>
      </div>
      <div class="dash-bar-item">
        <div class="dash-bar-label">成交退款</div>
        <div class="dash-bar-value" id="barRefund">¥0</div>
        <div class="dash-bar-pct down" id="barRefundChg">▼ 0%</div>
      </div>
      <div class="dash-bar-item">
        <div class="dash-bar-label">成交订单数</div>
        <div class="dash-bar-value" id="barOrders">0</div>
        <div class="dash-bar-pct up" id="barOrdersChg">▲ 0%</div>
      </div>
      <div class="dash-bar-item">
        <div class="dash-bar-label">成交人数</div>
        <div class="dash-bar-value" id="barPeople">0</div>
        <div class="dash-bar-pct up" id="barPeopleChg">▲ 0%</div>
      </div>
      <div class="dash-bar-item">
        <div class="dash-bar-label">客单价</div>
        <div class="dash-bar-value" id="barAvgPrice">¥0</div>
        <div class="dash-bar-pct up" id="barAvgPriceChg">▲ 0%</div>
      </div>
    </div>
  `;

  const canvas = document.getElementById('gmvCanvas');
  const ctx = canvas.getContext('2d');

  // DOM 引用
  const els = {
    cardGMV:      document.getElementById('cardGMV'),
    cardGMVChg:   document.getElementById('cardGMVChg'),
    cardOrders:   document.getElementById('cardOrders'),
    cardOrdersChg:document.getElementById('cardOrdersChg'),
    cardOnline:   document.getElementById('cardOnline'),
    cardOnlineChg:document.getElementById('cardOnlineChg'),
    cardRate:     document.getElementById('cardRate'),
    cardRateChg:  document.getElementById('cardRateChg'),
    barPayGMV:    document.getElementById('barPayGMV'),
    barPayGMVChg: document.getElementById('barPayGMVChg'),
    barDealGMV:   document.getElementById('barDealGMV'),
    barDealGMVChg:document.getElementById('barDealGMVChg'),
    barRefund:    document.getElementById('barRefund'),
    barRefundChg: document.getElementById('barRefundChg'),
    barOrders:    document.getElementById('barOrders'),
    barOrdersChg: document.getElementById('barOrdersChg'),
    barPeople:    document.getElementById('barPeople'),
    barPeopleChg: document.getElementById('barPeopleChg'),
    barAvgPrice:  document.getElementById('barAvgPrice'),
    barAvgPriceChg:document.getElementById('barAvgPriceChg'),
  };

  let W, H;
  let time = 0;
  let mouseX = -500, mouseY = -500;
  let targetMouseX = -500, targetMouseY = -500;

  function resize() {
    const rect = container.getBoundingClientRect();
    W = canvas.width = rect.width * 2;
    H = canvas.height = rect.height * 2;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    targetMouseX = (e.clientX - rect.left) * 2;
    targetMouseY = (e.clientY - rect.top) * 2;
  });
  container.addEventListener('mouseleave', () => {
    targetMouseX = -500;
    targetMouseY = -500;
  });

  // ====== 千万级数据生成 ======
  const DATA_COUNT = 240;
  const gmvData = [];
  const onlineData = [];

  for (let i = 0; i < DATA_COUNT; i++) {
    const t = i / (DATA_COUNT - 1);
    // GMV: 400万 → 1200万（千万级）
    const base = 4000000 + t * 8000000;
    const wave = Math.sin(t * Math.PI * 5) * 300000;
    const noise = (Math.random() - 0.5) * 200000;
    gmvData.push(Math.max(3000000, base + wave + noise));

    // 在线人数: 3000 → 25000
    const obase = 3000 + t * 22000;
    const owave = Math.sin(t * Math.PI * 4 + 0.8) * 3000;
    const onoise = (Math.random() - 0.5) * 2000;
    onlineData.push(Math.max(1000, obase + owave + onoise));
  }

  const gmvMax = Math.max(...gmvData) * 1.06;
  const gmvMin = Math.min(...gmvData) * 0.92;
  const onlineMax = Math.max(...onlineData) * 1.06;
  const onlineMin = Math.min(...onlineData) * 0.92;

  // ====== 格式化 ======
  function fmtMoney(v) {
    if (v >= 10000) return '¥' + (v / 10000).toFixed(1) + '万';
    return '¥' + v.toFixed(0);
  }
  function fmtNum(v) { return Math.round(v).toLocaleString(); }
  function fmtPct(v) {
    const sign = v >= 0 ? '▲' : '▼';
    return sign + ' ' + Math.abs(v).toFixed(1) + '%';
  }

  // ====== 当前显示的数据索引（股票式逐步绘制） ======
  // drawIndex 从 0 慢慢增加到 DATA_COUNT-1
  let drawIndex = 0;
  const DRAW_SPEED = 1.2; // 每帧增加的点数

  // ====== 全部数值跳动（目标值 + 当前显示值） ======
  const anim = {
    cardGMV: { target: 0, current: 0 },
    cardOrders: { target: 0, current: 0 },
    cardOnline: { target: 0, current: 0 },
    cardRate: { target: 0, current: 0 },
    barPayGMV: { target: 0, current: 0 },
    barDealGMV: { target: 0, current: 0 },
    barRefund: { target: 0, current: 0 },
    barOrders: { target: 0, current: 0 },
    barPeople: { target: 0, current: 0 },
    barAvgPrice: { target: 0, current: 0 },
  };

  const changes = {
    cardGMV: 12.5, cardOrders: 8.3, cardOnline: 15.2, cardRate: 2.1,
    barPayGMV: 12.5, barDealGMV: 10.8, barRefund: -3.2,
    barOrders: 8.3, barPeople: 6.7, barAvgPrice: 4.1,
  };

  // 每 2 秒随机微调目标值，产生持续跳动
  function updateTargets() {
    const idx = Math.min(Math.floor(drawIndex), DATA_COUNT - 1);
    const gmv = gmvData[idx];
    const online = onlineData[idx];

    // 在基础值上加减小幅度随机波动
    const jitter = () => 1 + (Math.random() - 0.5) * 0.04;

    anim.cardGMV.target = gmv * jitter();
    anim.cardOrders.target = online * 0.35 * jitter();
    anim.cardOnline.target = online * jitter();
    anim.cardRate.target = (5.8 + Math.random() * 1.6);
    anim.barPayGMV.target = gmv * jitter();
    anim.barDealGMV.target = gmv * 0.92 * jitter();
    anim.barRefund.target = gmv * 0.08 * jitter();
    anim.barOrders.target = online * 0.35 * jitter();
    anim.barPeople.target = online * 0.28 * jitter();
    anim.barAvgPrice.target = 195 + Math.random() * 35;
  }

  // 每帧更新显示值（lerp 逼近目标）
  function updateDisplays() {
    const lerp = 0.25;
    for (const key in anim) {
      anim[key].current += (anim[key].target - anim[key].current) * lerp;
    }

    const c = anim;
    els.cardGMV.textContent = fmtMoney(c.cardGMV.current);
    els.cardOrders.textContent = fmtNum(c.cardOrders.current);
    els.cardOnline.textContent = fmtNum(c.cardOnline.current);
    els.cardRate.textContent = c.cardRate.current.toFixed(1) + '%';
    els.barPayGMV.textContent = fmtMoney(c.barPayGMV.current);
    els.barDealGMV.textContent = fmtMoney(c.barDealGMV.current);
    els.barRefund.textContent = fmtMoney(c.barRefund.current);
    els.barOrders.textContent = fmtNum(c.barOrders.current);
    els.barPeople.textContent = fmtNum(c.barPeople.current);
    els.barAvgPrice.textContent = '¥' + c.barAvgPrice.current.toFixed(0);

    // 涨跌幅也微调
    for (const [elKey, base] of Object.entries(changes)) {
      const el = els[elKey + 'Chg'];
      if (el) {
        const j = 1 + (Math.random() - 0.5) * 0.3;
        el.textContent = fmtPct(base * j);
      }
    }
  }

  // ====== 绘制 ======
  function draw() {
    time++;

    // 股票式逐步绘制
    if (drawIndex < DATA_COUNT - 1) {
      drawIndex = Math.min(drawIndex + DRAW_SPEED, DATA_COUNT - 1);
    } else {
      // 画完后循环重播
      if (time % 600 === 0) drawIndex = 0;
    }

    // 每 2 秒更新目标值
    if (time % 120 === 0) updateTargets();

    // 每帧更新显示
    updateDisplays();

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, W, H);

    const padX = W * 0.08;
    const padY = H * 0.12;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    const visibleCount = Math.floor(drawIndex) + 1;

    // ====== 网格线 ======
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = padY + (chartH / gridRows) * i;
      ctx.strokeStyle = rgba(C.purple, i === gridRows ? 0.06 : 0.03);
      ctx.lineWidth = 1;
      ctx.setLineDash(i === gridRows ? [] : [3, 10]);
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(W - padX, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ====== 在线人数 面积图（蓝色，底层） ======
    const onlineGrad = ctx.createLinearGradient(0, padY, 0, H - padY);
    onlineGrad.addColorStop(0, rgba(C.gold, 0.1));
    onlineGrad.addColorStop(0.5, rgba(C.gold, 0.03));
    onlineGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((onlineData[i] - onlineMin) / (onlineMax - onlineMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // 面积闭合到当前 x 位置
    const lastX = padX + ((visibleCount - 1) / (DATA_COUNT - 1)) * chartW;
    ctx.lineTo(lastX, H - padY);
    ctx.lineTo(padX, H - padY);
    ctx.closePath();
    ctx.fillStyle = onlineGrad;
    ctx.fill();

    // ====== GMV 面积图（紫色，上层） ======
    const gmvGrad = ctx.createLinearGradient(0, padY, 0, H - padY);
    gmvGrad.addColorStop(0, rgba(C.purple, 0.15));
    gmvGrad.addColorStop(0.4, rgba(C.purple, 0.06));
    gmvGrad.addColorStop(0.7, rgba(C.purple, 0.02));
    gmvGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((gmvData[i] - gmvMin) / (gmvMax - gmvMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(lastX, H - padY);
    ctx.lineTo(padX, H - padY);
    ctx.closePath();
    ctx.fillStyle = gmvGrad;
    ctx.fill();

    // ====== 在线人数 曲线（蓝色） ======
    // 辉光
    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((onlineData[i] - onlineMin) / (onlineMax - onlineMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(C.gold, 0.15);
    ctx.lineWidth = 7;
    ctx.shadowColor = rgba(C.gold, 0.35);
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((onlineData[i] - onlineMin) / (onlineMax - onlineMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(C.gold, 0.35);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = rgba(C.gold, 0.5);
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 主线
    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((onlineData[i] - onlineMin) / (onlineMax - onlineMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(C.gold, 0.85);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ====== GMV 曲线（紫色） ======
    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((gmvData[i] - gmvMin) / (gmvMax - gmvMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(C.purple, 0.15);
    ctx.lineWidth = 7;
    ctx.shadowColor = rgba(C.purple, 0.35);
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((gmvData[i] - gmvMin) / (gmvMax - gmvMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(C.purple, 0.35);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = rgba(C.purple, 0.5);
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padX + (i / (DATA_COUNT - 1)) * chartW;
      const y = padY + chartH - ((gmvData[i] - gmvMin) / (gmvMax - gmvMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(C.purple, 0.85);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ====== 数据点 ======
    const dotInterval = 6;
    for (let i = 0; i < visibleCount; i += dotInterval) {
      const gx = padX + (i / (DATA_COUNT - 1)) * chartW;
      const gy = padY + chartH - ((gmvData[i] - gmvMin) / (gmvMax - gmvMin)) * chartH;
      ctx.beginPath();
      ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rgba(C.purple, 0.7);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(gx, gy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(C.purple, 0.2);
      ctx.lineWidth = 1;
      ctx.stroke();

      const ox = padX + (i / (DATA_COUNT - 1)) * chartW;
      const oy = padY + chartH - ((onlineData[i] - onlineMin) / (onlineMax - onlineMin)) * chartH;
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rgba(C.gold, 0.7);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(C.gold, 0.2);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ====== 终点光点 ======
    const lastI = visibleCount - 1;
    if (lastI >= 0) {
      // GMV 终点（紫色）
      const gmvX = padX + (lastI / (DATA_COUNT - 1)) * chartW;
      const gmvY = padY + chartH - ((gmvData[lastI] - gmvMin) / (gmvMax - gmvMin)) * chartH;
      const gmvDotGlow = ctx.createRadialGradient(gmvX, gmvY, 0, gmvX, gmvY, 40);
      gmvDotGlow.addColorStop(0, 'rgba(255,255,255,0.95)');
      gmvDotGlow.addColorStop(0.1, rgba(C.purple, 0.6));
      gmvDotGlow.addColorStop(0.3, rgba(C.purple, 0.12));
      gmvDotGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(gmvX, gmvY, 40, 0, Math.PI * 2);
      ctx.fillStyle = gmvDotGlow;
      ctx.fill();
      const pulseR = 10 + Math.sin(time * 0.05) * 4;
      ctx.beginPath();
      ctx.arc(gmvX, gmvY, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(C.purple, 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gmvX, gmvY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // 在线终点（蓝色）
      const onlineX = padX + (lastI / (DATA_COUNT - 1)) * chartW;
      const onlineY = padY + chartH - ((onlineData[lastI] - onlineMin) / (onlineMax - onlineMin)) * chartH;
      const onlineDotGlow = ctx.createRadialGradient(onlineX, onlineY, 0, onlineX, onlineY, 40);
      onlineDotGlow.addColorStop(0, 'rgba(255,255,255,0.95)');
      onlineDotGlow.addColorStop(0.1, rgba(C.gold, 0.6));
      onlineDotGlow.addColorStop(0.3, rgba(C.gold, 0.12));
      onlineDotGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(onlineX, onlineY, 40, 0, Math.PI * 2);
      ctx.fillStyle = onlineDotGlow;
      ctx.fill();
      const onlinePulseR = 10 + Math.sin(time * 0.05 + Math.PI) * 4;
      ctx.beginPath();
      ctx.arc(onlineX, onlineY, onlinePulseR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(C.gold, 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(onlineX, onlineY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // ====== 鼠标光晕 ======
    if (mouseX > 0 && mouseY > 0) {
      const mGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 200);
      mGlow.addColorStop(0, 'rgba(255,255,255,0.02)');
      mGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mGlow;
      ctx.fillRect(0, 0, W, H);
    }

    // ====== 扫描线 ======
    const scanY = ((time * 0.5) % (H + 400)) - 200;
    const scanGrad = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
    scanGrad.addColorStop(0, 'rgba(255,255,255,0)');
    scanGrad.addColorStop(0.5, 'rgba(255,255,255,0.01)');
    scanGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }

  updateTargets();
  draw();
}

/* ============================================
   3D TILT — 鼠标倾斜效果
   ============================================ */
function initTiltEffect() {
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      const imgInner = card.querySelector('.case-img-inner');
      if (imgInner) {
        imgInner.style.transform = `translate(${(x - centerX) * 0.03}px, ${(y - centerY) * 0.03}px)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      const imgInner = card.querySelector('.case-img-inner');
      if (imgInner) imgInner.style.transform = 'translate(0, 0)';
    });
  });
}

/* ============================================
   直播间场地轮播
   ============================================ */
function initStudioGallery() {
  const gallery = document.querySelector('.studio-gallery');
  if (!gallery) return;

  const slides = gallery.querySelectorAll('.studio-slide');
  const dots = gallery.querySelectorAll('.studio-dot');
  let current = 0;
  const total = slides.length;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo((current + 1) % total); }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(parseInt(dot.dataset.index));
      resetTimer();
    });
  });

  gallery.addEventListener('click', () => { next(); resetTimer(); });

  function resetTimer() {
    clearInterval(interval);
    interval = setInterval(next, 4000);
  }

  interval = setInterval(next, 4000);
}
