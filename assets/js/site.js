// MedPull site interactions (no dependencies)
(function () {
  'use strict';

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  root.classList.add('js');

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

  /* --- Scroll reveal, plus the small animations inside each card ----------- */
  const REVEAL = [
    '.section-head', '.procedures', '.compare > *', '.tabs', '.stage-tile', '.bento > *',
    '.steps > *', '.origin', '.trust > *', '.faq-aside', '.faq-list > *', '.cta-panel',
    '.page-top > *', '.split-intro > *', '.split > .form-card', '.scenarios > *', '.demo-grid > *',
    '.demo-step', '.footer-grid > *',
  ];
  // Give staggered children an index so their transitions cascade.
  $$('.silence-row').forEach((row, r) => $$('i', row).forEach((dot, i) => dot.style.setProperty('--i', r * 2 + i)));
  $$('.spark').forEach((spark) => $$('i', spark).forEach((bar, i) => bar.style.setProperty('--i', i)));

  const targets = [];
  REVEAL.forEach((sel) => {
    $$(sel).forEach((el) => {
      if (targets.some((t) => t === el || t.contains(el))) return;
      const siblings = el.parentElement ? $$(':scope > *', el.parentElement).filter((s) => s.matches(sel)) : [el];
      el.style.setProperty('--d', Math.min(siblings.indexOf(el), 6));
      targets.push(el);
    });
  });

  const settle = (el) => {
    el.classList.remove('in-wait');
    if (!el.classList.contains('reveal')) return;
    el.classList.add('is-in');
    const d = parseFloat(el.style.getPropertyValue('--d')) || 0;
    // Drop the reveal classes afterwards so each element's own transitions apply again.
    setTimeout(() => el.classList.remove('reveal', 'is-in'), 1200 + d * 90);
  };

  if (!reduceMotion && 'IntersectionObserver' in window) {
    targets.forEach((el) => el.classList.add('reveal', 'in-wait'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        settle(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  }

  /* --- Count-up numbers ---------------------------------------------------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const to = parseFloat(el.getAttribute('data-count'));
    if (reduceMotion || !isFinite(to)) { el.textContent = el.getAttribute('data-count'); return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        runCount(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* --- A soft light that follows the pointer across glass ------------------ */
  if (finePointer && !reduceMotion) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('.tile, .card, .scenario-card, .widget, .gtile');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* --- Hero: a text check-in lands on the team's list for today ----------- */
  const sms = $('[data-hero-sms]');
  if (sms) {
    const script = [
      ['in', 'Hi Maria, it’s your day 14 check-in. How is your knee pain right now, 0 to 10?'],
      ['out', 'About a 7'],
      ['in', 'That’s up from a 4 last week. Is it worse at rest or when you’re moving?'],
      ['out', 'Mostly at night, it keeps waking me up'],
      ['in', 'Thanks for telling me. Any swelling or warmth around the knee?'],
      ['out', 'A little swelling'],
      ['in', 'Got it. Dr. Reyes’s team will give you a call today.'],
    ];

    const note = $('[data-hero-note]');
    const faces = $('[data-hero-faces]');
    const checkins = $$('[data-hero-checkins]');

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
      checkins.forEach((el) => { el.textContent = '214'; if (animate) pop(el); });
    };

    const flagMaria = (animate) => {
      if (note) note.classList.add('is-on');
      $$('[data-hero-count]').forEach((el) => { el.textContent = '3'; if (animate) pop(el); });
      if (faces && !faces.querySelector('.av-1')) {
        const face = document.createElement('span');
        face.className = 'avatar av-1' + (animate ? ' pop' : '');
        face.textContent = 'MA';
        faces.prepend(face);
      }
    };

    const play = async () => {
      await sleep(1500);
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
      script.forEach(([dir, text]) => addMsg(dir, text));
      checkIn(false);
      flagMaria(false);
    } else {
      play();
    }
  }
})();
