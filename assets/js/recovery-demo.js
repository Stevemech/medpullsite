// MedPull Recovery Copilot — interactive demo (no deps)
// Drives the patient check-in on the left and the provider views on the right.
// Mirrors the product: a fixed set of check-in questions, wearable context per
// patient, rule-based risk tiers, and a few headline care metrics.
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const log = $('#demoChatLog');
  if (!log) return;

  /* ---------------------------------------------------------------------
     Each reply carries the points it adds to the patient's risk and, when it
     matters, a note for the summary. `alert` marks answers that notify the
     care team right away (fever, drainage, redness, pain of 8 or more).
     --------------------------------------------------------------------- */
  const QUESTIONS = [
    (s) => ({
      q: 'Hi ' + s.first + ', quick recovery check-in from Riverside Ortho. Pain right now, 0 to 10?',
      replies: s.pain,
    }),
    () => ({
      q: 'Any swelling, redness, or drainage at the incision?',
      replies: [
        { label: 'Some swelling', risk: 1, note: 'New swelling reported' },
        { label: 'Drainage', risk: 3, alert: true, note: 'Incision drainage reported, care team alerted' },
        { label: 'None', risk: 0 },
      ],
    }),
    () => ({
      q: 'Any fever or chills?',
      replies: [
        { label: 'No', risk: 0 },
        { label: 'Yes', risk: 3, alert: true, note: 'Fever or chills reported, care team alerted' },
      ],
    }),
    () => ({
      q: 'How did you sleep last night?',
      replies: [
        { label: 'Pain woke me up', risk: 1, note: 'Sleep disrupted by pain' },
        { label: 'Okay', risk: 0 },
        { label: 'Well', risk: -1 },
      ],
    }),
    () => ({
      q: 'Did you do your exercises today?',
      replies: [
        { label: 'All of them', adherence: 92, risk: -1 },
        { label: 'Some', adherence: 64, risk: 1, note: 'Exercises only partly done' },
        { label: 'Not today', adherence: 38, risk: 2, note: 'Exercises skipped' },
      ],
    }),
  ];

  const SCENARIOS = {
    tka: {
      name: 'Maria Alvarez', first: 'Maria', initials: 'MA', av: 'av-1',
      procedure: 'Total knee replacement', pod: 14,
      signal: 'Resting HR rising vs baseline', signalRisk: 2, coverage: 86,
      pain: [
        { label: '7', pain: 7, risk: 2, note: 'Pain 7/10 in today’s check-in' },
        { label: '4', pain: 4, risk: 0 },
        { label: '2', pain: 2, risk: -1 },
      ],
    },
    acl: {
      name: 'James Whitfield', first: 'James', initials: 'JW', av: 'av-2',
      procedure: 'ACL reconstruction', pod: 21,
      signal: 'Device data on only 20% of recent days', signalRisk: 0, coverage: 20,
      pain: [
        { label: '3', pain: 3, risk: 0 },
        { label: '5', pain: 5, risk: 1, note: 'Pain 5/10, higher than last week' },
        { label: '8', pain: 8, risk: 3, alert: true, note: 'Pain 8/10, care team alerted' },
      ],
    },
    rcr: {
      name: 'Rachel Okafor', first: 'Rachel', initials: 'RO', av: 'av-3',
      procedure: 'Rotator cuff repair', pod: 9,
      signal: 'Behind expected recovery curve (−15%)', signalRisk: 2, coverage: 71,
      pain: [
        { label: '6', pain: 6, risk: 1, note: 'Pain 6/10' },
        { label: '3', pain: 3, risk: 0 },
        { label: '1', pain: 1, risk: -1 },
      ],
    },
  };

  let key = 'tka';
  let scenario = SCENARIOS[key];
  let step = 0;
  let answers = {};
  let notes = [];
  let risk = 0;
  let alerted = false;
  let busy = false;
  let timer = null;

  /* --- chat rendering ---------------------------------------------------- */

  function bubble(who, html) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-message ' + who;
    wrap.innerHTML =
      '<div class="chat-message-avatar">' + (who === 'ai' ? 'M' : scenario.initials) + '</div>' +
      '<div class="chat-message-bubble">' + html + '</div>';
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function askNext() {
    if (step >= QUESTIONS.length) return finish();

    const s = QUESTIONS[step](scenario);
    busy = true;
    renderReplies([]);
    const typing = bubble('ai', '<span class="typing"><i></i><i></i><i></i></span>');

    timer = setTimeout(() => {
      typing.querySelector('.chat-message-bubble').textContent = s.q;
      renderReplies(s.replies);
      busy = false;
      progress();
    }, 620);
  }

  function renderReplies(replies) {
    const host = $('#demoReplies');
    host.innerHTML = '';
    replies.forEach((r) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quick-reply';
      b.textContent = r.label;
      b.addEventListener('click', () => choose(r, b));
      host.appendChild(b);
    });
  }

  function choose(reply, btn) {
    if (busy) return;
    btn.classList.add('is-picked');
    renderReplies([]);
    bubble('user', reply.label);

    if (reply.pain !== undefined) answers.pain = reply.pain;
    if (reply.adherence !== undefined) answers.adherence = reply.adherence;
    risk += reply.risk || 0;
    if (reply.alert) alerted = true;
    if (reply.note) notes.push(reply.note);
    updateMetrics();

    step++;
    timer = setTimeout(askNext, 380);
  }

  function progress() {
    $('#chatProgress').textContent =
      step >= QUESTIONS.length ? 'Check-in complete' : 'Question ' + (step + 1) + ' of ' + QUESTIONS.length;
  }

  /* --- provider side ----------------------------------------------------- */

  // Same order of precedence as the product: red flags and high scores first,
  // then thin device data, then anything worth a look.
  function tierOf() {
    const total = risk + scenario.signalRisk;
    if (alerted || total >= 5) return { label: 'High risk', cls: 'pill-attention', chip: '1 high risk' };
    if (scenario.coverage < 40) return { label: 'Missing data', cls: 'pill-missing', chip: '1 missing data' };
    // A worrying device signal alone is enough for a review.
    if (total >= 2 || scenario.signalRisk >= 2) return { label: 'Needs review', cls: 'pill-watch', chip: '1 needs review' };
    return { label: 'On track', cls: 'pill-ontrack', chip: 'All on track' };
  }

  function summaryFor(tier) {
    const n = scenario.first;
    const found = notes.length ? notes.join('. ') + '.' : 'Nothing concerning in today’s check-in.';
    const signal = scenario.signal + '.';
    if (tier.label === 'High risk') {
      return '<b>' + n + ' needs a call today.</b> ' + found + ' Device data: ' + signal + ' Worth reaching out within 24 hours.';
    }
    if (tier.label === 'Missing data') {
      return '<b>Not enough device data to judge ' + n + '’s recovery.</b> ' + signal + ' ' + found + ' Ask ' + n + ' to reconnect their wearable.';
    }
    if (tier.label === 'Needs review') {
      return '<b>' + n + ' is progressing, with something to review.</b> ' + found + ' Device data: ' + signal + ' The next check-in should confirm the trend.';
    }
    return '<b>' + n + ' is recovering as expected.</b> ' + found + ' No action needed.';
  }

  const LEVEL_LABEL = { flag: 'Flag', watch: 'Watch', ok: 'OK', none: 'Needs data' };
  const LEVEL_CLASS = { flag: 'pill-attention', watch: 'pill-watch', ok: 'pill-ontrack', none: 'pill-missing' };

  function setMetric(prefix, value, text, level) {
    $('#' + prefix + 'Value').textContent = text;
    const bar = $('#' + prefix + 'Bar');
    bar.style.width = Math.max(0, Math.min(100, value)) + '%';
    bar.classList.toggle('is-flag', level === 'flag');
    bar.classList.toggle('is-watch', level === 'watch');
    const pill = $('#' + prefix + 'Pill');
    pill.className = 'pill ' + LEVEL_CLASS[level];
    pill.textContent = LEVEL_LABEL[level];
  }

  function updateMetrics() {
    // Symptom burden (0–10): 7 or more is a flag.
    const p = answers.pain;
    if (p === undefined) setMetric('mPain', 0, '–', 'none');
    else setMetric('mPain', p * 10, p + '/10', p >= 7 ? 'flag' : p >= 5 ? 'watch' : 'ok');

    // Verified adherence: under 50% is a flag, under 75% a watch.
    const a = answers.adherence;
    if (a === undefined) setMetric('mAdh', 0, '–', 'none');
    else setMetric('mAdh', a, a + '%', a < 50 ? 'flag' : a < 75 ? 'watch' : 'ok');

    // Data confidence: under 40% the patient can't be judged.
    const c = scenario.coverage;
    setMetric('mData', c, c + '%', c < 40 ? 'none' : c < 75 ? 'watch' : 'ok');
  }

  function finish() {
    const tier = tierOf();
    progress();

    const lead = notes.find((n) => /alerted/.test(n)) || notes[0] || scenario.signal;
    $('#wlReason').textContent = lead;
    $('#wlLast').textContent = 'Just now';
    const pill = $('#wlStatus');
    pill.className = 'pill ' + tier.cls;
    pill.textContent = tier.label;
    $('#worklistChip').textContent = tier.chip;
    $('#worklistRow').classList.toggle('is-flagged', tier.label === 'High risk');

    $('#summaryChip').textContent = 'Written by AI';
    $('#summaryText').classList.remove('text-muted');
    $('#summaryText').innerHTML = summaryFor(tier);

    const flags = $('#summaryFlags');
    flags.innerHTML = '';
    notes.concat(scenario.signal).forEach((note) => {
      const serious = /alerted/.test(note) || (tier.label === 'High risk' && note === lead);
      const row = document.createElement('div');
      row.className = 'rs-flag';
      row.innerHTML = '<span class="pill ' + (serious ? 'pill-attention' : 'pill-watch') + '">' +
        (serious ? 'Flag' : 'Watch') + '</span><span>' + note + '</span>';
      flags.appendChild(row);
    });
  }

  /* --- lifecycle --------------------------------------------------------- */

  function reset(newKey) {
    clearTimeout(timer);
    key = newKey || key;
    scenario = SCENARIOS[key];
    step = 0;
    answers = {};
    notes = [];
    risk = 0;
    alerted = false;
    busy = false;

    log.innerHTML = '';
    $('#demoReplies').innerHTML = '';
    $('#chatMeta').textContent = 'Day ' + scenario.pod + ' · ' + scenario.procedure;

    $('#wlName').textContent = scenario.name;
    const avatar = $('#wlAvatar');
    avatar.textContent = scenario.initials;
    avatar.className = 'avatar ' + scenario.av;
    $('#wlProc').textContent = scenario.procedure;
    $('#wlPod').textContent = scenario.pod;
    $('#wlReason').textContent = scenario.signal;
    $('#wlLast').textContent = 'Waiting';
    const pill = $('#wlStatus');
    pill.className = 'pill pill-neutral';
    pill.textContent = 'Check-in sent';
    $('#worklistChip').textContent = 'Awaiting check-in';
    $('#worklistRow').classList.remove('is-flagged');

    $('#summaryChip').textContent = 'Waiting';
    $('#summaryText').className = 'text-muted';
    $('#summaryText').textContent = 'The summary is written once the check-in is done. Answer the questions to see it.';
    $('#summaryFlags').innerHTML = '';

    updateMetrics();
    askNext();
  }

  $$('#scenarioPicker [data-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#scenarioPicker [data-scenario]').forEach((b) => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      reset(btn.getAttribute('data-scenario'));
    });
  });

  $('#demoReset').addEventListener('click', () => reset());

  reset('tka');
})();
