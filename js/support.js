(() => {
  'use strict';

  const BOT_TOKEN = '8766711229:AAFzZNhRl1Eqksw_RXXMqHFS1wwk73UvAa0';
  const CHAT_ID = '225250527';
  const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const form = document.getElementById('supportForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value;
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      showStatus('Please fill in all fields.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const text = [
      `📩 *New Support Message*`,
      ``,
      `*From:* ${escapeMarkdown(name)}`,
      `*Email:* ${escapeMarkdown(email)}`,
      `*Subject:* ${escapeMarkdown(subject)}`,
      ``,
      escapeMarkdown(message),
    ].join('\n');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) {
        showStatus('Message sent! We\'ll get back to you soon.', 'success');
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.description || 'Failed to send');
      }
    } catch (err) {
      showStatus('Something went wrong. Please try again or email us directly.', 'error');
      console.error('Telegram API error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });

  function showStatus(msg, type) {
    status.textContent = msg;
    status.className = `form-status ${type}`;
  }

  function escapeMarkdown(str) {
    return str.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }
})();
