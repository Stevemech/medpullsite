// MedPull site interactions (no dependencies)
(function () {
  'use strict';

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  window.MEDPULL_SITE = true;
  root.classList.add('js');

  // Hold entrance animations until the font is in, so nothing reflows mid-animation.
  const ready = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(1200)])
    .then(() => { root.classList.add('is-ready'); });

  // Footer year
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* --- Nav: stronger glass once the page scrolls, mobile menu toggle ------ */
  const nav = $('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = $('[data-nav-toggle]', nav);
    if (toggle) {
      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
      nav.addEventListener('click', (e) => { if (e.target.closest('.nav-links a, .nav-cta a')) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }
  }

  /* --- Drifting colour fog inside every canvas ----------------------------- */
  $$('.canvas').forEach((canvas) => {
    const fog = document.createElement('div');
    fog.className = 'aurora';
    fog.setAttribute('aria-hidden', 'true');
    fog.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    canvas.prepend(fog);
    canvas.classList.add('has-aurora');
  });

  /* --- Product tabs with a sliding glass thumb ----------------------------- */
  const tablist = $('[role="tablist"]');
  const tabs = $$('[role="tab"]');
  if (tablist && tabs.length) {
    const thumb = document.createElement('span');
    thumb.className = 'tab-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    tablist.prepend(thumb);
    tablist.classList.add('has-thumb', 'no-anim');

    const moveThumb = (tab) => {
      thumb.style.width = tab.offsetWidth + 'px';
      thumb.style.height = tab.offsetHeight + 'px';
      thumb.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    };
    const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];

    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const active = t === tab;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        t.tabIndex = active ? 0 : -1;
        if (!panel) return;
        panel.hidden = !active;
        if (active) {
          panel.classList.remove('is-entering');
          void panel.offsetWidth; // restart the entrance animation
          panel.classList.add('is-entering');
          // Replay the chat so it reads as a live conversation each time.
          $$('.chat-message', panel).forEach((m, i) => {
            m.style.animation = 'none';
            void m.offsetWidth;
            m.style.animation = `bubbleIn .5s var(--spring) ${0.15 + i * 0.1}s both`;
          });
        }
      });
      moveThumb(tab);
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
      });
    });

    moveThumb(current());
    requestAnimationFrame(() => requestAnimationFrame(() => tablist.classList.remove('no-anim')));
    window.addEventListener('resize', () => moveThumb(current()));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveThumb(current()));
  }

  /* --- Scroll reveal ------------------------------------------------------ */
  // Keep in sync with the matching selector list in site.css.
  const REVEAL = [
    '.section-head', '.procedures > p', '.procedure-list > li', '.compare > *', '.tabs', '.stage-tile',
    '.bento > *', '.steps > *', '.origin', '.trust > *', '.faq-aside', '.faq-list > *', '.cta-panel',
    '.page-top > *', '.split-intro > :not(.checklist)', '.checklist > li', '.split > .form-card',
    '.scenarios > *', '.demo-step', '.demo-grid .card', '.demo-note', '.footer-grid > *',
  ];
  // Stagger siblings, and cascade the bars and dots inside graphics.
  $$('.silence-row').forEach((row, r) => $$('i', row).forEach((dot, i) => dot.style.setProperty('--i', r * 2 + i)));
  $$('.spark, .bars').forEach((set) => $$('i', set).forEach((bar, i) => bar.style.setProperty('--i', i)));

  const targets = $$(REVEAL.join(','));
  targets.forEach((el) => {
    const group = $$(':scope > *', el.parentElement).filter((sib) => targets.includes(sib));
    el.style.setProperty('--d', Math.min(Math.max(group.indexOf(el), 0), 6));
  });

  const show = (el) => { el.classList.add('is-shown'); el.dispatchEvent(new CustomEvent('shown')); };

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        show(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    ready.then(() => targets.forEach((el) => io.observe(el)));

    // Safety net for fast scrolling or anchor jumps: anything above the fold is shown.
    let pending = targets.slice();
    let queued = false;
    const sweep = () => {
      queued = false;
      pending = pending.filter((el) => {
        if (el.classList.contains('is-shown')) return false;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.94) { io.unobserve(el); show(el); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', onSweep);
    };
    const onSweep = () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
    window.addEventListener('scroll', onSweep, { passive: true });
  }

  /* --- Count-up numbers ---------------------------------------------------- */
  $$('[data-count]').forEach((el) => {
    const to = parseFloat(el.getAttribute('data-count'));
    const host = el.closest('.is-shown, ' + REVEAL.join(','));
    if (reduceMotion || !isFinite(to) || !host) return;
    el.textContent = '0';
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1400);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (host.classList.contains('is-shown')) run();
    else host.addEventListener('shown', run, { once: true });
  });

  /* --- A soft light that follows the pointer across glass ------------------ */
  if (finePointer && !reduceMotion) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('.tile, .card, .scenario-card, .gtile');
      if (!el || el.closest('.dash')) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* --- Only run decorative loops while they are on screen ------------------ */
  // Start them a little before they scroll in, so they are already moving when seen.
  const loopHosts = $$('.canvas, .gtile, .origin, .stage-tile, .tile, .card');
  if ('IntersectionObserver' in window) {
    const lio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-live', entry.isIntersecting));
    }, { rootMargin: '40% 0px' });
    loopHosts.forEach((el) => lio.observe(el));
  } else {
    loopHosts.forEach((el) => el.classList.add('is-live'));
  }

  /* --- Display: scale the 1280×720 dashboard to fit, tilt it on scroll ----- */
  const screen = $('[data-screen]');
  const dash = screen && $('.dash', screen);
  if (screen && dash) {
    // Phones get the display in portrait, zoomed to the worklist and live check-in.
    const narrow = window.matchMedia('(max-width: 560px)');
    const fit = () => {
      const crop = narrow.matches;
      dash.classList.toggle('is-crop', crop);
      dash.style.setProperty('--s', (screen.clientWidth / (crop ? 500 : 1280)).toFixed(4));
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(screen);
    else window.addEventListener('resize', fit);
  }

  const tilt = $('[data-tilt]');
  if (tilt && !reduceMotion) {
    let queued = false;
    const MAX = 14;
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      const top = tilt.getBoundingClientRect().top;
      // Leans back while low on the screen, stands upright by the time it is near the top.
      const p = Math.min(1, Math.max(0, 1 - (top - vh * 0.12) / (vh * 0.62)));
      tilt.style.setProperty('--tilt', (MAX * (1 - p)).toFixed(2) + 'deg');
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* --- Hero: a text check-in lands on the team's list for today ----------- */
  const sms = $('[data-hero-sms]');
  if (sms) {
    const script = [
      ['in', 'Hi Maria, quick recovery check-in from Riverside Ortho. Pain right now, 0 to 10?'],
      ['out', '7'],
      ['in', 'Any swelling, redness, or drainage at the incision?'],
      ['out', 'Some swelling'],
      ['in', 'Any fever or chills?'],
      ['out', 'No'],
      ['in', 'Thanks, Maria. Your care team will review this today.'],
    ];

    const note = $('[data-hero-note]');
    const list = $('[data-hero-list]');

    const addMsg = (dir, text) => {
      const el = document.createElement('div');
      el.className = 'sms-msg sms-' + dir;
      el.textContent = text;
      sms.appendChild(el);
      return el;
    };

    const pop = (el) => {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    };

    const checkIn = (animate) => {
      $$('[data-hero-checkins]').forEach((el) => { el.textContent = '214'; if (animate) pop(el); });
      $$('[data-hero-pain]').forEach((el) => { el.textContent = '7'; if (animate) pop(el); });
      $$('[data-hero-gauge]').forEach((el) => el.style.setProperty('--p', '.7'));
      $$('[data-hero-delta]').forEach((el) => { el.hidden = false; });
    };

    const flagMaria = (animate) => {
      if (note) note.classList.add('is-on');
      $$('[data-hero-count]').forEach((el) => { el.textContent = '3'; if (animate) pop(el); });
      $$('[data-hero-ontrack]').forEach((el) => { el.textContent = '237'; });
      if (list && !list.querySelector('[data-maria]')) {
        const row = document.createElement('div');
        row.className = 'dash-row' + (animate ? ' is-new' : '');
        row.setAttribute('data-maria', '');
        row.innerHTML =
          '<span class="avatar av-1">MA</span>' +
          '<span><b>Maria Alvarez</b><span class="sub">Knee · resting HR rising vs baseline</span></span>' +
          '<span class="pill pill-attention">High risk</span>';
        list.prepend(row);
      }
    };

    // Start once the display is in view, so visitors see the story from the beginning.
    const showcase = sms.closest('.showcase');
    let started = false;
    const play = async () => {
      if (started) return;
      started = true;
      await ready;
      await sleep(500);
      if (showcase) show(showcase);
      await sleep(500);
      for (const [i, [dir, text]] of script.entries()) {
        if (dir === 'in') {
          const typing = addMsg('in', '');
          typing.classList.add('sms-typing');
          typing.innerHTML = '<i></i><i></i><i></i>';
          await sleep(900);
          typing.remove();
          addMsg('in', text);
          await sleep(1150);
        } else {
          addMsg('out', text);
          if (i === 1) checkIn(true);
          await sleep(800);
        }
      }
      await sleep(450);
      flagMaria(true);
    };

    if (reduceMotion) {
      script.slice(-4).forEach(([dir, text]) => addMsg(dir, text));
      if (showcase) show(showcase);
      checkIn(false);
      flagMaria(false);
    } else if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { sio.disconnect(); play(); }
      }, { threshold: 0.35 });
      sio.observe(showcase || sms);
    } else {
      play();
    }
  }

  /* --- Compare: an endless table vs. the same patients, sorted ------------- */
  const scanCount = $('[data-scan]');
  if (scanCount && !reduceMotion) {
    let n = 1;
    setInterval(() => {
      if (!scanCount.closest('.is-live')) return;
      n = n >= 240 ? 1 : n + 1;
      scanCount.textContent = n;
    }, 1800);
  }

  const sorter = $('[data-sorter]');
  const sorterStatus = $('[data-sorter-status]');
  if (sorter) {
    const setState = (state) => {
      sorter.classList.toggle('is-reading', state === 'reading');
      sorter.classList.toggle('is-sorted', state === 'sorted');
      if (sorterStatus) {
        sorterStatus.classList.toggle('is-reading', state === 'reading');
        sorterStatus.classList.toggle('is-sorted', state === 'sorted');
      }
    };
    if (reduceMotion) {
      setState('sorted');
    } else {
      const card = sorter.closest('.compare > *') || sorter;
      const cycle = async () => {
        for (;;) {
          setState('idle');
          await sleep(60);
          setState('reading');
          await sleep(2200);
          setState('sorted');
          await sleep(6500);
          while (!card.classList.contains('is-live')) await sleep(500);
        }
      };
      if (card.classList.contains('is-shown')) cycle();
      else card.addEventListener('shown', () => sleep(400).then(cycle), { once: true });
    }
  }
})();
