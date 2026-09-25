const API_BASE = window.API_BASE_URL || '';

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};
const valueOf = (form, selectors) => { const field = selectors.map((selector) => form.querySelector(selector)).find(Boolean); return field ? field.value.trim() : ''; };
const escapeHtml = (text = '') => { const node = document.createElement('div'); node.textContent = text; return node.innerHTML; };
const showMessage = (form, message, error = false) => { let node = form.querySelector('.api-message'); if (!node) { node = document.createElement('p'); node.className = 'api-message'; form.appendChild(node); } node.textContent = message; node.style.color = error ? '#b91c1c' : '#166534'; };
const saveSession = (data) => { localStorage.setItem('ink_token', data.token); localStorage.setItem('ink_user', JSON.stringify(data.user)); };
const clearSession = () => { localStorage.removeItem('ink_token'); localStorage.removeItem('ink_user'); };
const token = () => localStorage.getItem('ink_token');
const currentUser = () => { try { return JSON.parse(localStorage.getItem('ink_user') || 'null'); } catch { return null; } };

const updateAuthUI = () => {
  const user = currentUser();
  document.querySelectorAll('[data-auth-required]').forEach((node) => { node.style.display = user ? 'inline-flex' : 'none'; });
  document.querySelectorAll('[data-auth-guest]').forEach((node) => { node.style.display = user ? 'none' : 'inline-flex'; });
  const label = document.querySelector('[data-user-label]'); if (label) label.textContent = user ? `Hi, ${user.name}` : 'Guest';
  const name = document.querySelector('[data-profile-name]'); if (name) name.textContent = user?.name || 'Guest';
  const email = document.querySelector('[data-profile-email]'); if (email) email.textContent = user?.email || '';
};

async function bindAuthForms() {
  const form = document.querySelector('form'); if (!form) return;
  const pathText = `${document.title} ${location.pathname}`; const isRegister = /register/i.test(pathText); const isLogin = /login|sign in/i.test(pathText); if (!isRegister && !isLogin) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = { name: valueOf(form, ['[name="name"]', '#name', 'input[name="username"]']), email: valueOf(form, ['[name="email"]', '#email', 'input[type="email"]']), password: valueOf(form, ['[name="password"]', '#password', 'input[type="password"]']) };
    try { const data = await request(isRegister ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }); saveSession(data); window.location.href = 'dashboard.html'; } catch (error) { showMessage(form, error.message, true); }
  });
}

const blogCard = (blog) => {
  const user = currentUser(); const canManage = user && String(user.id) === String(blog.authorId || '');
  return `<article class="blog-card"><small>${escapeHtml(blog.topic || 'General')}</small><h3><a href="blog.html?id=${encodeURIComponent(blog.id)}">${escapeHtml(blog.title)}</a></h3><p>${escapeHtml((blog.content || '').slice(0, 180))}${(blog.content || '').length > 180 ? '...' : ''}</p><div class="meta-row"><span>By ${escapeHtml(blog.authorName || blog.author || 'Ink & Insight')}</span><span>${new Date(blog.createdAt).toLocaleDateString()}</span></div>${canManage ? `<div class="action-row"><button type="button" class="btn btn-small" data-edit-blog="${escapeHtml(blog.id)}">Edit</button><button type="button" class="btn btn-small btn-danger" data-delete-blog="${escapeHtml(blog.id)}">Delete</button></div>` : ''}</article>`;
};

async function loadBlogs(endpoint = '/api/blogs') {
  const list = document.querySelector('[data-blog-list]'); if (!list) return;
  try { const { blogs } = await request(endpoint); list.innerHTML = blogs.length ? blogs.map(blogCard).join('') : '<p class="empty-state">No blogs found.</p>'; bindBlogActionButtons(); } catch (error) { list.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`; }
}

async function loadDashboard() {
  if (!/dashboard\.html$/i.test(location.pathname)) return;
  if (!token() || !currentUser()) { window.location.replace('login.html'); return; }
  try {
    const me = await request('/api/auth/me', { headers: { Authorization: `Bearer ${token()}` } });
    saveSession({ token: token(), user: me.user }); updateAuthUI(); await loadBlogs('/api/blogs/me');
  } catch (error) { clearSession(); window.location.replace(`login.html?redirect=${encodeURIComponent('dashboard.html')}`); }
}

function bindBlogActionButtons() {
  document.querySelectorAll('[data-delete-blog]').forEach((button) => { button.onclick = async () => { if (!window.confirm('Delete this blog?')) return; try { await request(`/api/blogs/${button.dataset.deleteBlog}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } }); await loadDashboard(); await loadBlogs(); } catch (error) { alert(error.message); } }; });
  document.querySelectorAll('[data-edit-blog]').forEach((button) => { button.onclick = () => { window.location.href = `create-blog.html?id=${encodeURIComponent(button.dataset.editBlog)}`; }; });
}

function bindLogout() { document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => { clearSession(); window.location.replace('index.html'); })); }
function bindPageActions() { bindLogout(); document.querySelector('[data-start-writing]')?.addEventListener('click', () => { window.location.href = token() ? 'create-blog.html' : 'login.html'; }); }

document.addEventListener('DOMContentLoaded', () => { bindAuthForms(); bindPageActions(); loadBlogs(); loadDashboard(); updateAuthUI(); });
window.addEventListener('storage', updateAuthUI);
