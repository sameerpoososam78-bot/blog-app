const API_BASE = window.API_BASE_URL || '';

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
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

const escapeHtml = (text = '') => {
  const node = document.createElement('div');
  node.textContent = text;
  return node.innerHTML;
};

const showMessage = (form, message, error = false) => {
  let node = form.querySelector('.api-message');
  if (!node) {
    node = document.createElement('p');
    node.className = 'api-message';
    form.appendChild(node);
  }

  node.textContent = message;
  node.style.color = error ? '#b91c1c' : '#166534';
};

const saveSession = (data) => {
  localStorage.setItem('ink_token', data.token);
  localStorage.setItem('ink_user', JSON.stringify(data.user));
};

const clearSession = () => {
  localStorage.removeItem('ink_token');
  localStorage.removeItem('ink_user');
};

const token = () => localStorage.getItem('ink_token');
const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('ink_user') || 'null');
  } catch {
    return null;
  }
};

const updateAuthUI = () => {
  const user = currentUser();
  document.querySelectorAll('[data-auth-required]').forEach((node) => {
    node.style.display = user ? 'inline-flex' : 'none';
  });

  document.querySelectorAll('[data-auth-guest]').forEach((node) => {
    node.style.display = user ? 'none' : 'inline-flex';
  });

  const userlabel = document.querySelector('[data-user-label]');
  if (userlabel) userlabel.textContent = user ? `Hi, ${user.name}` : 'Guest';
};

async function bindAuthForms() {
  const form = document.querySelector('form');
  if (!form) return;

  const pathText = `${document.title} ${location.pathname}`;
  const isRegister = /register/i.test(pathText);
  const isLogin = /login|sign in/i.test(pathText);
  if (!isRegister && !isLogin) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: valueOf(form, ['[name="name"]', '#name', 'input[name="username"]']),
      email: valueOf(form, ['[name="email"]', '#email', 'input[type="email"]']),
      password: valueOf(form, ['[name="password"]', '#password', 'input[type="password"]'])
    };

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      saveSession(data);
      updateAuthUI();
      showMessage(form, isRegister ? 'Account created successfully!' : 'Logged in successfully.');
      window.location.href = 'dashboard.html';
    } catch (error) {
      showMessage(form, error.message, true);
    }
  });
}

const blogCard = (blog) => {
  const user = currentUser();
  const canManage = user && String(user.id) === String(blog.authorId || '');

  return `
    <article class="blog-card">
      <small>${escapeHtml(blog.topic || 'General')}</small>
      <h3><a href="blog.html?id=${encodeURIComponent(blog.id)}">${escapeHtml(blog.title)}</a></h3>
      <p>${escapeHtml((blog.content || '').slice(0, 180))}${(blog.content || '').length > 180 ? '...' : ''}</p>
      <div class="meta-row">
        <span>By ${escapeHtml(blog.authorName || blog.author || 'Ink & Insight')}</span>
        <span>${new Date(blog.createdAt).toLocaleDateString()}</span>
      </div>
      ${canManage ? `
        <div class="action-row">
          <button type="button" class="btn btn-small" data-edit-blog="${escapeHtml(blog.id)}">Edit</button>
          <button type="button" class="btn btn-small btn-danger" data-delete-blog="${escapeHtml(blog.id)}">Delete</button>
        </div>
      ` : ''}
    </article>
  `;
};

function ensureBlogFilters() {
  const pageRoot = document.querySelector('main') || document.body;
  const hasFilter = document.querySelector('#blog-search-form');
  if (hasFilter) return;

  const wrapper = document.createElement('section');
  wrapper.className = 'container search-panel';
  wrapper.innerHTML = `
    <form id="blog-search-form" class="search-bar">
      <input type="search" id="blog-search" name="search" placeholder="Search blogs..." />
      <select id="blog-topic-filter" name="topic">
        <option value="all">All categories</option>
        <option value="General">General</option>
        <option value="Technology">Technology</option>
        <option value="Travel">Travel</option>
        <option value="Lifestyle">Lifestyle</option>
        <option value="Business">Business</option>
        <option value="Design">Design</option>
      </select>
      <button type="submit" class="btn">Search</button>
    </form>
  `;
  pageRoot.prepend(wrapper);

  const form = wrapper.querySelector('#blog-search-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await loadBlogs();
  });
}

async function loadBlogs() {
  const list = document.querySelector('[data-blog-list]');
  if (!list) return;

  const searchInput = document.querySelector('#blog-search');
  const topicInput = document.querySelector('#blog-topic-filter');
  const params = new URLSearchParams();

  if (searchInput && searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (topicInput && topicInput.value && topicInput.value !== 'all') params.set('topic', topicInput.value);

  try {
    const { blogs } = await request(`/api/blogs${params.toString() ? `?${params.toString()}` : ''}`);
    list.innerHTML = blogs.length ? blogs.map(blogCard).join('') : '<p class="empty-state">No blogs found for your search.</p>';
    bindBlogActionButtons();
  } catch (error) {
    list.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`;
  }
}

async function bindBlogForm() {
  const form = document.querySelector('form');
  if (!form || !/create-blog|write a story/i.test(`${document.title} ${location.pathname}`)) return;

  const blogIdInput = form.querySelector('[name="blogId"]') || form.querySelector('#blog-id') || form.querySelector('[name="id"]');
  const blogTitle = form.querySelector('[name="title"]') || form.querySelector('#title');
  const blogContent = form.querySelector('[name="content"]') || form.querySelector('#content') || form.querySelector('textarea');
  const blogTopic = form.querySelector('[name="topic"]') || form.querySelector('#topic') || form.querySelector('select[name="topic"]');

  if (!blogTitle || !blogContent) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id') || blogIdInput?.value || '';

  if (id) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Update story';

    try {
      const { blog } = await request(`/api/blogs/${id}`);
      if (blogTitle) blogTitle.value = blog.title || '';
      if (blogContent) blogContent.value = blog.content || '';
      if (blogTopic) blogTopic.value = blog.topic || 'General';
      if (blogIdInput) blogIdInput.value = blog.id;
      form.dataset.blogId = blog.id;
    } catch (error) {
      showMessage(form, error.message, true);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!token()) {
      showMessage(form, 'Please sign in before publishing.', true);
      return;
    }

    const payload = {
      title: valueOf(form, ['[name="title"]', '#title']),
      content: valueOf(form, ['[name="content"]', '#content', 'textarea']),
      topic: valueOf(form, ['[name="topic"]', '#topic', 'select[name="topic"]']) || 'General'
    };

    const blogId = form.dataset.blogId || params.get('id') || blogIdInput?.value || '';

    try {
      const endpoint = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
      const method = blogId ? 'PUT' : 'POST';
      const response = await request(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload)
      });

      showMessage(form, blogId ? 'Blog updated successfully!' : 'Blog published successfully!');
      const createdBlog = response.blog || response;
      window.location.href = `blog.html?id=${encodeURIComponent(createdBlog.id || blogId)}`;
    } catch (error) {
      showMessage(form, error.message, true);
    }
  });
}

async function loadBlogDetails() {
  const container = document.querySelector('[data-blog-detail]');
  if (!container) return;

  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    container.innerHTML = '<p class="empty-state">No blog selected.</p>';
    return;
  }

  try {
    const { blog } = await request(`/api/blogs/${id}`);
    const user = currentUser();
    const canManage = user && String(user.id) === String(blog.authorId || '');

    container.innerHTML = `
      <article class="story-detail">
        <div class="story-header">
          <span class="tag">${escapeHtml(blog.topic || 'General')}</span>
          <h1>${escapeHtml(blog.title)}</h1>
          <p>By ${escapeHtml(blog.authorName || blog.author || 'Ink & Insight')} • ${new Date(blog.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="story-body">${escapeHtml(blog.content || '')}</div>
        ${canManage ? `
          <div class="action-row">
            <a class="btn" href="create-blog.html?id=${encodeURIComponent(blog.id)}">Edit</a>
            <button type="button" class="btn btn-danger" data-delete-blog="${escapeHtml(blog.id)}">Delete</button>
          </div>
        ` : ''}
      </article>
    `;

    bindBlogActionButtons();
  } catch (error) {
    container.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`;
  }
}

function bindBlogActionButtons() {
  document.querySelectorAll('[data-delete-blog]').forEach((button) => {
    button.onclick = async () => {
      const blogId = button.getAttribute('data-delete-blog');
      if (!blogId) return;

      if (!token()) {
        alert('Please sign in to delete a blog.');
        return;
      }

      if (!window.confirm('Delete this blog?')) return;

      try {
        await request(`/api/blogs/${blogId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token()}` }
        });

        if (location.pathname.endsWith('blog.html')) {
          window.location.href = 'dashboard.html';
          return;
        }

        await loadBlogs();
      } catch (error) {
        alert(error.message);
      }
    };
  });

  document.querySelectorAll('[data-edit-blog]').forEach((button) => {
    button.onclick = () => {
      const blogId = button.getAttribute('data-edit-blog');
      window.location.href = `create-blog.html?id=${encodeURIComponent(blogId)}`;
    };
  });
}

function bindLogout() {
  const logoutButton = document.querySelector('[data-logout]');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', () => {
    clearSession();
    updateAuthUI();
    window.location.href = 'index.html';
  });
}

function bindPageActions() {
  const navLogin = document.querySelector('[data-auth-guest]');
  const navDashboard = document.querySelector('[data-auth-required]');
  if (navLogin || navDashboard) updateAuthUI();
  bindLogout();

  const heroButton = document.querySelector('[data-start-writing]');
  if (heroButton) {
    heroButton.addEventListener('click', () => {
      window.location.href = token() ? 'create-blog.html' : 'login.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindAuthForms();
  bindBlogForm();
  bindPageActions();
  ensureBlogFilters();
  loadBlogs();
  loadBlogDetails();
  updateAuthUI();
});

window.addEventListener('storage', updateAuthUI);

