# CineScope

**Discover. Watch. Remember.**

A modern full-stack movie discovery platform with TMDB integration, user authentication, favorites, watch history, and admin dashboard.

## Tech Stack

| Layer    | Technologies                          |
| -------- | ------------------------------------- |
| Frontend | React (Vite), Redux Toolkit, React Router, TailwindCSS, shadcn/ui, Material UI, Framer Motion, Axios |
| Backend  | Node.js, Express.js, MongoDB, JWT     |
| API      | TMDB API, YouTube (trailers)          |

## Project Structure

```
cineScope/
├── client/          # React Vite frontend
├── server/          # Express backend
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- TMDB API key ([themoviedb.org](https://www.themoviedb.org/settings/api))

### Backend

```bash
cd server
npm install
cp .env.example .env   # Add MONGODB_URI, JWT_SECRET, TMDB_API_KEY
npm run dev
```

### Frontend

```bash
cd client
npm install
cp .env.example .env   # Add VITE_API_URL, VITE_TMDB_KEY
npm run dev
```

### Environment Variables

**server/.env**
- `PORT` – Server port (default 5000)
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – Secret for JWT signing
- `TMDB_API_KEY` – TMDB API key

**client/.env**
- `VITE_API_URL` – Backend base URL (e.g. http://localhost:5000)
- `VITE_TMDB_KEY` – TMDB API key (for poster/backdrop URLs if needed)

## Features

- **Movie Discovery** – Trending, Popular, Top Rated, Upcoming
- **Real-time Search** – Debounced search with dropdown results
- **Infinite Scroll** – Load more on scroll
- **Movie Details** – Poster, description, rating, genres, trailer
- **Trailer Modal** – YouTube trailer; fallback message if unavailable
- **Auth** – Sign up, Login, Logout (JWT, protected routes)
- **Favorites** – Add/remove, stored in MongoDB
- **Watch History** – Recent views and trailer plays
- **Admin Dashboard** – CRUD movies, manage users (ban/delete)
- **Recommended For You** – Based on favorite genres
- **Continue Watching** – Progress tracking
- **Advanced Filters** – Genre, rating, year, popularity
- **Command Palette** – Ctrl+K for quick actions

## Fonts

- **Headings** – Sansation
- **Body** – Saira

## Creating an Admin User

After signing up, promote a user to admin via MongoDB:

```js
db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } })
```

---

Built with clean architecture, glassmorphism UI, and production-ready patterns.
