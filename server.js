const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret';
const users = [];
const blogs = [];

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const publicUser = ({ id, name, email }) => ({ id, name, email });
const issueToken = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !email || password.length < 6) {
    return res.status(400).json({ message: 'Name, a valid email, and a password of at least 6 characters are required.' });
  }
  if (users.some((user) => user.email === email)) return res.status(409).json({ message: 'An account with that email already exists.' });
  const user = { id: String(users.length + 1), name, email, passwordHash: await bcrypt.hash(password, 12) };
  users.push(user);
  res.status(201).json({ user: publicUser(user), token: issueToken(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = users.find((candidate) => candidate.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ user: publicUser(user), token: issueToken(user) });
});

app.get('/api/blogs', (req, res) => res.json({ blogs }));

app.post('/api/blogs', authenticate, (req, res) => {
  const title = String(req.body.title || '').trim();
  const content = String(req.body.content || req.body.body || '').trim();
  const topic = String(req.body.topic || req.body.category || 'General').trim();
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });
  const blog = { id: String(blogs.length + 1), title, content, topic, author: req.user.email, createdAt: new Date().toISOString() };
  blogs.unshift(blog);
  res.status(201).json({ blog });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Ink & Insight server running at http://localhost:${PORT}`));
