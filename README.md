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

## Platform Super Admin API

The Platform Super Admin is independent of tenant users and organizations. The
API base path is:

```text
/api/v1/platform
```

Except for login and refresh, send the separate platform access token:

```http
Authorization: Bearer <platform_access_token>
```

Tenant tokens cannot access platform endpoints, and platform tokens are not
accepted by tenant middleware.

### Bootstrap the first Platform Super Admin

Add these values to `FlowPilot-BE/.env` before starting the backend:

```env
PLATFORM_ADMIN_EMAIL=owner@example.com
PLATFORM_ADMIN_PASSWORD=replace-with-a-strong-password
PLATFORM_ADMIN_NAME=Platform Owner
PLATFORM_JWT_ACCESS_SECRET=replace-with-a-separate-random-32-character-secret
PLATFORM_JWT_REFRESH_SECRET=replace-with-another-random-32-character-secret
```

The account is created only when the email does not already exist. Remove
`PLATFORM_ADMIN_PASSWORD` from the environment after the initial account has
been created. The console is available at
`http://localhost:3000/platform/login`.

Alternatively, the first owner can be created through the one-time registration
endpoint. Set a random secret of at least 32 characters:

```env
PLATFORM_SETUP_KEY=replace-with-a-random-secret-at-least-32-characters
```

Then call the endpoint with that value in the `X-Platform-Setup-Key` header.
Registration is automatically rejected after the first Platform Super Admin
exists. Remove `PLATFORM_SETUP_KEY` from the environment afterward to disable
the endpoint completely.

### Authentication endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | One-time setup key | Register the first Platform Super Admin |
| `POST` | `/auth/login` | Public, rate limited | Start a platform session |
| `POST` | `/auth/refresh` | Refresh token | Rotate platform session tokens |
| `GET` | `/auth/me` | Platform token | Get the current platform administrator |
| `POST` | `/auth/logout` | Platform token | Revoke the platform session |

One-time registration:

```http
POST /api/v1/platform/auth/register
Content-Type: application/json
X-Platform-Setup-Key: <PLATFORM_SETUP_KEY>
```

```json
{
  "name": "Platform Owner",
  "email": "owner@example.com",
  "password": "StrongPassword@123"
}
```

Login:

```json
{
  "email": "owner@example.com",
  "password": "your-strong-password"
}
```

Refresh:

```json
{
  "refreshToken": "<platform_refresh_token>"
}
```

### Dashboard, organizations and users

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/overview` | Get organization, user, subscription, payment and revenue statistics |
| `GET` | `/organizations` | List, search, filter and paginate organizations |
| `GET` | `/organizations/:id` | Get an organization with its users, subscription, payments and invoices |
| `PATCH` | `/organizations/:id/status` | Activate or suspend an organization |
| `DELETE` | `/organizations/:id` | Soft-delete an organization |
| `GET` | `/users` | List and search users across organizations |

Organization status:

```json
{
  "status": "suspended",
  "reason": "Payment is overdue"
}
```

Use `"active"` to reactivate the organization.

### Plan endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/plans` | List, search and filter plans |
| `POST` | `/plans` | Create a plan |
| `PATCH` | `/plans/:id` | Update pricing, trial, features or status |
| `DELETE` | `/plans/:id` | Delete a plan without active subscriptions |

Create plan:

```json
{
  "name": "Business",
  "code": "business",
  "description": "For growing organizations",
  "status": "active",
  "pricing": {
    "monthly": 2999,
    "yearly": 29990,
    "currency": "INR"
  },
  "trialDays": 14,
  "features": [
    {
      "key": "team_members",
      "label": "Team members",
      "enabled": true,
      "limit": 100
    }
  ]
}
```

### Subscription endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/subscriptions` | List and filter subscriptions |
| `PATCH` | `/subscriptions/:id/action` | Renew, extend, suspend, cancel or change a plan |

Examples:

```json
{
  "action": "renew",
  "days": 30
}
```

```json
{
  "action": "change_plan",
  "planId": "<plan_object_id>",
  "billingCycle": "yearly"
}
```

Supported actions are `renew`, `extend`, `suspend`, `cancel`, and
`change_plan`.

### Payment endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/payments` | List, search and filter payments |
| `PATCH` | `/payments/:id/decision` | Verify or reject a pending payment |

Verify:

```json
{
  "decision": "verified"
}
```

Reject:

```json
{
  "decision": "rejected",
  "reason": "The uploaded proof could not be verified"
}
```

### Invoice endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/invoices` | List, search and filter invoices |
| `PATCH` | `/invoices/:id/status` | Mark an invoice paid, unpaid or void |

```json
{
  "status": "paid"
}
```

### Reports, activity and settings

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/reports` | Get monthly verified revenue aggregates |
| `GET` | `/activity-logs` | Search and paginate platform audit events |
| `GET` | `/settings` | Get platform settings |
| `PUT` | `/settings` | Create or update a platform setting |

Update settings:

```json
{
  "key": "platform.general",
  "value": {
    "supportEmail": "support@example.com",
    "timezone": "Asia/Kolkata",
    "maintenanceMode": false
  }
}
```

### List query parameters

List endpoints accept these parameters where applicable:

| Parameter | Description |
| --- | --- |
| `page` | Page number beginning at `1` |
| `limit` | Page size from `1` to `100` |
| `search` | Case-insensitive search value |
| `status` | Resource status filter |
| `sort` | Sort field, such as `-createdAt` |

Successful responses follow:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error responses follow:

```json
{
  "success": false,
  "message": "Error description"
}
```
