# Personal Health Recommendation System

## Step 1 -> Product Design

### Product vision
Build a personal health companion that converts raw biometric and lifestyle data into practical weekly guidance. The product targets users who want one place to understand current health risk, receive realistic daily actions, and track whether habits are improving.

### Primary users
- Busy professionals with inconsistent routines
- Fitness beginners who need structured guidance
- Users managing weight, sleep, or stress goals
- Health-conscious users who want a simple quantified wellness score

### Core user journeys
1. A new user signs up, completes onboarding, and receives a baseline health score with risks and recommendations.
2. A returning user logs daily weight, sleep, water, activity, and stress to see trends and maintain streaks.
3. A user reviews weekly insights to understand progress, setbacks, and next best actions.

### Product modules
- Authentication and profile
- Baseline health assessment
- Daily health logging
- Recommendation engine
- Analytics dashboard
- Reminder center
- Progress and streak tracking

### UX principles
- Show the most important action first
- Translate numbers into plain-language recommendations
- Keep logging friction low
- Separate risk warnings from wellness coaching
- Make trend visibility immediate through charts and summary cards

## Step 2 -> Architecture

### System architecture diagram (textual)
```text
[React + Tailwind + Recharts SPA]
        |
        | HTTPS / JSON
        v
[FastAPI REST API]
        |
        |-- Auth Service (JWT, password hashing)
        |-- Profile Service
        |-- Health Metrics Service
        |-- Recommendation Engine
        |-- Insights / Streak Service
        |-- Notification Service
        |
        v
[PostgreSQL]
        |
        v
[Persisted users, profiles, logs, recommendations, reminders]
```

### Request lifecycle
1. User authenticates and receives access token.
2. Frontend stores token in app state and attaches it to API calls.
3. Health inputs and daily logs are persisted in PostgreSQL.
4. Recommendation engine computes health score, risk flags, and action plans.
5. Dashboard loads aggregate metrics, charts, and checklist state.

### High-level folder structure
```text
/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── main.(ts|tsx|jsx)
│   ├── Dockerfile
│   └── package.json
├── docs/
│   └── system-design.md
└── docker-compose.yml
```

### Backend architecture
- FastAPI for REST endpoints and OpenAPI documentation
- SQLAlchemy ORM for relational modeling and PostgreSQL compatibility
- Pydantic request/response schemas for API contracts
- Service layer isolates recommendation logic from HTTP handlers
- JWT auth with short-lived access tokens

### Frontend architecture
- React SPA with route-based pages
- Tailwind CSS design tokens for a consistent visual system
- Recharts for trend visualization
- Centralized API client with auth token injection
- Domain-first state: auth, dashboard, progress, reminders

### Security best practices
- Password hashing with `bcrypt`
- JWT access tokens with expiry
- Input validation on every request
- CORS limited to configured frontend origins
- Secrets from environment variables only
- Role for future RBAC extension
- Server-side recomputation of health score to avoid trusting client values

### Scalability considerations
- Stateless API instances behind a load balancer
- Separate recommendation service if model complexity grows
- Read-optimized analytics endpoints
- Redis-backed background reminders in a future phase
- Table indexes on `user_id`, `logged_at`, and recommendation timestamps
- Dockerized services for container orchestration readiness

### Future improvements
- Wearable integrations
- LLM-based coaching summaries
- Clinician review workflow
- More advanced risk prediction models
- Push notifications and calendar sync
- Social accountability and community challenges

## Step 3 -> DB Schema

### Core entities

#### `users`
- `id` UUID / integer primary key
- `email` unique
- `password_hash`
- `full_name`
- `created_at`
- `updated_at`

#### `health_profiles`
- `id`
- `user_id` FK -> `users`
- `age`
- `gender`
- `height_cm`
- `weight_kg`
- `bmi`
- `medical_conditions` JSON/text
- `diet_type`
- `activity_level`
- `sleep_hours`
- `water_intake_liters`
- `stress_level`
- `goal`
- `updated_at`

#### `daily_logs`
- `id`
- `user_id`
- `logged_at`
- `weight_kg`
- `sleep_hours`
- `water_intake_liters`
- `activity_minutes`
- `stress_level`
- `steps`
- `notes`

#### `recommendations`
- `id`
- `user_id`
- `week_start`
- `health_score`
- `risk_level`
- `exercise_plan`
- `diet_suggestions`
- `sleep_guidance`
- `lifestyle_guidance`
- `risk_warnings`
- `daily_checklist`
- `created_at`

#### `habit_checks`
- `id`
- `user_id`
- `date`
- `habit_key`
- `completed`

#### `notifications`
- `id`
- `user_id`
- `title`
- `message`
- `type`
- `scheduled_for`
- `is_read`
- `created_at`

### Relationship summary
- One user has one active health profile
- One user has many daily logs
- One user has many recommendations over time
- One user has many notifications
- One user has many habit check states

## Step 4 -> Backend Code

### API surface

#### Auth
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

#### Profile
- `GET /api/v1/profile`
- `PUT /api/v1/profile`

#### Health and logs
- `POST /api/v1/logs`
- `GET /api/v1/logs`
- `GET /api/v1/logs/weekly`

#### Recommendations
- `POST /api/v1/recommendations/generate`
- `GET /api/v1/recommendations/latest`

#### Dashboard
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends`

#### Habits and notifications
- `GET /api/v1/habits`
- `POST /api/v1/habits/check`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/reminders`

### Backend design rationale
- Keep controllers thin and move health scoring into services.
- Persist generated recommendations to make weekly comparisons possible.
- Expose aggregate endpoints for the dashboard so the frontend does not need to orchestrate many client-side joins.

## Step 5 -> Frontend Code

### UI page flow
1. Landing / auth page
2. Onboarding profile form
3. Main dashboard
4. Progress tracker
5. Recommendations center
6. Notifications / reminders

### Key UI components
- Auth form
- Health profile multi-section form
- Health score gauge
- Recommendation cards
- Trend charts
- Daily checklist
- Habit streak cards
- Weekly insight banner

### Frontend design rationale
- Dashboard prioritizes current score, risk, and next actions above charts.
- Data entry is separated into onboarding and lightweight daily logging.
- Visual hierarchy emphasizes “what should I do today” rather than only historical analytics.

## Step 6 -> AI Engine

### Recommendation algorithm design
Use a hybrid rule-based expert engine with weighted scoring:
- Compute BMI, hydration, sleep quality, activity adequacy, and stress penalty
- Combine weighted dimensions into a weekly health score out of 100
- Trigger risk warnings from thresholds and medical condition combinations
- Map user goal plus risk state to exercise, diet, sleep, and lifestyle advice templates

### Example scoring weights
- BMI and weight trend: 25%
- Activity level and activity minutes: 25%
- Sleep quality: 20%
- Hydration: 10%
- Stress: 10%
- Goal alignment and consistency streak: 10%

### Risk heuristics
- High BMI + sedentary activity -> obesity and cardiometabolic warning
- Poor sleep + high stress -> recovery and burnout warning
- Family of metabolic conditions + elevated BMI -> diabetes risk reminder
- Low water intake + high activity -> dehydration risk

### Why hybrid logic
- Deterministic health guidance is easier to validate in an early product.
- Rules are transparent, auditable, and safe for non-diagnostic wellness recommendations.
- The architecture leaves room to replace scoring modules with `scikit-learn` classifiers later.

## Step 7 -> Integration

### Integration design
- Frontend stores access token after login and calls protected API routes.
- Backend recomputes BMI and health score whenever profile or logs change.
- Dashboard endpoints return consolidated chart data and latest recommendation snapshot.
- Reminder records are shown in the UI notification center and can later feed background jobs.

### Data flow
1. Signup -> token issued
2. Profile saved -> baseline recommendation generated
3. Daily log submitted -> weekly metrics recalculated
4. Dashboard fetch -> score, charts, recommendations, checklist, notifications

## Step 8 -> Deployment Guide

### Container strategy
- `backend` service runs FastAPI with Uvicorn
- `frontend` service serves the React production build
- `db` service runs PostgreSQL with persistent volume

### Deployment steps
1. Create environment files for backend and frontend.
2. Start local stack with `docker compose up --build`.
3. Run database migrations or table creation on startup.
4. Deploy backend and frontend as separate containers in cloud environments.
5. Use managed PostgreSQL in production and inject secrets via platform settings.

### Operational checklist
- Enable HTTPS at the ingress layer
- Rotate JWT secret and database credentials
- Set strict CORS origins
- Enable request logging and error monitoring
- Back up PostgreSQL data and verify restore procedures
