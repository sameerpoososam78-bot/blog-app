# Ink & Insight

A full-stack blog platform with a responsive vanilla HTML/CSS frontend and an Express + MongoDB API.

## Features

- Secure registration and login with bcrypt password hashing and short-lived JWT authentication.
- Protected blog creation, editing, and deletion with author ownership checks.
- Private dashboard showing only the authenticated user's posts.
- Profile information and logout controls.
- Public blog browsing with responsive layouts and topic/search support.
- Health endpoint for deployment monitoring.

## Stack

- Frontend: semantic HTML, modern CSS, vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB/Mongoose
- Authentication: JSON Web Tokens and bcryptjs
- Deployment: Render (recommended), or any Node-compatible host

## Local development

1. Install Node.js 18 or newer.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` to a MongoDB connection string.
5. Set `JWT_SECRET` to a random value of at least 32 characters. Never commit `.env`.
6. Start the app with `npm start` or `npm run dev`.
7. Open `http://localhost:3000`.

## API

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Sign in and receive a JWT |
| GET | `/api/auth/me` | Bearer token | Return the current profile |
| GET | `/api/blogs` | No | List public blogs |
| GET | `/api/blogs/me` | Bearer token | List only the current user's blogs |
| POST | `/api/blogs` | Bearer token | Publish a blog |
| PUT | `/api/blogs/:id` | Bearer token | Edit an owned blog |
| DELETE | `/api/blogs/:id` | Bearer token | Delete an owned blog |
| GET | `/api/health` | No | Service/database health check |

## Deploying to Render

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository. Render will detect `render.yaml`.
3. Create a MongoDB database with MongoDB Atlas and add its connection string as `MONGODB_URI`.
4. Keep `JWT_SECRET` generated/secret, and deploy.
5. Verify `https://YOUR-RENDER-URL/api/health` returns `{ "status": "ok" }`.

For MongoDB Atlas, add the Render outbound IP policy required by your Atlas plan, or use the appropriate network access configuration. Do not put database credentials or JWT secrets in frontend code.

## Security notes

Passwords are stored only as bcrypt hashes. JWTs are validated server-side, and every update/delete operation verifies blog ownership. The browser stores the access token in local storage for this static frontend; for higher-security production deployments, consider an httpOnly secure cookie/session architecture.
