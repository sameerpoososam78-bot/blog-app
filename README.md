# Ink & Insight

A responsive blog application with a vanilla HTML/CSS frontend and a Node.js/Express REST API.

## Student QR Generator

The Student ID QR application is available here:

- [Open Student QR Generator](student-qr.html)
- [View Student QR Generator source](student-qr.html)

It includes student registration, QR-code generation, WhatsApp sharing, QR verification, clipboard copying, and Google Sheets submission.

## Run locally

1. Install Node.js 18 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
4. Start the server: `npm start` (or `npm run dev`)
5. Open http://localhost:3000.

The Express server serves the existing frontend and exposes:

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/blogs` — list published blogs
- `POST /api/blogs` — create a blog with a Bearer token; `{ title, content, topic }`
- `GET /api/health` — health check

Users and blogs are stored in memory for this starter implementation, so they reset when the server restarts. Replace the arrays in `server.js` with a database for production.
