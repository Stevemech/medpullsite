/* MedPull early-access interest popup — uses the native <dialog> element.
   Submissions go through assets/js/forms.js (load it before this file).
   Styles live in assets/css/site.css under "Early-access dialog". */
(function () {
  'use strict';

  // How long before the gentle timed prompt appears (ms). Exit-intent can fire sooner.
  var SHOW_DELAY_MS = 30000;
  var STORAGE_KEY = 'medpull-interest-popup-seen';

  function alreadySeen() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  // --- Markup -----------------------------------------------------------------------
  var dialog = document.createElement('dialog');
  dialog.className = 'ea-dialog';
  dialog.setAttribute('aria-labelledby', 'eaTitle');
  dialog.innerHTML = [
    '<button type="button" class="ea-close" data-ea-close aria-label="Close">',
    '  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m2.5 2.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    '</button>',
    '<div class="ea-head">',
    '  <span class="app-icon app-icon-lg" aria-hidden="true"><img src="assets/img/medpull-mark.png" alt="" /></span>',
    '  <h2 class="ea-title" id="eaTitle">Bring the Recovery Copilot to your practice</h2>',
    '  <p class="ea-sub">Tell us where to reach you and we\'ll set up a free walkthrough for your team. Early partners get priority onboarding and pilot pricing.</p>',
    '  <ul class="ea-perks">',
    '    <li>Free pilot access</li>',
    '    <li>Priority onboarding</li>',
    '    <li>RTM setup support</li>',
    '    <li>No commitment</li>',
    '  </ul>',
    '</div>',
    '<div class="ea-body">',
    '  <form id="interestForm" novalidate>',
    '    <input type="checkbox" name="botcheck" class="form-honey" tabindex="-1" autocomplete="off" aria-hidden="true" />',
    '    <div class="form-grid">',
    '      <div class="field-full">',
    '        <label for="ip_clinic" class="form-label">Practice name</label>',
    '        <input type="text" class="form-control" id="ip_clinic" name="clinic_name" autocomplete="organization" required />',
    '      </div>',
    '      <div>',
    '        <label for="ip_contact" class="form-label">Your name</label>',
    '        <input type="text" class="form-control" id="ip_contact" name="contact_name" autocomplete="name" required />',
    '      </div>',
    '      <div>',
    '        <label for="ip_email" class="form-label">Work email</label>',
    '        <input type="email" class="form-control" id="ip_email" name="email" autocomplete="email" required />',
    '      </div>',
    '      <div class="field-full">',
    '        <label for="ip_phone" class="form-label">Phone <span class="opt">(optional)</span></label>',
    '        <input type="tel" class="form-control" id="ip_phone" name="phone" autocomplete="tel" />',
    '      </div>',
    '      <div class="field-full">',
    '        <label for="ip_comments" class="form-label">Anything we should know? <span class="opt">(optional)</span></label>',
    '        <textarea class="form-control" id="ip_comments" name="comments" rows="2"></textarea>',
    '      </div>',
    '      <label class="form-check field-full">',
    '        <input type="checkbox" id="ip_tcpa" name="tcpa_consent" required />',
    '        <span>By checking this box, I agree to receive calls and text messages from MedPull at the phone number provided, including via automated technology. Consent is not a condition of purchase. Message and data rates may apply.</span>',
    '      </label>',
    '      <div class="field-full form-feedback" id="interestFeedback" role="status"></div>',
    '      <div class="field-full">',
    '        <button type="submit" class="btn btn-lg btn-primary btn-block">Request early access</button>',
    '      </div>',
    '    </div>',
    '  </form>',
    '  <p class="ea-fine">No spam. We\'ll only use this to reach out about MedPull.</p>',
    '</div>'
  ].join('');
  document.body.appendChild(dialog);

  var form = dialog.querySelector('#interestForm');
  var feedback = dialog.querySelector('#interestFeedback');

  function openModal() {
    if (dialog.open) return;
    markSeen();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function closeModal() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  // Expose a global so any button/link can open it.
  window.openInterestModal = openModal;

  // Any element with data-interest-open opens the popup.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-interest-open]');
    if (trigger) { e.preventDefault(); openModal(); }
  });
  dialog.addEventListener('click', function (e) {
    if (e.target.closest('[data-ea-close]')) { closeModal(); return; }
    // A click on the backdrop (outside the dialog box) closes it.
    if (e.target === dialog) {
      var r = dialog.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeModal();
    }
  });

  // --- Gentle auto-trigger (once per visitor) ---------------------------------------
  // Pages opt out with <body data-interest-auto="off">.
  var autoEnabled = (document.body.getAttribute('data-interest-auto') !== 'off') && !alreadySeen();

  if (autoEnabled) {
    var fired = false;
    var autoFire = function () {
      if (fired || alreadySeen()) return;
      fired = true;
      openModal();
    };
    var timer = setTimeout(autoFire, SHOW_DELAY_MS);
    // Exit-intent: pointer leaves the top of the viewport (desktop only).
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) { clearTimeout(timer); autoFire(); }
    });
  }

  // --- Submission -------------------------------------------------------------------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    feedback.textContent = '';
    feedback.className = 'field-full form-feedback';

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      feedback.textContent = 'Fill in the highlighted fields to continue.';
      feedback.classList.add('is-error');
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (!window.MEDPULL_FORMS) {
      feedback.textContent = 'This form didn\'t finish loading. Refresh the page and try again.';
      feedback.classList.add('is-error');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    window.MEDPULL_FORMS.submit({
      subject: 'New MedPull early-access interest',
      clinic_name: form.clinic_name.value.trim(),
      contact_name: form.contact_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || '(not provided)',
      comments: form.comments.value.trim() || '(none)',
      tcpa_consent: form.tcpa_consent.checked ? 'Yes, consented to calls/texts' : 'No'
    }, form.botcheck.checked)
      .then(function () {
        dialog.querySelector('.ea-body').innerHTML = [
          '<div class="done-state" role="status">',
          '  <div class="done-icon"><svg width="24" height="24" viewBox="0 0 22 22" fill="none"><path d="m5.5 11.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
          '  <h3 class="done-title">You\'re on the list</h3>',
          '  <p class="done-sub">Thanks for your interest. We\'ll reach out shortly to set up your walkthrough.</p>',
          '  <button type="button" class="btn btn-primary" data-ea-close>Done</button>',
          '</div>'
        ].join('');
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = originalLabel;
        feedback.textContent = 'Your request didn\'t go through. ' + err.message;
        feedback.classList.add('is-error');
      });
  });
})();
