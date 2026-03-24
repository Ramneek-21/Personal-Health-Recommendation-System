# PulsePilot Personal Health Recommendation System

PulsePilot is a full-stack personal health recommendation platform built with React, Tailwind CSS, FastAPI, PostgreSQL, and a rule-based AI engine. It captures baseline health data and daily wellness logs, generates personalized recommendations across exercise, nutrition, sleep, and lifestyle, and surfaces trends, streaks, reminders, and weekly risk signals in a single dashboard.

## Stack
- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy, JWT authentication
- Database: PostgreSQL
- AI layer: hybrid rule-based scoring and recommendation engine
- Deployment: Docker and Docker Compose ready

## Repository Layout
```text
.
├── backend/                  # FastAPI app, models, schemas, services, routes
├── frontend/                 # React SPA with dashboard, charts, auth, reminders
├── docs/system-design.md     # Step-by-step product and architecture specification
└── docker-compose.yml        # Local full-stack runtime
```

## Key Capabilities
- JWT-based signup and login
- Health profile onboarding with BMI auto-calculation
- Daily logging for weight, sleep, water, activity, stress, and steps
- Personalized exercise, diet, sleep, and lifestyle recommendations
- Weekly health score and risk-level classification
- Dashboard with charts, checklist, and notifications
- Habit streak tracking and reminder management

## Local Development

### Backend
1. Create a virtual environment in `backend/`.
2. Install dependencies from [backend/requirements.txt](/Users/Hrishikesh/Documents/New%20project/backend/requirements.txt).
3. Copy [backend/.env.example](/Users/Hrishikesh/Documents/New%20project/backend/.env.example) to `backend/.env` if you need custom secrets or database settings.
4. Start the API:

```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend
1. Install dependencies from [frontend/package.json](/Users/Hrishikesh/Documents/New%20project/frontend/package.json).
2. Copy [frontend/.env.example](/Users/Hrishikesh/Documents/New%20project/frontend/.env.example) to `frontend/.env` if you want a custom API base URL.
3. Start the SPA:

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose
Run the full stack with PostgreSQL, FastAPI, and the production-built frontend:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`

## Netlify Deployment

The repo is now configured for Netlify frontend deploys with [netlify.toml](/Users/Hrishikesh/Documents/New%20project/netlify.toml), [frontend/public/_redirects](/Users/Hrishikesh/Documents/New%20project/frontend/public/_redirects), and a Netlify Function proxy at [api.mjs](/Users/Hrishikesh/Documents/New%20project/frontend/netlify/functions/api.mjs). This handles both:
- React Router client-side routes like `/auth`, `/progress`, and `/notifications`
- Same-origin API calls from the frontend to `/api/v1/*`

Use these settings in Netlify:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

Important: Netlify only hosts the frontend. You still need your FastAPI backend deployed separately.

Recommended Netlify environment variable:
- `BACKEND_ORIGIN=https://your-backend-domain.com`

The frontend will call `/api/v1/*` on the Netlify site, and the Netlify Function proxy will forward those requests to `BACKEND_ORIGIN/api/v1/*`.

Optional:
- `VITE_API_BASE_URL=https://your-backend-domain.com/api/v1`

If `VITE_API_BASE_URL` is set, the frontend will call the backend directly. If it is not set, production deploys use the Netlify proxy automatically.

## API Surface
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/profile`
- `PUT /api/v1/profile`
- `POST /api/v1/logs`
- `GET /api/v1/logs`
- `GET /api/v1/logs/weekly`
- `POST /api/v1/recommendations/generate`
- `GET /api/v1/recommendations/latest`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/habits`
- `POST /api/v1/habits/check`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/reminders`

## Recommendation Engine
The AI layer is implemented in [backend/app/services/recommendation_engine.py](/Users/Hrishikesh/Documents/New%20project/backend/app/services/recommendation_engine.py). It combines:
- BMI and body-composition heuristics
- Activity and sedentary risk
- Sleep and stress recovery signals
- Hydration behavior
- Habit streak consistency

These factors roll up into a 0-100 weekly health score and generate domain-specific coaching plans that are persisted for longitudinal tracking.

## Security and Production Notes
- Passwords are hashed with bcrypt via Passlib.
- Access is protected with signed JWT bearer tokens.
- CORS is configurable with environment variables.
- The backend recomputes BMI and health score server-side.
- Dockerized services are stateless except for PostgreSQL storage.

## Design and Architecture
The complete requested step-by-step system design is documented in [docs/system-design.md](/Users/Hrishikesh/Documents/New%20project/docs/system-design.md).
