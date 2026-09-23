const API_BASE = window.API_BASE_URL || '';
const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};
const valueOf = (form, selectors) => {
  const field = selectors.map((selector) => form.querySelector(selector)).find(Boolean);
  return field ? field.value.trim() : '';
};
const showMessage = (form, message, error = false) => {
  let node = form.querySelector('.api-message');
  if (!node) { node = document.createElement('p'); node.className = 'api-message'; form.appendChild(node); }
  node.textContent = message;
  node.setAttribute('role', 'alert');
  node.style.color = error ? '#b42318' : '#227447';
};
const saveSession = (data) => { localStorage.setItem('ink_token', data.token); localStorage.setItem('ink_user', JSON.stringify(data.user)); };
const token = () => localStorage.getItem('ink_token');

async function bindAuthForms() {
  const form = document.querySelector('form');
  if (!form) return;
  const isRegister = /register/i.test(document.title) || /register/i.test(location.pathname);
  const isLogin = /login|sign in/i.test(document.title) || /login/i.test(location.pathname);
  if (!isRegister && !isLogin) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = { email: valueOf(form, ['[name="email"]', '#email', 'input[type="email"]']), password: valueOf(form, ['[name="password"]', '#password', 'input[type="password"]']) };
    if (isRegister) payload.name = valueOf(form, ['[name="name"]', '[name="username"]', '#name', '#username', 'input[type="text"]']);
    try {
      const data = await request(isRegister ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
      saveSession(data); showMessage(form, isRegister ? 'Account created. Redirecting…' : 'Signed in. Redirecting…');
      setTimeout(() => { location.href = 'dashboard.html'; }, 500);
    } catch (error) { showMessage(form, error.message, true); }
  });
}

async function bindBlogForm() {
  const form = document.querySelector('form');
  if (!form || !/create-blog|write a story/i.test(`${document.title} ${location.pathname}`)) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!token()) { showMessage(form, 'Please sign in before publishing.', true); return; }
    const payload = {
      title: valueOf(form, ['[name="title"]', '#title', 'input[type="text"]']),
      content: valueOf(form, ['[name="content"]', '[name="body"]', '#content', '#body', 'textarea']),
      topic: valueOf(form, ['[name="topic"]', '[name="category"]', '#topic', '#category', 'select']) || 'General'
    };
    try {
      await request('/api/blogs', { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: JSON.stringify(payload) });
      showMessage(form, 'Your story was published.');
      form.reset();
    } catch (error) { showMessage(form, error.message, true); }
  });
}

async function loadBlogs() {
  if (!/dashboard|index/i.test(location.pathname) && !document.querySelector('[data-blog-list]')) return;
  try {
    const { blogs } = await request('/api/blogs');
    const list = document.querySelector('[data-blog-list]');
    if (!list || !blogs.length) return;
    list.innerHTML = blogs.map((blog) => `<article class="blog-card"><small>${blog.topic}</small><h3>${escapeHtml(blog.title)}</h3><p>${escapeHtml(blog.content).slice(0, 180)}${blog.content.length > 180 ? '…' : ''}</p><small>By ${escapeHtml(blog.author)}</small></article>`).join('');
  } catch { /* The static frontend remains usable when the API is offline. */ }
}
const escapeHtml = (text) => { const node = document.createElement('div'); node.textContent = text; return node.innerHTML; };

document.addEventListener('DOMContentLoaded', () => { bindAuthForms(); bindBlogForm(); loadBlogs(); });
