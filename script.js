/* ═══════════════════════════════════════════════════════
   MAHANOOR – PORTFOLIO JAVASCRIPT
   Handles: Particles · Cursor · Typed Text · AOS ·
            Tilt Cards · Skill Bars · Nav · Form · Tabs
═══════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. INITIALISE AOS (Animate On Scroll)
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });
});

/* ──────────────────────────────────────────
   2. PARTICLE BACKGROUND CANVAS
────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const COLORS = ['#3b82f6', '#a855f7', '#06b6d4', '#ec4899'];
  const COUNT = window.innerWidth < 768 ? 50 : 100;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = Math.random() * 1.8 + 0.4;
    this.vx   = (Math.random() - 0.5) * 0.35;
    this.vy   = (Math.random() - 0.5) * 0.35;
    this.life = Math.random();
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  };

  function buildParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  /* Draw connection lines between nearby particles */
  function drawConnections() {
    const MAX_DIST = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,246,${(1 - d / MAX_DIST) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.004;

      if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) p.reset();

      const alpha = 0.3 + 0.5 * Math.abs(Math.sin(p.life));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    animId = requestAnimationFrame(tick);
  }

  resize();
  buildParticles();
  tick();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    buildParticles();
    tick();
  });
})();

/* ──────────────────────────────────────────
   2b. 3D HERO SCENE (Three.js)
   A rotating wireframe icosahedron wrapped in a
   particle point-cloud, rendered behind the profile
   photo orb. Falls back silently if Three.js or
   WebGL isn't available.
────────────────────────────────────────── */
(function init3DScene() {
  const canvas = document.getElementById('hero3d');
  if (!canvas || typeof THREE === 'undefined') return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // WebGL unavailable
  }

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  function size() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* Wireframe icosahedron — the "AI core" */
  const coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.55,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  const coreGeo2 = new THREE.IcosahedronGeometry(2.5, 0);
  const coreMat2 = new THREE.MeshBasicMaterial({
    color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.28,
  });
  const core2 = new THREE.Mesh(coreGeo2, coreMat2);
  scene.add(core2);

  /* Point cloud orbiting the core */
  const PARTICLE_COUNT = 220;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 3.2 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos((Math.random() * 2) - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x06b6d4, size: 0.045, transparent: true, opacity: 0.8,
  });
  const points = new THREE.Points(particleGeo, particleMat);
  scene.add(points);

  size();
  window.addEventListener('resize', size);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    core.rotation.x   = t * 0.18;
    core.rotation.y   = t * 0.26;
    core2.rotation.x  = -t * 0.12;
    core2.rotation.y  = -t * 0.2;
    points.rotation.y = t * 0.06;

    /* subtle parallax toward the cursor */
    camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 1.2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ──────────────────────────────────────────
   3. CUSTOM CURSOR
────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  /* Smooth ring follow */
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  /* Enlarge on interactive elements */
  const HOVER_SELECTORS = 'a, button, .tilt-card, .skill-tab, .nav-link';
  document.querySelectorAll(HOVER_SELECTORS).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });
})();

/* ──────────────────────────────────────────
   4. TYPED TEXT EFFECT
────────────────────────────────────────── */
(function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'AI Chatbots',
    'Agentic Systems',
    'Web Experiences',
    'Automation Workflows',
    'Intelligent Apps',
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(type, 2000); // Pause at full word
        return;
      }
      setTimeout(type, 80);
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 45);
    }
  }

  setTimeout(type, 800);
})();

/* ──────────────────────────────────────────
   5. NAVBAR — scroll state & mobile menu
────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const links     = navLinks ? navLinks.querySelectorAll('.nav-link') : [];

  /* Scroll class */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  /* Mobile toggle */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    /* Close on link click */
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  /* Active link highlight on scroll */
  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    document.querySelectorAll('section[id]').forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = navLinks ? navLinks.querySelector(`a[href="#${id}"]`) : null;
      if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
    });
  }

  updateActiveLink();
})();

/* ──────────────────────────────────────────
   6. SKILL TABS + ANIMATED SKILL BARS
────────────────────────────────────────── */
(function initSkills() {
  const tabs  = document.querySelectorAll('.skill-tab');
  const cards = document.querySelectorAll('.skill-card');

  /* Animate bars when in viewport */
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target.querySelector('.skill-bar');
        if (bar) bar.style.width = bar.dataset.pct + '%';
      }
    });
  }, { threshold: 0.3 });

  cards.forEach(card => barObserver.observe(card));

  /* Tab filtering */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;

      cards.forEach(card => {
        const cardCat = card.dataset.cat || '';
        const match   = cat === 'all' || cardCat.split(' ').includes(cat);
        card.classList.toggle('hidden', !match);
        if (!match) { card.style.display = 'none'; }
        else { card.style.display = ''; }
      });
    });
  });
})();

/* ──────────────────────────────────────────
   7. 3D TILT EFFECT ON CARDS
────────────────────────────────────────── */
(function initTilt() {
  /* Skip on touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  const INTENSITY = 10; // degrees

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -INTENSITY;
      const rotY   = ((x - cx) / cx) *  INTENSITY;

      card.style.transform =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
      card.style.boxShadow =
        `${-rotY * 0.5}px ${rotX * 0.5}px 40px rgba(59,130,246,0.12)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.boxShadow  = '';
    });
  });
})();

/* ──────────────────────────────────────────
   8. HERO LAYOUT — ensure two-column wrapping
────────────────────────────────────────── */
(function wrapHero() {
  const hero        = document.querySelector('.hero');
  const heroContent = hero ? hero.querySelector('.hero-content') : null;
  const heroVisual  = hero ? hero.querySelector('.hero-visual') : null;
  if (!hero || !heroContent || !heroVisual) return;

  /* Insert inner wrapper so grid applies */
  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  hero.insertBefore(inner, heroContent);
  inner.appendChild(heroContent);
  inner.appendChild(heroVisual);
})();

/* ──────────────────────────────────────────
   9. CONTACT FORM (demo, no server)
────────────────────────────────────────── */
(function initContactForm() {
  const btn     = document.getElementById('sendBtn');
  const success = document.getElementById('formSuccess');
  if (!btn) return;

  const fields = ['contactName', 'contactEmail', 'contactSubject', 'contactMessage'];

  btn.addEventListener('click', () => {
    /* Simple validation */
    let valid = true;
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        el.style.borderColor = 'rgba(239,68,68,0.5)';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });
    if (!valid) return;

    /* Simulate send */
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
      if (success) success.classList.add('visible');
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        if (success) success.classList.remove('visible');
      }, 5000);
    }, 1800);
  });
})();

/* ──────────────────────────────────────────
   10. BACK TO TOP BUTTON
────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ──────────────────────────────────────────
   11. COUNTER ANIMATION for hero stats
────────────────────────────────────────── */
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  let started = false;

  function animateCount(el) {
    const raw    = el.textContent.trim();
    const suffix = raw.replace(/[0-9]/g, '');
    const target = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(target)) return; // Skip ∞ etc.

    let current = 0;
    const step  = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 40);
  }

  const observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !started) {
      started = true;
      nums.forEach(n => animateCount(n));
    }
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
})();

/* ──────────────────────────────────────────
   12. SMOOTH ANCHOR SCROLL (fallback)
────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
