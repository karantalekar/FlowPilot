# FlowPilot

## Run locally

The frontend expects the API at `http://localhost:5000/api/v1` by default.

Start the Docker API, MongoDB, and Redis first, then run the frontend:

```powershell
cd FlowPilot-BE
docker compose up -d --build
cd ..
npm.cmd run dev
```

This keeps the frontend on port `3000` and the API on port `5000` without
starting two competing backend processes. Use `npm.cmd run dev:backend` only
when Docker is stopped and you intentionally want to run the API locally.

Open `http://localhost:3000`. Registering creates an admin user and workspace. CRM, projects/tasks, team, analytics, billing, settings, and AI use the backend API.

Copy `.env.example` to `.env.local` to use another backend URL. Configure `GEMINI_API_KEY`, Razorpay keys/plan IDs, and SMTP in `FlowPilot-BE/.env` to enable those external providers. Without an AI key the backend returns its built-in fallback response; without Razorpay configuration checkout reports a clear configuration error.
