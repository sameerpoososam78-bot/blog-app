const API_BASE = window.API_BASE_URL || '';
const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};
const valueOf = (form, selectors) => { const field = selectors.map((s) => form.querySelector(s)).find(Boolean); return field ? field.value.trim() : ''; };
const escapeHtml = (text = '') => { const node = document.createElement('div'); node.textContent = text; return node.innerHTML; };
const showMessage = (form, message, error = false) => { let node = form.querySelector('.api-message'); if (!node) { node = document.createElement('p'); node.className = 'api-message'; form.appendChild(node); } node.textContent = message; node.setAttribute('role', 'alert'); node.style.color = error ? '#b42318' : '#227447'; };
const saveSession = (data) => { localStorage.setItem('ink_token', data.token); localStorage.setItem('ink_user', JSON.stringify(data.user)); };
const token = () => localStorage.getItem('ink_token');

async function bindAuthForms() {
  const form = document.querySelector('form'); if (!form) return;
  const isRegister = /register/i.test(`${document.title} ${location.pathname}`); const isLogin = /login|sign in/i.test(`${document.title} ${location.pathname}`);
  if (!isRegister && !isLogin) return;
  form.addEventListener('submit', async (event) => { event.preventDefault(); const payload = { email: valueOf(form, ['[name="email"]', '#email', 'input[type="email"]']), password: valueOf(form, ['[name="password"]', '#password', 'input[type="password"]']) }; if (isRegister) payload.name = valueOf(form, ['[name="name"]', '[name="username"]', '#name', '#username', 'input[type="text"]']); try { const data = await request(isRegister ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }); saveSession(data); showMessage(form, 'Success. Redirecting…'); setTimeout(() => { location.href = 'dashboard.html'; }, 500); } catch (error) { showMessage(form, error.message, true); } });
}

async function bindBlogForm() {
  const form = document.querySelector('form'); if (!form || !/create-blog|write a story/i.test(`${document.title} ${location.pathname}`)) return;
  form.addEventListener('submit', async (event) => { event.preventDefault(); if (!token()) { showMessage(form, 'Please sign in before publishing.', true); return; } const payload = { title: valueOf(form, ['[name="title"]', '#title', 'input[type="text"]']), content: valueOf(form, ['[name="content"]', '[name="body"]', '#content', '#body', 'textarea']), topic: valueOf(form, ['[name="topic"]', '[name="category"]', '#topic', '#category', 'select']) || 'General' }; try { await request('/api/blogs', { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: JSON.stringify(payload) }); showMessage(form, 'Your story was published.'); form.reset(); } catch (error) { showMessage(form, error.message, true); } });
}

const blogCard = (blog) => `<article class="blog-card"><small>${escapeHtml(blog.topic)}</small><h3><a href="blog.html?id=${encodeURIComponent(blog.id)}">${escapeHtml(blog.title)}</a></h3><p>${escapeHtml(blog.content).slice(0, 180)}${blog.content.length > 180 ? '…' : ''}</p><span>${escapeHtml(blog.authorName || blog.author || '')}</span></article>`;
async function loadBlogs() { const list = document.querySelector('[data-blog-list]'); if (!list) return; try { const { blogs } = await request('/api/blogs'); list.innerHTML = blogs.length ? blogs.map(blogCard).join('') : '<p>No stories yet. Be the first to publish one.</p>'; } catch (error) { list.innerHTML = `<p class="api-message">${escapeHtml(error.message)}</p>`; } }
async function loadBlogDetails() { const container = document.querySelector('[data-blog-detail]'); if (!container) return; const id = new URLSearchParams(location.search).get('id'); if (!id) { container.innerHTML = '<p>That story could not be found.</p>'; return; } try { const { blog } = await request(`/api/blogs/${encodeURIComponent(id)}`); container.innerHTML = `<p class="eyebrow">${escapeHtml(blog.topic)}</p><h1>${escapeHtml(blog.title)}</h1><p class="blog-meta">By ${escapeHtml(blog.authorName || blog.author || 'Ink & Insight author')} · ${new Date(blog.createdAt).toLocaleDateString()}</p><div class="blog-content">${escapeHtml(blog.content).replace(/\n/g, '<br>')}</div>`; } catch (error) { container.innerHTML = `<p>${escapeHtml(error.message)}</p>`; } }
document.addEventListener('DOMContentLoaded', () => { bindAuthForms(); bindBlogForm(); loadBlogs(); loadBlogDetails(); });
