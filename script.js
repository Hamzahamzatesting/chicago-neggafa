'use strict';

/* ─── HERO VIDEO AUTOPLAY ─── */
const heroVids = () => document.querySelectorAll('.hero__arch-panel video, .hero__video');

function forceHeroVideos() {
  heroVids().forEach(vid => {
    vid.muted  = true;
    vid.volume = 0;
    vid.loop   = true;
    if (vid.paused) vid.play().catch(() => {});
  });
}

// Prepare all videos immediately
heroVids().forEach(vid => {
  vid.muted  = true;
  vid.volume = 0;
  vid.loop   = true;
  // Re-try on each video's own readiness events
  ['loadedmetadata', 'canplay'].forEach(evt =>
    vid.addEventListener(evt, () => { vid.muted = true; vid.play().catch(() => {}); }, { once: true })
  );
});

// Try autoplay immediately (works on Chrome / most browsers)
forceHeroVideos();

// Safari requires a user gesture to unlock video — fire on first interaction
// mousemove covers the case where user just moves the cursor over the loader
let _vUnlocked = false;
function _unlockOnce() {
  if (_vUnlocked) return;
  _vUnlocked = true;
  forceHeroVideos();
}
['mousemove', 'touchstart', 'scroll', 'click', 'keydown'].forEach(e =>
  document.addEventListener(e, _unlockOnce, { once: true, passive: true })
);

/* ─── LOADER STARS + GOLD DUST ─── */
(function () {
  const canvas = document.querySelector('.ldr-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf, stars = [], frame = 0;
  const DUST = 55, R = 201, G = 169, B = 110;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = Array.from({ length: 90 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H * 0.65,
      r:  0.22 + Math.random() * 0.90,
      a:  0.22 + Math.random() * 0.52,
      ts: 0.005 + Math.random() * 0.014,
      to: Math.random() * Math.PI * 2,
    }));
  }

  function mkP() {
    const maxLife = 280 + Math.random() * 360;
    return {
      x: Math.random() * W,
      y: H * 0.25 + Math.random() * H * 0.75,
      r: 0.3 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.18 + Math.random() * 0.55),
      life: Math.random() * maxLife,
      maxLife,
    };
  }

  const particles = Array.from({ length: DUST }, mkP);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(frame * s.ts + s.to);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,252,232,${s.a * tw})`;
      ctx.fill();
    }
    for (const p of particles) {
      p.x  += p.vx + Math.sin(p.life * 0.018) * 0.18;
      p.y  += p.vy;
      p.life++;
      const t     = p.life / p.maxLife;
      const alpha = (t < 0.12 ? t / 0.12 : t > 0.75 ? (1 - t) / 0.25 : 1) * 0.52;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
      ctx.fill();
      if (p.life >= p.maxLife || p.y < -8) Object.assign(p, mkP(), { y: H + 10, life: 0 });
    }
    raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  tick();

  const loader = document.getElementById('loader');
  if (loader) {
    new MutationObserver(() => {
      if (loader.classList.contains('hidden')) cancelAnimationFrame(raf);
    }).observe(loader, { attributes: true });
  }
})();

/* ─── HERO PARTICLES ─── */
(function () {
  const hero   = document.getElementById('hero');
  const canvas = hero && hero.querySelector('.hero__particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf;
  const COUNT = 35;
  const R = 201, G = 169, B = 110;

  function resize() {
    const rect = hero.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  function mkP() {
    const maxLife = 320 + Math.random() * 420;
    return {
      x: Math.random() * (W || window.innerWidth),
      y: (H || window.innerHeight) * (0.4 + Math.random() * 0.6),
      r: 0.3 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.15 + Math.random() * 0.45),
      life: Math.random() * maxLife,
      maxLife,
    };
  }

  const particles = Array.from({ length: COUNT }, mkP);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x  += p.vx + Math.sin(p.life * 0.022) * 0.2;
      p.y  += p.vy;
      p.life++;
      const t     = p.life / p.maxLife;
      const alpha = (t < 0.1 ? t / 0.1 : t > 0.72 ? (1 - t) / 0.28 : 1) * 0.48;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
      ctx.fill();
      if (p.life >= p.maxLife || p.y < -10) Object.assign(p, mkP(), { y: H + 10, life: 0 });
    }
    raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  tick();
})();

/* ─── SITE-WIDE STAR FIELD ─── */
(function () {
  const canvas = document.getElementById('site-stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], frame = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = Array.from({ length: 130 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  0.18 + Math.random() * 0.78,
      a:  0.12 + Math.random() * 0.42,
      ts: 0.003 + Math.random() * 0.011,
      to: Math.random() * Math.PI * 2,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(frame * s.ts + s.to);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,252,235,${s.a * tw})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  tick();
})();

/* ─── LOADER ─── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  const t0 = Date.now();
  const MIN = 3800; // animation needs this long
  const MAX = 7000; // never block longer than this on slow connections

  function dismiss() {
    if (loader.classList.contains('hidden')) return;
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    forceHeroVideos();
  }

  // Hard minimum — always show the full animation
  setTimeout(dismiss, MIN);

  // Hard maximum — never block past 7s no matter how slow the connection
  setTimeout(dismiss, MAX);

  // If the page finishes loading after the minimum, dismiss immediately
  window.addEventListener('load', () => {
    const elapsed = Date.now() - t0;
    if (elapsed >= MIN) dismiss();
    // else the MIN setTimeout above will fire it
  });
})();

/* ─── CUSTOM CURSOR ─── */
const cursorRing = document.querySelector('.cursor__ring');
const cursorDot  = document.querySelector('.cursor__dot');

if (cursorRing && window.matchMedia('(pointer: fine)').matches) {
  let aimX = 0, aimY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    aimX = e.clientX;
    aimY = e.clientY;
    cursorDot.style.transform = `translate(${aimX}px, ${aimY}px) translate(-50%,-50%)`;
  });

  (function animateRing() {
    ringX += (aimX - ringX) * 0.14;
    ringY += (aimY - ringY) * 0.14;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
  });
}

/* ─── MAGNETIC BUTTONS ─── */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    btn.style.transform = '';
    setTimeout(() => btn.style.transition = '', 500);
  });
});

/* ─── NAV SCROLL STATE ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── MOBILE NAV ─── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-fade');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el    = e.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('visible'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObs.observe(el));

/* ─── PARALLAX (lhenna bg) ─── */
const lhennaBg = document.getElementById('lhennaBg');
if (lhennaBg) {
  window.addEventListener('scroll', () => {
    const section = lhennaBg.closest('section');
    const rect    = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const progress = rect.top / window.innerHeight;
    lhennaBg.style.transform = `translateY(${progress * 80}px)`;
  }, { passive: true });
}

/* ─── PARALLAX (hero watermark counter-scroll) ─── */
const watermark = document.querySelector('.hero__watermark');
if (watermark) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) return;
    watermark.style.transform = `translateY(calc(-50% + ${window.scrollY * 0.15}px))`;
  }, { passive: true });
}

/* ─── HERO VIDEO PARALLAX ─── */
if (heroVideo) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) return;
    heroVideo.style.transform = `scale(1.08) translateY(${window.scrollY * 0.18}px)`;
  }, { passive: true });
}

/* ─── FAQ ACCORDION ─── */
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-item__q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ─── MARQUEE PAUSE ON HOVER ─── */
const marqueeTrack = document.querySelector('.marquee__track');
if (marqueeTrack) {
  const marquee = marqueeTrack.parentElement;
  marquee.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marquee.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

/* ─── NAV ACTIVE LINK HIGHLIGHT ─── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navAnchors.forEach(a => {
      const active = a.getAttribute('href') === `#${e.target.id}`;
      a.style.color      = active ? 'var(--gold)' : '';
      a.style.fontWeight = active ? '500' : '';
    });
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));

/* ─── GALLERY ITEM STAGGER ON SCROLL ─── */
const galleryItems = document.querySelectorAll('.g-item');
const galObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    setTimeout(() => e.target.classList.add('visible'), i * 40);
    galObs.unobserve(e.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
galleryItems.forEach(el => galObs.observe(el));

/* ─── SCROLL PROGRESS BAR ─── */
const progressBar = document.getElementById('progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

/* ─── FLOATING GOLD PARTICLES IN HERO ─── */
(function spawnParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 40}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${6 + Math.random() * 8}s;
      --delay: ${Math.random() * 8}s;
    `;
    hero.appendChild(p);
  }
})();

/* ─── SMOOTH NUMBER COUNT-UP (stats) ─── */
const statNums = document.querySelectorAll('.stat-num');
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el   = e.target;
    const text = el.textContent.trim();
    const num  = parseInt(text, 10);
    if (isNaN(num)) return;
    const suffix = text.replace(String(num), '');
    let current = 0;
    const duration = 1200;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      el.textContent = Math.floor(current) + suffix;
      if (current >= num) clearInterval(timer);
    }, 16);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });
statNums.forEach(el => countObs.observe(el));

/* ─── VIDEO REEL LIGHTBOX ─── */
const reelCards    = document.querySelectorAll('.reel__card');
const reelLightbox = document.getElementById('reelLightbox');
const reelVideo    = document.getElementById('reelVideo');
const reelClose    = document.getElementById('reelClose');
const reelBg       = document.getElementById('reelLightboxBg');

function openReel(src) {
  reelVideo.src = src;
  reelVideo.load();
  reelLightbox.classList.add('open');
  reelLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  reelVideo.play().catch(() => {});
}

function closeReel() {
  reelLightbox.classList.remove('open');
  reelLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  reelVideo.pause();
  reelVideo.src = '';
}

reelCards.forEach(card => {
  card.addEventListener('click', () => openReel(card.dataset.src));
});
if (reelClose) reelClose.addEventListener('click', closeReel);
if (reelBg)    reelBg.addEventListener('click', closeReel);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && reelLightbox.classList.contains('open')) closeReel();
});

/* ─── GALLERY: INFER CATEGORY FROM FILENAME ─── */
function inferGalleryCategory(item) {
  const src = (item.querySelector('img')?.src || '').toLowerCase();
  if (src.includes('lhenna')) return 'lhenna';
  if (src.includes('kaftan') || src.includes('bride') || src.includes('takchita')) return 'kaftans';
  if (src.includes('jewelry') || src.includes('crown') || src.includes('mdama') || src.includes('pearl') || src.includes('choker') || src.includes('tiara')) return 'jewelry';
  return 'all';
}

/* ─── GALLERY: INJECT ZOOM ICONS ─── */
document.querySelectorAll('.gallery__grid .g-item').forEach(item => {
  const zoom = document.createElement('div');
  zoom.className = 'g-item__zoom';
  zoom.setAttribute('aria-hidden', 'true');
  zoom.innerHTML = `<svg viewBox="0 0 20 20" fill="none" width="16" height="16"><circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M13 13l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 6v4M6 8h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  item.appendChild(zoom);
  item.dataset.category = inferGalleryCategory(item);
});

/* ─── GALLERY FILTER ─── */
const filterBtns        = document.querySelectorAll('.gfilter-btn');
const galleryItemsList  = document.querySelectorAll('.gallery__grid .g-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    let visibleIdx = 0;
    galleryItemsList.forEach(item => {
      const cat  = item.dataset.category;
      const show = filter === 'all' || cat === filter;
      if (show) {
        item.classList.remove('filter-hidden');
        item.style.setProperty('--filter-delay', (visibleIdx * 45) + 'ms');
        void item.offsetWidth;
        item.classList.add('filter-visible');
        visibleIdx++;
      } else {
        item.classList.add('filter-hidden');
        item.classList.remove('filter-visible');
      }
    });
  });
});

/* ─── GALLERY LIGHTBOX ─── */
const galleryLightbox    = document.getElementById('galleryLightbox');
const galleryLightboxImg = document.getElementById('galleryLightboxImg');
const galleryLightboxCap = document.getElementById('galleryLightboxCaption');
const galleryCounter     = document.getElementById('galleryCounter');
const galleryLightboxBg  = document.getElementById('galleryLightboxBg');
const galleryClose       = document.getElementById('galleryLightboxClose');
const galleryPrevBtn     = document.getElementById('galleryPrev');
const galleryNextBtn     = document.getElementById('galleryNext');

let glCurrentIndex = 0;
let glItems = [];

function buildGalleryItems() {
  glItems = [];
  document.querySelectorAll('.gallery__grid .g-item:not(.filter-hidden)').forEach(item => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.g-item__caption');
    if (img) glItems.push({ src: img.src, alt: img.alt, caption: cap?.textContent?.trim() || '' });
  });
}

function openGalleryLightbox(index) {
  buildGalleryItems();
  if (!glItems.length) return;
  glCurrentIndex = ((index % glItems.length) + glItems.length) % glItems.length;
  showGallerySlide(glCurrentIndex);
  galleryLightbox.classList.add('open');
  galleryLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeGalleryLightbox() {
  galleryLightbox.classList.remove('open');
  galleryLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showGallerySlide(index) {
  const item = glItems[index];
  if (!item) return;
  galleryLightboxImg.classList.add('fading');
  setTimeout(() => {
    galleryLightboxImg.src  = item.src;
    galleryLightboxImg.alt  = item.alt;
    galleryLightboxCap.textContent = item.caption;
    galleryCounter.textContent = `${index + 1} / ${glItems.length}`;
    galleryLightboxImg.classList.remove('fading');
  }, 200);
}

function galleryNavigate(dir) {
  glCurrentIndex = ((glCurrentIndex + dir + glItems.length) % glItems.length);
  showGallerySlide(glCurrentIndex);
}

galleryItemsList.forEach(item => {
  item.addEventListener('click', () => {
    buildGalleryItems();
    const visibleItems = Array.from(document.querySelectorAll('.gallery__grid .g-item:not(.filter-hidden)'));
    const idx = visibleItems.indexOf(item);
    openGalleryLightbox(idx >= 0 ? idx : 0);
  });
});

if (galleryClose)    galleryClose.addEventListener('click', closeGalleryLightbox);
if (galleryLightboxBg) galleryLightboxBg.addEventListener('click', closeGalleryLightbox);
if (galleryPrevBtn)  galleryPrevBtn.addEventListener('click', () => galleryNavigate(-1));
if (galleryNextBtn)  galleryNextBtn.addEventListener('click', () => galleryNavigate(1));

document.addEventListener('keydown', e => {
  if (!galleryLightbox?.classList.contains('open')) return;
  if (e.key === 'Escape')      closeGalleryLightbox();
  if (e.key === 'ArrowLeft')   galleryNavigate(-1);
  if (e.key === 'ArrowRight')  galleryNavigate(1);
});

/* ─── MOBILE STICKY CTA ─── */
const stickyCta   = document.getElementById('stickyCta');
const heroSection = document.getElementById('hero');
if (stickyCta && heroSection) {
  const stickyObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const gone = !e.isIntersecting;
      stickyCta.classList.toggle('visible', gone);
      stickyCta.setAttribute('aria-hidden', String(!gone));
    });
  }, { threshold: 0.15 });
  stickyObs.observe(heroSection);
}

/* ─── REEL CARD VIDEO PREVIEW ON HOVER ─── */
document.querySelectorAll('.reel__card').forEach(card => {
  const src = card.dataset.src;
  if (!src || !window.matchMedia('(hover: hover)').matches) return;
  let previewVid = null;

  card.addEventListener('mouseenter', () => {
    if (!previewVid) {
      previewVid = document.createElement('video');
      previewVid.className   = 'reel__preview-video';
      previewVid.src         = src;
      previewVid.muted       = true;
      previewVid.loop        = true;
      previewVid.playsInline = true;
      previewVid.preload     = 'metadata';
      const thumb = card.querySelector('.reel__thumb');
      if (thumb) thumb.insertBefore(previewVid, thumb.firstChild);
    }
    previewVid.currentTime = 0;
    previewVid.play().catch(() => {});
  });

  card.addEventListener('mouseleave', () => {
    if (previewVid) previewVid.pause();
  });
});

/* ═══════════════════════════════════════════════════════
   MODERN MOROCCAN LUXURY — v5
   Character split · Cursor trail · Candlelight
   Image tilt · Zellige reveal · Micro-interactions
   ═══════════════════════════════════════════════════════ */

/* ─── HERO TITLE: CHARACTER SPLIT ─── */
(function initCharSplit() {
  const words = document.querySelectorAll('.hero__title .word');
  const baseByIndex = { 0: 2000, 2: 2300 };

  words.forEach((word, idx) => {
    if (word.classList.contains('italic')) return; // preserve shimmer gradient
    const base = baseByIndex[idx] ?? 2200;
    const text = word.textContent;
    word.textContent = '';
    word.style.cssText = 'opacity:1;transform:none;animation:none;';
    [...text].forEach((char, ci) => {
      const s = document.createElement('span');
      const space = char === ' ';
      s.className   = 'char' + (space ? ' is-space' : '');
      s.textContent = space ? ' ' : char;
      s.style.setProperty('--char-delay', (base + ci * 38) + 'ms');
      word.appendChild(s);
    });
  });
})();

/* ─── CURSOR TRAIL ─── */
(function initCursorTrail() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const dots = Array.from({ length: 7 }, (_, i) => {
    const el  = document.createElement('div');
    el.className = 'cursor-trail';
    const sz  = Math.max(2.5, 6 - i * 0.7);
    el.style.cssText = `width:${sz}px;height:${sz}px;`;
    document.body.appendChild(el);
    return { el, x: -200, y: -200 };
  });

  let mx = -200, my = -200;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function loop() {
    let px = mx, py = my;
    dots.forEach((dot, i) => {
      dot.x += (px - dot.x) * (0.18 - i * 0.02);
      dot.y += (py - dot.y) * (0.18 - i * 0.02);
      dot.el.style.transform = `translate(${dot.x}px,${dot.y}px) translate(-50%,-50%)`;
      dot.el.style.opacity   = Math.max(0, 0.45 - i * 0.06);
      px = dot.x; py = dot.y;
    });
    requestAnimationFrame(loop);
  })();
})();

/* ─── IMAGE TILT: 3D MOUSE-MOVE PARALLAX ─── */
(function initImageTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  [
    { sel: '.hero__arch-container', xf: 5, yf: 4 },
    { sel: '.about__img-main',      xf: 4, yf: 3 },
  ].forEach(({ sel, xf, yf }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      el.style.transition = 'transform 0.1s linear';
      el.style.transform  = `perspective(700px) rotateY(${dx * xf}deg) rotateX(${-dy * yf}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
      el.style.transform  = '';
    });
  });
})();

/* ─── CANDLELIGHT PARTICLES IN LHENNA ─── */
(function initCandlelight() {
  const lhenna = document.querySelector('.lhenna');
  if (!lhenna) return;
  for (let i = 0; i < 7; i++) {
    const g  = document.createElement('div');
    g.className = 'candle-glow';
    const sz = 80 + Math.random() * 160;
    g.style.cssText = [
      `left:${15 + Math.random() * 70}%`,
      `top:${10  + Math.random() * 80}%`,
      `--size:${sz}px`,
      `--dur:${3  + Math.random() * 5}s`,
      `--delay:${Math.random() * 5}s`,
    ].join(';');
    lhenna.appendChild(g);
  }
})();

/* ─── ZELLIGE MOSAIC: SCROLL REVEAL ─── */
document.querySelectorAll('.zellige-mosaic').forEach(el => {
  el.classList.add('zl-hidden');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      el.classList.remove('zl-hidden');
      el.classList.add('zl-visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.15 });
  obs.observe(el);
});

/* ─── SCROLL CUE: FADE ON FIRST SCROLL ─── */
(function() {
  const cue = document.querySelector('.hero__scroll-cue');
  if (!cue) return;
  const hide = () => {
    if (window.scrollY > 60) {
      cue.classList.add('faded');
      window.removeEventListener('scroll', hide);
    }
  };
  window.addEventListener('scroll', hide, { passive: true });
})();

/* ─── NAV: ACTIVE LINK — CLEAN CLASS-BASED ─── */
(function() {
  const sects = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__links a[href^="#"]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => {
        const active = a.getAttribute('href') === `#${e.target.id}`;
        a.classList.toggle('nav-active', active);
        // clear inline styles set by old observer
        a.style.color      = '';
        a.style.fontWeight = '';
      });
    });
  }, { threshold: 0.4 });
  sects.forEach(s => obs.observe(s));
})();

/* ─── HERO: GOLD DUST + EMBER PARTICLES ─── */
(function initGoldDust() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  for (let i = 0; i < 42; i++) {
    const isEmber = (i % 6 === 0);
    const el = document.createElement('div');
    el.className = isEmber ? 'hero__gold-dust hero__gold-dust--ember' : 'hero__gold-dust';
    const sz  = isEmber
      ? (1.2 + Math.random() * 1.8).toFixed(1)
      : (0.6 + Math.random() * 3.0).toFixed(1);
    const op  = isEmber
      ? (0.12 + Math.random() * 0.22).toFixed(2)
      : (0.07 + Math.random() * 0.30).toFixed(2);
    el.style.cssText = [
      `--x:${(2 + Math.random() * 96).toFixed(1)}%`,
      `--dur:${(7 + Math.random() * 14).toFixed(1)}s`,
      `--del:${(Math.random() * 24).toFixed(1)}s`,
      `--sz:${sz}px`,
      `--op:${op}`,
      `--dx:${(-22 + Math.random() * 44).toFixed(1)}px`
    ].join(';');
    hero.appendChild(el);
  }
})();

/* ─── HERO: FORCE ARCH VIDEOS TO PLAY ─── */
document.querySelectorAll('.hero__arch-panel video').forEach(v => {
  v.muted = true;
  v.play().catch(() => {});
});

/* ─── LHENNA: CANDLELIGHT SCENE ENTRANCE ─── */
(function initLhennaLightUp() {
  const section = document.querySelector('.lhenna');
  if (!section) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => section.classList.add('lhenna--lit'), 200);
      obs.disconnect();
    });
  }, { threshold: 0.12 });
  obs.observe(section);
})();

/* ─── LHENNA: RISING EMBERS ─── */
(function initEmbers() {
  const gallery = document.querySelector('.lhenna__gallery');
  if (!gallery) return;
  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div');
    el.className = 'lhenna__ember';
    const sz = (1.5 + Math.random() * 2.5).toFixed(1);
    const op = (0.2 + Math.random() * 0.45).toFixed(2);
    const dx = (-10 + Math.random() * 20).toFixed(1);
    el.style.cssText = [
      `--x:${(15 + Math.random() * 70).toFixed(1)}%`,
      `--dur:${(5 + Math.random() * 7).toFixed(1)}s`,
      `--del:${(Math.random() * 12).toFixed(1)}s`,
      `--sz:${sz}px`,
      `--op:${op}`,
      `--dx:${dx}px`
    ].join(';');
    gallery.appendChild(el);
  }
})();
