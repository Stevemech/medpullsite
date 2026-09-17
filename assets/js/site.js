// MedPull site interactions (no dependencies)
(function () {
  'use strict';

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* --- Nav: solid background once the page scrolls, mobile menu toggle --- */
  const nav = $('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = $('[data-nav-toggle]', nav);
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    if (toggle) {
      toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
      nav.addEventListener('click', (e) => { if (e.target.closest('.nav-links a, .nav-cta a')) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }
  }

  /* --- Product tabs ------------------------------------------------------- */
  const tabs = $$('[role="tab"]');
  if (tabs.length) {
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
            m.style.animation = `bubbleIn .4s cubic-bezier(.2,.9,.3,1.2) ${i * 0.09}s both`;
          });
        }
      });
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
    const ring = $('[data-hero-ring]');
    const checkins = $('[data-hero-checkins]');
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const RING = 263.9; // circumference of the r=42 ring
    const TOTAL = 240;

    const addMsg = (dir, text) => {
      const el = document.createElement('div');
      el.className = 'sms-msg sms-' + dir;
      el.textContent = text;
      sms.appendChild(el);
      return el;
    };

    const setCheckins = (n) => {
      if (checkins) checkins.textContent = n;
      if (ring) ring.style.strokeDashoffset = (RING * (1 - n / TOTAL)).toFixed(1);
    };

    const pop = (el) => {
      if (!el) return;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
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
      await sleep(900);
      for (const [i, [dir, text]] of script.entries()) {
        if (dir === 'in') {
          const typing = addMsg('in', '');
          typing.classList.add('sms-typing');
          typing.innerHTML = '<i></i><i></i><i></i>';
          await sleep(900);
          typing.remove();
          addMsg('in', text);
          await sleep(1100);
        } else {
          addMsg('out', text);
          if (i === 1) { setCheckins(214); pop(checkins); }
          await sleep(750);
        }
      }
      await sleep(400);
      flagMaria(true);
    };

    if (reduceMotion) {
      script.forEach(([dir, text]) => addMsg(dir, text));
      setCheckins(214);
      flagMaria(false);
    } else {
      play();
    }
  }
})();
