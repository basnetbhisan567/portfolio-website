/* ==========================================================================
   BHISAN BASNET — PORTFOLIO v6.3 (FINAL)
   Vanilla JS. Zero dependencies. Each module initializes independently.
   window.__bbBooted flags a successful boot for the head-script failsafe.

   Module map:
   1 Theme          2 Nav            3 Nav auto-close  4 Accent sync
   5 Typewriter     6 Terminal       7 Reveal          8 Counters
   9 Particle field 10 Holo parallax 11 Magnetic       12 Cursor glow
   13 Skill filter  14 Copy buttons  15 Contact form   16 Status bar
   17 Carousel      18 Footer year   19 Photo FX       20 Tab visibility

   v6.3 changes vs your draft:
   • Cinematic particle field kept (v6.2 — your pick) instead of matrix rain
   • initPhotoFX now ALSO guards .section-photo images (merged the
     duplicate initPhotoGuard — and it's actually in the boot list now)
   • initHoloParallax added: your CSS reads --px/--py on [data-parallax]
   • AbortController 10s timeout on the form fetch (v6.2)
   • Graceful IO fallbacks in counters + scroll-spy (v6.2)
   ========================================================================== */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CONTACT_EMAIL = 'basnetbhisan567b@gmail.com';
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* 1. THEME -------------------------------------------------------------- */
  function initTheme() {
    const btn = $('[data-theme-toggle]');
    if (!btn) return;
    const root = document.documentElement;
    const meta = $('#meta-theme-color');
    const paint = (theme) => {
      root.setAttribute('data-theme', theme);
      if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f9fc' : '#05080f');
      const icon = btn.querySelector('i');
      if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      document.dispatchEvent(new CustomEvent('bb:theme', { detail: { theme } }));
    };
    paint(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('bb-theme', next); } catch (_) { /* private mode */ }
      paint(next);
    });
  }

  /* 2. NAV (menu, scroll fx, progress, scroll-spy) ------------------------- */
  function initNav() {
    const header = $('#header');
    const toggle = $('.nav__toggle');
    const list = $('#nav-list');
    const links = $$('.nav__link');
    const backToTop = $('#back-to-top');
    const progressBar = $('#scroll-progress-bar');

    const closeMenu = () => {
      document.body.classList.remove('nav-open');
      if (toggle) {
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    if (toggle && list) {
      toggle.addEventListener('click', () => {
        const open = document.body.classList.toggle('nav-open');
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      links.forEach((l) => l.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
          closeMenu();
          toggle.focus();
        }
      });
      document.addEventListener('click', (e) => {
        if (document.body.classList.contains('nav-open') &&
            !list.contains(e.target) && !toggle.contains(e.target)) closeMenu();
      });
    }

    if (header) header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

    let lastY = window.scrollY, ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
      if (header) {
        header.classList.toggle('is-scrolled', y > 24);
        if (y > lastY && y > 160 && !document.body.classList.contains('nav-open')) header.classList.add('is-hidden');
        else header.classList.remove('is-hidden');
      }
      if (backToTop) backToTop.classList.toggle('show', y > 640);
      lastY = y; ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        $('#main')?.focus({ preventScroll: true });
      });
    }

    // Scroll-spy — graceful if IntersectionObserver is missing.
    const sections = $$('main section[id]');
    if (sections.length && links.length && 'IntersectionObserver' in window) {
      const byId = new Map(links.map((l) => [l.getAttribute('href').replace('#', ''), l]));
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
          const link = byId.get(entry.target.id);
          if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'true'); }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach((s) => spy.observe(s));
    }
    // Without the spy, links still work — they just don't highlight.
  }

  /* 3. NAV AUTO-CLOSE on viewport growth ------------------------------------ */
  function initNavAutoClose() {
    const mq = window.matchMedia('(min-width: 881px)');
    const onChange = (e) => {
      if (!e.matches) return;
      document.body.classList.remove('nav-open');
      const t = $('.nav__toggle');
      if (t) { t.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false'); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* 4. ACCENT SYNC — live tone for particles + glow.
     Hero (no data-accent) = brand pink; sections resolve their own tone
     from --tone-*, so light-mode AA contrast is inherited. ------------------ */
  function initAccentSync() {
    const rootEl = document.documentElement;
    if (!window.getComputedStyle) return;
    const TONES = { emerald: '--tone-1', pink: '--tone-2', cyan: '--tone-3', amber: '--tone-4', violet: '--tone-5' };
    let lastTone = TONES.pink;
    const hexToRgb = (hex) => {
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(hex).trim());
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
    };
    const emit = (varName) => {
      const color = getComputedStyle(rootEl).getPropertyValue(varName).trim();
      if (!color) return;
      rootEl.style.setProperty('--live-sec', color);
      const rgb = hexToRgb(color);
      if (rgb) rootEl.style.setProperty('--glow-rgb', rgb.join(', '));
      document.dispatchEvent(new CustomEvent('bb:accent', { detail: { color } }));
    };
    emit(lastTone); // boot pink — matches --accent
    const sections = $$('main section[data-accent]');
    if (sections.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const mode = en.target.getAttribute('data-accent') || 'pink';
          lastTone = TONES[mode === '' ? 'emerald' : mode] || TONES.pink;
          emit(lastTone);
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach((s) => io.observe(s));
    }
    // Theme toggle → re-emit (inline --live-sec would beat [data-theme])
    document.addEventListener('bb:theme', () => emit(lastTone));
  }

  /* 5. TYPEWRITER ------------------------------------------------------------ */
  function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;
    const roles = [
      'I build full-stack apps with React & Python.',
      'I write C++ that respects memory.',
      'Java, data structures & algorithms — daily practice.',
      'I learn by building, breaking, and rebuilding.'
    ];
    if (prefersReducedMotion) { el.textContent = roles[0]; return; }
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      let delay = deleting ? 32 : 68;
      if (!deleting && c === word.length) { delay = 2200; deleting = true; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 480; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 600);
  }

  /* 6. TERMINAL ---------------------------------------------------------------- */
  function initTerminal() {
    const body = $('#terminal-body');
    if (!body) return;
    const script = [
      { cmd: 'whoami', out: ['Bhisan Basnet — CS Student, Collin College'] },
      { cmd: 'cat stack.txt', out: ['frontend: React · backend: Python', 'core: Java & C++ · daily DSA practice'] },
      { cmd: './project --status', out: ['codemaster: React UI shipped, API layer in progress', 'ui: React ✓ · api: Python — building'] },
      { cmd: 'contact --info', out: ['open to internships ✓', 'location: Plano, TX — Dallas metro'] }
    ];
    const make = (cls, text) => {
      const div = document.createElement('div');
      div.className = cls;
      if (text) div.textContent = text;
      return div;
    };
    const renderStatic = () => {
      script.forEach((step) => {
        body.appendChild(make('terminal__line', `$ ${step.cmd}`));
        step.out.forEach((o) => body.appendChild(make('terminal__line terminal__line--out', o)));
      });
      body.appendChild(make('terminal__line terminal__line--cursor'));
    };
    const typeLine = async (text, target) => {
      for (const ch of text) {
        target.textContent += ch;
        await sleep(26 + Math.random() * 46);
      }
    };
    const run = async () => {
      for (const step of script) {
        const line = make('terminal__line');
        const prompt = document.createElement('span');
        prompt.className = 'terminal__prompt';
        prompt.textContent = '$ ';
        const text = document.createElement('span');
        line.append(prompt, text);
        body.appendChild(line);
        await sleep(300);
        await typeLine(step.cmd, text);
        await sleep(320);
        for (const o of step.out) {
          body.appendChild(make('terminal__line terminal__line--out', o));
          await sleep(140);
        }
      }
      body.appendChild(make('terminal__line terminal__line--cursor'));
    };
    if (prefersReducedMotion) renderStatic(); else run();
  }

  /* 7. SCROLL REVEAL ------------------------------------------------------------ */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    items.forEach((el) => {
      if (el.dataset.revealDelay) el.style.transitionDelay = `${el.dataset.revealDelay}ms`;
      const group = el.closest('[data-reveal-group]');
      if (group) {
        const siblings = $$('[data-reveal]', group);
        const idx = siblings.indexOf(el);
        if (idx > -1) el.style.transitionDelay = `${Math.min(idx * 80, 480)}ms`;
      }
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        setTimeout(() => { el.style.transitionDelay = ''; }, 900);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -48px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* 8. COUNTERS — graceful fallback when IO is missing. Real values
     already live in the markup; without IO we simply leave them. ---------------- */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        const n = parseFloat(el.dataset.count) || 0;
        const s = el.dataset.suffix || '';
        el.textContent = n + s;
      });
      return;
    }

    const animate = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1400, start = performance.now();
      el.textContent = '0' + suffix;
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* 9. CINEMATIC PARTICLE FIELD
     Sprite-based rendering (zero per-frame allocations). One pre-rendered
     radial glow sprite per accent color; rebuilds only on accent/theme change.
     Paused when tab is hidden. DPR capped to 1.5. ------------------------------ */
  function initCinematicParticles() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;

    const conn = navigator.connection;
    if (prefersReducedMotion || conn?.saveData || (navigator.hardwareConcurrency || 8) <= 2) {
      canvas.remove();
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) { canvas.remove(); return; } // no 2D context — bail silently

    let W = 0, H = 0, dpr = 1, rafId = null;
    let accentRGB = [255, 95, 162]; // brand pink
    let particles = [];
    let sprite = null;
    const SPRITE = 64;

    const hexToRgb = (hex) => {
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(hex).trim());
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
    };
    const readAccent = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--live-sec').trim();
      const rgb = hexToRgb(v);
      if (rgb) accentRGB = rgb;
    };

    const buildSprite = () => {
      if (!sprite) {
        sprite = document.createElement('canvas');
        sprite.width = sprite.height = SPRITE;
      }
      const sctx = sprite.getContext('2d');
      if (!sctx) return;
      sctx.clearRect(0, 0, SPRITE, SPRITE);
      const [ar, ag, ab] = accentRGB;
      const g = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
      g.addColorStop(0, `rgba(${ar},${ag},${ab},1)`);
      g.addColorStop(0.4, `rgba(${ar},${ag},${ab},0.32)`);
      g.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, SPRITE, SPRITE);
    };

    const make = () => {
      const depth = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + depth * 2.2,
        vx: (0.008 + depth * 0.022) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2,
        amp: (6 + depth * 26) * 0.5,
        alpha: 0.10 + depth * 0.45
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.width = Math.floor(window.innerWidth * dpr);
      H = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(130, Math.max(50, Math.floor((window.innerWidth * window.innerHeight) / 20000)));
      particles = Array.from({ length: count }, make);
    };

    let t = 0;
    const frame = () => {
      t += 0.005;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        p.x += p.vx * 0.02;
        p.y += p.vy * 0.02 + Math.sin(t + p.phase) * 0.00035;
        if (p.x > 1.06) p.x = -0.06; else if (p.x < -0.06) p.x = 1.06;
        if (p.y > 1.06) p.y = -0.06; else if (p.y < -0.06) p.y = 1.06;

        const px = p.x * W;
        const py = p.y * H + Math.sin(t * 2 + p.phase) * p.amp * dpr;
        const size = p.r * dpr * 12;

        // glow sprite (no per-frame gradient allocation)
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size);

        // bright core
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, p.r * dpr * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(frame);
    };

    const start = () => { if (rafId === null && !document.hidden) rafId = requestAnimationFrame(frame); };
    const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };

    readAccent(); buildSprite(); resize(); start();

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 180); });
    window.addEventListener('load', resize);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    document.addEventListener('bb:accent', () => { readAccent(); buildSprite(); });
    document.addEventListener('bb:theme', () => { readAccent(); buildSprite(); });
  }

  /* 10. HOLO PARALLAX — cutouts drift gently with the mouse.
     Writes --px/--py, which the v6.0 CSS consumes on [data-parallax]. ---------- */
  function initHoloParallax() {
    if (!hasFinePointer || prefersReducedMotion) return;
    const figs = $$('[data-parallax]');
    if (!figs.length) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null;
    window.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 18;
      ty = (e.clientY / window.innerHeight - 0.5) * 12;
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      figs.forEach((f) => {
        f.style.setProperty('--px', cx.toFixed(2) + 'px');
        f.style.setProperty('--py', cy.toFixed(2) + 'px');
      });
      rafId = requestAnimationFrame(loop);
    };
    const start = () => { if (rafId === null && !document.hidden) rafId = requestAnimationFrame(loop); };
    const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  }

  /* 11. MAGNETIC BUTTONS --------------------------------------------------------- */
  function initMagnetic() {
    if (!hasFinePointer || prefersReducedMotion) return;
    $$('[data-magnetic]').forEach((btn) => {
      const strength = 0.25;
      btn.addEventListener('pointermove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* 12. CURSOR GLOW ---------------------------------------------------------------- */
  function initCursorGlow() {
    const glow = $('.cursor-glow');
    if (!glow || !hasFinePointer || prefersReducedMotion) return;
    const size = glow.offsetWidth || 340;
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2, x = tx, y = ty, rafId = null;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('is-active');
    }, { passive: true });
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      glow.style.transform = `translate3d(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px, 0)`;
      rafId = requestAnimationFrame(loop);
    };
    const start = () => { if (rafId === null && !document.hidden) rafId = requestAnimationFrame(loop); };
    const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  }

  /* 13. SKILL FILTER ----------------------------------------------------------------- */
  function initSkillFilter() {
    const buttons = $$('.filter__btn');
    const cards = $$('.skill-card');
    const status = $('#skills-status');
    if (!buttons.length || !cards.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        cards.forEach((card) => {
          card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
        });
        if (status) {
          const visible = cards.filter((c) => !c.classList.contains('is-hidden')).length;
          status.textContent = `Showing ${visible} of ${cards.length} skills`;
        }
      });
    });
  }

  /* 14. COPY TO CLIPBOARD --------------------------------------------------------------- */
  function initCopyButtons() {
    $$('[data-copy]').forEach((btn) => {
      const icon = btn.querySelector('i');
      const live = $('.js-copy-status', btn);
      const originalIcon = icon ? icon.className : '';
      const originalLive = live ? live.textContent : '';
      let timer = null;
      btn.addEventListener('click', async () => {
        const value = btn.getAttribute('data-copy');
        let ok = false;
        try { await navigator.clipboard.writeText(value); ok = true; }
        catch (_) {
          try {
            const ta = document.createElement('textarea');
            ta.value = value; ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(ta); ta.select();
            ok = document.execCommand('copy'); ta.remove();
          } catch (_) { /* give up */ }
        }
        if (!ok) {
          if (live) live.textContent = 'Copy failed — please copy it manually';
          clearTimeout(timer);
          timer = setTimeout(() => { if (live) live.textContent = originalLive; }, 2400);
          return;
        }
        if (icon) icon.className = 'fa-solid fa-check';
        if (live) live.textContent = 'Copied to clipboard';
        btn.classList.add('is-copied');
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (icon) icon.className = originalIcon;
          if (live) live.textContent = originalLive;
          btn.classList.remove('is-copied');
        }, 1600);
      });
    });
  }

  /* 15. CONTACT FORM
     Configured endpoint → fetch with abort timeout, 10s.
     Not configured → mailto: fallback, panel honestly says
     "Opening your email app…" — never "sent". --------------------------------------------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const success = $('#form-success');
    const error = $('#form-error');
    const successTitle = $('#form-success-title');
    const successText = $('#form-success-text');
    const submitBtn = form.querySelector('button[type="submit"]');
    const endpoint = form.getAttribute('action') || '';
    const configured = endpoint && !endpoint.includes('YOUR_FORM_ID');

    const showPanel = (panel) => {
      form.hidden = true; panel.hidden = false;
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.querySelector('.honeypot')?.value) { showPanel(success); return; }

      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Sending…';
      if (error) error.hidden = true;

      try {
        if (!configured) {
          const data = new FormData(form);
          const name = String(data.get('name') || '').trim();
          const from = String(data.get('email') || '').trim();
          const msg = String(data.get('message') || '').trim();
          const subject = encodeURIComponent(`Portfolio contact — ${name}`);
          const body = encodeURIComponent(`${msg}\n\n— ${name} (${from})`);
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
          if (successTitle) successTitle.textContent = 'Opening your email app…';
          if (successText) {
            successText.textContent = `If nothing opened, email me directly at ${CONTACT_EMAIL}.`;
          }
          form.reset();
          showPanel(success);
        } else {
          // Real endpoint → send with a hard timeout.
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          let res;
          try {
            res = await fetch(endpoint, {
              method: 'POST',
              body: new FormData(form),
              headers: { Accept: 'application/json' },
              signal: controller.signal
            });
          } finally {
            clearTimeout(timeoutId);
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          if (successTitle) successTitle.textContent = 'Message sent!';
          if (successText) successText.textContent = "Thanks for reaching out — I'll get back to you soon.";
          form.reset();
          showPanel(success);
        }
      } catch (_) {
        if (error) {
          error.hidden = false;
          error.focus({ preventScroll: true });
          error.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }
    });

    const resetBtn = $('#form-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (success) success.hidden = true;
        form.hidden = false;
        form.querySelector('input')?.focus();
      });
    }
  }

  /* 16. STATUS BAR — real data only (clock, section, progress) ------------------------------ */
  function initStatusBar() {
    const timeEl = $('#status-time');
    const sectionEl = $('#status-section');
    const progressEl = $('#status-progress');

    if (timeEl) {
      const renderTime = () => {
        if (document.hidden) return;
        timeEl.textContent = new Date().toLocaleTimeString('en-US', {
          hour12: false, timeZone: 'America/Chicago' // Plano, TX — not the visitor's tz
        });
      };
      renderTime();
      setInterval(renderTime, 1000);
    }

    if (sectionEl && 'IntersectionObserver' in window) {
      const sections = $$('main section[id]');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          sectionEl.textContent = en.target.id.replace(/-/g, ' ').toUpperCase();
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach((s) => io.observe(s));
    }

    if (progressEl) {
      let ticking = false;
      const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
        progressEl.textContent = `${pct}%`;
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
      }, { passive: true });
      updateProgress();
    }
  }

  /* 17. PROJECTS CAROUSEL ---------------------------------------------------------------------- */
  function initCarousel() {
    const root = $('[data-carousel]');
    if (!root) return;
    const track = $('.carousel__track', root);
    const cards = $$('.project-card', track);
    const prevBtn = $('[data-dir="-1"]', root);
    const nextBtn = $('[data-dir="1"]', root);
    const dotsWrap = $('.carousel__dots', root);
    if (!track || !cards.length) return;

    const dots = cards.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel__dot';
      b.setAttribute('aria-label', `Go to project ${i + 1} of ${cards.length}`);
      b.addEventListener('click', () => scrollToCard(i));
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    const nearestIndex = () => {
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) return cards.length - 1;
      let best = 0, bestDist = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - track.scrollLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };

    const scrollToCard = (i) => {
      const clamped = Math.max(0, Math.min(i, cards.length - 1));
      track.scrollTo({ left: cards[clamped].offsetLeft, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const sync = () => {
      const i = nearestIndex();
      dots.forEach((d, j) => {
        const active = j === i;
        d.classList.toggle('is-active', active);
        if (active) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 4;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    };

    if (prevBtn) prevBtn.addEventListener('click', () => scrollToCard(nearestIndex() - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollToCard(nearestIndex() + 1));

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollToCard(nearestIndex() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToCard(nearestIndex() - 1); }
    });

    // Drag-to-scroll; capture only after the 5px threshold so links stay clickable
    let dragging = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || prefersReducedMotion) return;
      dragging = true; moved = false;
      startX = e.clientX; startLeft = track.scrollLeft;
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        track.classList.add('is-dragging');
        try { track.setPointerCapture(e.pointerId); } catch (_) { /* safe */ }
      }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (moved) scrollToCard(nearestIndex());
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { sync(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    sync();
  }

  /* 18. FOOTER YEAR ------------------------------------------------------------------------------ */
  function initYear() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* 19. PHOTO FX — reveal cutouts + portrait, self-remove broken images.
     Covers [data-holo], [data-photo-fx] AND .section-photo backgrounds
     (merged — the old draft had this logic duplicated across two modules
     and only registered one of them). --------------------------------------- */
  function initPhotoFX() {
    const figs = $$('[data-holo], [data-photo-fx]');
    figs.forEach((f) => {
      const img = f.querySelector('img');
      if (img) img.addEventListener('error', () => f.remove(), { once: true });
    });

    // A missing section background photo removes its own overlay cleanly
    $$('.section-photo img').forEach((img) => {
      img.addEventListener('error', () => img.closest('.section-photo')?.remove(), { once: true });
    });

    if (!figs.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      figs.forEach((f) => f.classList.add('is-on'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-on');
        io.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    figs.forEach((f) => io.observe(f));
  }

  /* 20. TAB VISIBILITY — pause pure-CSS animations on hidden tabs --------------------------------- */
  function initTabVisibility() {
    const root = document.documentElement;
    const sync = () => root.classList.toggle('tab-hidden', document.hidden);
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  /* BOOT -------------------------------------------------------------------------------------------- */
  const modules = [
    initTheme, initNav, initNavAutoClose, initAccentSync, initTypewriter,
    initTerminal, initReveal, initCounters, initCinematicParticles,
    initHoloParallax, initMagnetic, initCursorGlow, initSkillFilter,
    initCopyButtons, initContactForm, initStatusBar, initCarousel,
    initYear, initPhotoFX, initTabVisibility
  ];
  const boot = () => {
    window.__bbBooted = true; // head-script failsafe release
    modules.forEach((fn) => {
      try { fn(); } catch (err) { console.error(`[bb-portfolio] ${fn.name} failed →`, err); }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
