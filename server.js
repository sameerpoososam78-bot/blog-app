const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error('MONGODB_URI is required. Add it to your .env file.');
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters long.');

mongoose.set('strictQuery', true);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true, trim: true, maxlength: 100000 },
  topic: { type: String, default: 'General', trim: true, maxlength: 60 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const publicUser = (user) => ({ id: String(user._id), name: user.name, email: user.email });
const issueToken = (user) => jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
const publicBlog = (blog) => ({
  id: String(blog._id), title: blog.title, content: blog.content, topic: blog.topic,
  author: blog.author?.email || blog.author?.name || 'Ink & Insight author',
  authorName: blog.author?.name || '',
  authorId: blog.author?._id ? String(blog.author._id) : blog.author ? String(blog.author) : '',
  createdAt: blog.createdAt, updatedAt: blog.updatedAt
});

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const suppliedToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!suppliedToken) return res.status(401).json({ message: 'Authentication required.' });
  try {
    req.user = jwt.verify(suppliedToken, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function escapeRegex(text = '') { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function getFilteredBlogs(req, author) {
  const search = String(req.query.search || '').trim();
  const topic = String(req.query.topic || '').trim();
  const filter = author ? { author } : {};
  if (search) filter.$or = [
    { title: { $regex: escapeRegex(search), $options: 'i' } },
    { content: { $regex: escapeRegex(search), $options: 'i' } },
    { topic: { $regex: escapeRegex(search), $options: 'i' } }
  ];
  if (topic && topic !== 'all') filter.topic = { $regex: `^${escapeRegex(topic)}$`, $options: 'i' };
  return Blog.find(filter).populate('author', 'name email').sort({ createdAt: -1 }).lean();
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return res.status(400).json({ message: 'Name, a valid email, and a password of at least 6 characters are required.' });
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ user: publicUser(user), token: issueToken(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ user: publicUser(user), token: issueToken(user) });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/blogs', async (req, res, next) => {
  try { res.json({ blogs: (await getFilteredBlogs(req)).map(publicBlog) }); } catch (error) { next(error); }
});

app.get('/api/blogs/me', authenticate, async (req, res, next) => {
  try { res.json({ blogs: (await getFilteredBlogs(req, req.user.id)).map(publicBlog) }); } catch (error) { next(error); }
});

app.get('/api/blogs/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid blog id.' });
    const blog = await Blog.findById(req.params.id).populate('author', 'name email').lean();
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    res.json({ blog: publicBlog(blog) });
  } catch (error) { next(error); }
});

app.post('/api/blogs', authenticate, async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || req.body.body || '').trim();
    const topic = String(req.body.topic || req.body.category || 'General').trim();
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });
    const blog = await Blog.create({ title, content, topic, author: req.user.id });
    res.status(201).json({ blog: publicBlog(await blog.populate('author', 'name email')) });
  } catch (error) { next(error); }
});

app.put('/api/blogs/:id', authenticate, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid blog id.' });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: 'You can only edit your own blog.' });
    blog.title = String(req.body.title || blog.title).trim();
    blog.content = String(req.body.content || req.body.body || blog.content).trim();
    blog.topic = String(req.body.topic || req.body.category || blog.topic).trim();
    if (!blog.title || !blog.content) return res.status(400).json({ message: 'Title and content are required.' });
    await blog.save();
    res.json({ blog: publicBlog(await Blog.findById(blog._id).populate('author', 'name email')) });
  } catch (error) { next(error); }
});

app.delete('/api/blogs/:id', authenticate, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid blog id.' });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: 'You can only delete your own blog.' });
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully.', id: req.params.id });
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'An account with that email already exists.' });
  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`Ink & Insight server running at http://localhost:${PORT}`));
}).catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
