(() => {
  const styles = document.createElement('style');
  styles.textContent = `.agent-launcher{position:fixed;right:24px;bottom:24px;z-index:12;background:#e11d48;color:#fff;border:0;border-radius:50%;width:58px;height:58px;box-shadow:0 8px 24px #4c051955;font:700 10px Manrope,sans-serif;cursor:pointer}.agent-panel{position:fixed;right:24px;bottom:94px;z-index:12;width:min(365px,calc(100vw - 32px));background:#fdfbf7;border:1px solid #e6dfd3;box-shadow:0 18px 50px #1c191733;display:none;flex-direction:column}.agent-panel.open{display:flex}.agent-head{background:#4c0519;color:#fff;padding:18px 20px;display:flex;justify-content:space-between;align-items:start}.agent-head strong{display:block;font:500 21px 'Playfair Display',serif}.agent-head small{font:9px 'DM Mono',monospace;color:#e8bfc6;text-transform:uppercase}.agent-close{background:none;color:#fff;font-size:24px}.agent-messages{height:280px;overflow:auto;padding:16px}.agent-msg{font-size:11px;line-height:1.55;padding:10px 12px;margin-bottom:9px;max-width:88%;background:#f7f3e9;color:#4c0519}.agent-msg.user{margin-left:auto;background:#e11d48;color:#fff}.agent-form{display:flex;border-top:1px solid #e6dfd3;padding:10px}.agent-form input{border:0;background:transparent;flex:1;padding:9px;font:11px Manrope;outline:none}.agent-form button{background:#4c0519;color:#fff;padding:0 13px;font-size:16px}`;
  document.head.appendChild(styles);
  const panel = document.createElement('section');
  panel.className = 'agent-panel';
  panel.setAttribute('aria-label', 'Rose Bakery concierge');
  panel.innerHTML = '<div class="agent-head"><div><small>Rose Bakery concierge</small><strong>How can I help?</strong></div><button class="agent-close" aria-label="Close concierge">×</button></div><div class="agent-messages"><div class="agent-msg">Hi, I’m Rose. Ask me about today’s bakes or your custom cake.</div></div><form class="agent-form"><input aria-label="Message Rose" placeholder="Ask about the menu..." maxlength="4000" required /><button aria-label="Send message">↗</button></form>';
  const launcher = document.createElement('button');
  launcher.className = 'agent-launcher';
  launcher.type = 'button';
  launcher.textContent = 'Ask Rose';
  launcher.setAttribute('aria-label', 'Open Rose Bakery concierge');
  document.body.append(launcher, panel);
  const messages = panel.querySelector('.agent-messages');
  const form = panel.querySelector('.agent-form');
  const input = form.querySelector('input');
  const history = [];
  launcher.addEventListener('click', () => { panel.classList.toggle('open'); if (panel.classList.contains('open')) input.focus(); });
  panel.querySelector('.agent-close').addEventListener('click', () => panel.classList.remove('open'));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content) return;
    history.push({ role: 'user', content });
    messages.insertAdjacentHTML('beforeend', `<div class="agent-msg user"></div>`);
    messages.lastElementChild.textContent = content;
    input.value = '';
    const pending = document.createElement('div');
    pending.className = 'agent-msg';
    pending.textContent = 'One moment...';
    messages.appendChild(pending);
    messages.scrollTop = messages.scrollHeight;
    try {
      const response = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      pending.textContent = data.text;
      history.push({ role: 'assistant', content: data.text });
    } catch (error) {
      pending.textContent = error.message || 'Please try again in a moment.';
    }
    messages.scrollTop = messages.scrollHeight;
  });
})();