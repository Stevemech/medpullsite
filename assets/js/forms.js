/* MedPull form submission — shared by the early-access popup and the waitlist page.

   SETUP — read this:
   1. Go to https://web3forms.com and type the email you want submissions sent to.
   2. Copy the "Access Key" they give you (free, no account needed).
   3. Paste it between the quotes below, replacing YOUR-WEB3FORMS-ACCESS-KEY.
   Until you add a key, forms run in DEMO MODE: they log to the console and
   still show the success message, so you can test the look and feel. */
(function () {
  'use strict';

  var WEB3FORMS_ACCESS_KEY = 'ee3a6bc7-8a3e-491e-9d17-b3bf412b4cd9';
  var ENDPOINT = 'https://api.web3forms.com/submit';

  var hasKey = WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY.indexOf('YOUR-') !== 0;

  // Resolves on success. Rejects with an Error whose message is safe to show.
  // `honeypot` is the value of the hidden anti-spam field: when a bot fills it we
  // skip the request and pretend it worked, and a real visitor never sends it.
  function submit(fields, honeypot) {
    if (honeypot) return Promise.resolve();

    if (!hasKey) {
      console.log('[MedPull forms] DEMO MODE — submission captured locally:', fields);
      return new Promise(function (resolve) { setTimeout(resolve, 600); });
    }

    var body = { access_key: WEB3FORMS_ACCESS_KEY, from_name: 'MedPull website' };
    Object.keys(fields).forEach(function (k) { body[k] = fields[k]; });

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    }).then(
      function (res) {
        return res.json().catch(function () { return null; }).then(function (json) {
          if (json && json.success) return;
          var reason = (json && json.message) || ('The form service responded with status ' + res.status + '.');
          console.error('[MedPull forms] Submission rejected:', res.status, json);
          throw new Error(reason);
        });
      },
      function (err) {
        console.error('[MedPull forms] Network error:', err);
        throw new Error('We couldn\'t reach the form service. Check your connection, or pause any content blocker for this site, then try again.');
      }
    );
  }

  window.MEDPULL_FORMS = { submit: submit };
})();
