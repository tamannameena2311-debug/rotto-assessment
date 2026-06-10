# Rotto Garage

Car service booking app built with Node.js, Express, MongoDB, Next.js, and TypeScript.

## Features

- Customer registration and login with JWT auth
- Customer car CRUD
- Customer booking creation and history
- Admin booking listing and status updates
- Admin stats endpoint at `GET /api/admin/stats`

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Fill `backend/.env` with:

```bash
PORT=5000
FRONTEND_URL=http://localhost:3000
ROTTO_MONGO_URI=<your MongoDB Atlas URI>
ROTTO_JWT_SECRET=<a long random secret>
NODE_ENV=development
```

The backend runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `frontend/.env.local` to:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

The frontend runs at `http://localhost:3000`.

## Deployment

Backend can be deployed to Railway or Render. Set the same backend environment variables used locally, replacing `FRONTEND_URL` with the deployed Vercel URL.

Frontend can be deployed to Vercel. Set:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.example.com/api
```

## Live Demo

Add the Vercel URL here after deployment.

## Notes

- Do not commit `.env` or `.env.local`.
- `DEBUG_LOG.md` documents the fixed bugs and the hard feature implementation.
