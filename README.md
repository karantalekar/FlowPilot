# FlowPilot

## Run locally

The frontend resolves the API from the hostname you use in the browser and
expects the backend on port `5000`.

Start MongoDB locally, then run the backend and frontend in separate terminals:

```powershell
cd D:\FlowPilot-BE
npm.cmd run dev
```

```powershell
cd D:\FlowPilot-FE
npm.cmd run dev
```

Redis and Docker are not required for local development. Keep
`REDIS_ENABLED=false` in `D:\FlowPilot-BE\.env`.

Open `http://localhost:3000`. Registering creates an admin user and workspace. CRM, projects/tasks, team, analytics, billing, settings, and AI use the backend API.

Copy `.env.example` to `.env.local` to use another backend URL. Configure `GEMINI_API_KEY`, Razorpay keys/plan IDs, and SMTP in `FlowPilot-BE/.env` to enable those external providers. Without an AI key the backend returns its built-in fallback response; without Razorpay configuration checkout reports a clear configuration error.

## Deploy frontend

Deploy the backend first and expose it over HTTPS. Then set this frontend
environment variable on your hosting provider:

```powershell
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1
```

For Vercel, import this repository, keep the default Next.js settings, add the
environment variable above, and deploy. For Docker or Node hosting, this app is
configured with `output: 'standalone'`; build with `npm run build` and start the
generated server with `node .next/standalone/server.js`.
