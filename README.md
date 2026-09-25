# Ink & Insight

A responsive blog application with a vanilla HTML/CSS frontend and an Express REST API backed by MongoDB.

## Run locally

1. Install Node.js 18 or newer.
2. Create a MongoDB Atlas cluster and database user. Add your current IP address to the Atlas network access list.
3. Install dependencies: `npm install`.
4. Copy `.env.example` to `.env` and set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters. Never commit `.env`.
5. Start the server: `npm start` (or `npm run dev`).
6. Open http://localhost:3000.

## API

- `POST /api/auth/register` — creates a bcrypt-hashed user credential and returns a JWT.
- `POST /api/auth/login` — verifies credentials and returns a JWT.
- `GET /api/blogs` — retrieves all blogs, newest first.
- `GET /api/blogs/:id` — retrieves one blog for the detail page.
- `POST /api/blogs` — creates a blog with a Bearer token; `{ title, content, topic }`.
- `GET /api/health` — health check and MongoDB connection status.

Passwords are only stored as bcrypt hashes, are excluded from query results by default, and are never sent to the browser.
