/**
 * 杭州派玺科技有限公司 - 全局交互脚本
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initActiveNav();
  initContactForm();
  initCaseFilter();
});

/* --- Header Scroll Effect --- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
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

  // Close on nav link click
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
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
    observer.observe(el);
  });
}

/* --- Active Nav Link --- */
function initActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href !== '/' && currentPath.includes(href))) {
      link.classList.add('active');
    }
    if (currentPath === '/' && href === 'index.html') {
      link.classList.add('active');
    }
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

    // Collect form data
    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const company = formData.get('company') || '';
    const phone = formData.get('phone') || '';
    const email = formData.get('email') || '';
    const platform = formData.get('platform') || '';
    const category = formData.get('category') || '';
    const message = formData.get('message') || '';

    // Send via Web3Forms (free, no registration needed)
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        subject: '派玺科技官网 · 客户咨询',
        from_name: name,
        name: name,
        company: company,
        phone: phone,
        email: email,
        platform: platform,
        category: category,
        message: message
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        btn.textContent = '✓ 发送成功，我们会尽快联系您';
        btn.style.background = '#10B981';
        form.reset();
      } else {
        throw new Error('Submit failed');
      }
    })
    .catch(() => {
      // Fallback: copy to clipboard + show contact info
      const text = `联系人：${name}\n公司：${company}\n电话：${phone}\n邮箱：${email}\n平台：${platform}\n类目：${category}\n需求：${message}`;
      navigator.clipboard.writeText(text).catch(() => {});
      btn.textContent = '✓ 已复制，请发送至 1424779280@qq.com';
      btn.style.background = '#10B981';
      btn.style.fontSize = '13px';
    })
    .finally(() => {
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.fontSize = '';
        btn.disabled = false;
      }, 5000);
    });
  });
}

/* --- Case Filter --- */
function initCaseFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll('.case-card-full');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --- Lightbox --- */
function openLightbox(src) {
  const existing = document.querySelector('.lightbox-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img src="${src}" class="lightbox-img" />
  `;

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      overlay.remove();
    }
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.body.appendChild(overlay);
}

/* --- Counter Animation --- */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(target * eased);
          el.textContent = current.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// Run counter animation
animateCounters();
