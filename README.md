# Team Task Manager Web Application

A full-stack, enterprise-grade **Team Task Manager Web Application** designed for collaborative project planning, team administration, and task delivery. Built with a decoupled frontend and backend architecture, role-based access control, MongoDB Atlas database persistence, PostgreSQL-backed session storage, Passport.js authentication, and Google Cloud Run deployment readiness.

---

## 1. Technology Stack

### Frontend
- **Framework:** React.js (v19) & Vite
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router v7
- **HTTP Client:** Axios (configured with `withCredentials: true` for HTTP-only session cookies)
- **Form Management:** React Hook Form
- **Icons:** Lucide React
- **Notifications:** Built-in Toast notification system (success, error, warning, info)

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** Passport.js (`passport-local`)
- **Session Management:** `express-session` with `connect-pg-simple` (PostgreSQL) in production and `MemoryStore` in development
- **Password Security:** Salted password hashing via `bcryptjs` (10 rounds)
- **Input Validation:** Joi schema validation
- **HTTP Security:** Helmet headers
- **Rate Limiting:** `express-rate-limit` (strict limits on authentication endpoints)
- **CORS:** Configured with dynamic origins and credential support

---

## 2. Project Folder Structure

```
team-task-manager/
├── frontend/                     # Independent React Client Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/           # Modal, ConfirmDialog, Badge, LoadingSpinner, EmptyState
│   │   │   ├── layout/           # AppLayout, Sidebar, TopNavbar
│   │   │   ├── teams/            # TeamCard, CreateTeamModal, EditTeamModal, AddMemberModal
│   │   │   └── tasks/            # TaskCard, TaskTable, TaskKanban, CreateTaskModal, EditTaskModal, TaskDetailModal
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── hooks/                # useAuth, useToast
│   │   ├── pages/                # LoginPage, RegisterPage, DashboardPage, TeamsPage, TeamDetailPage, TasksPage, DocsPage, NotFoundPage
│   │   ├── routes/               # ProtectedRoute, AppRoutes
│   │   ├── services/             # api.js (Axios), authService, teamService, taskService
│   │   ├── utils/                # dateUtils, formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
│
├── backend/                      # Independent Express REST API Application
│   ├── config/                   # db.js (MongoDB Atlas), session.js (PostgreSQL/Memory), passport.js
│   ├── controllers/              # authController, teamController, taskController, userController
│   ├── middleware/               # auth.js, validate.js, errorHandler.js, rateLimiter.js
│   ├── models/                   # User.js, Team.js, Task.js (Mongoose)
│   ├── routes/                   # authRoutes, teamRoutes, taskRoutes, userRoutes
│   ├── services/                 # dataStore.js (Mongoose / Memory fallback)
│   ├── validators/               # Joi validation schemas
│   ├── utils/                    # responseHandler.js
│   ├── app.js                    # Express application factory
│   ├── server.js                 # Standalone backend server runner
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml            # Multi-container orchestration (MongoDB + Postgres + Backend + Frontend)
└── README.md
```

---

## 3. Database Design

### User Model (`User.js`)
| Field | Type | Description |
|---|---|---|
| `name` | String | User's full name (2–100 characters) |
| `email` | String | Unique, lowercased, indexed email address |
| `passwordHash` | String | Salted bcrypt hash (`select: false` to prevent accidental leakage) |
| `createdAt` / `updatedAt` | Date | Timestamps |

### Team Model (`Team.js`)
| Field | Type | Description |
|---|---|---|
| `name` | String | Team workspace name (2–100 characters) |
| `description` | String | Optional description (max 500 characters) |
| `owner` | ObjectId | Reference to `User` (team administrator) |
| `members` | [ObjectId] | Array of references to `User` |
| `createdAt` / `updatedAt` | Date | Timestamps |

### Task Model (`Task.js`)
| Field | Type | Description |
|---|---|---|
| `title` | String | Task title (1–200 characters) |
| `description` | String | Detailed task description |
| `team` | ObjectId | Reference to `Team` |
| `assignedTo` | ObjectId \| null | Reference to `User` (must belong to the team) |
| `createdBy` | ObjectId | Reference to `User` |
| `status` | String | Enum: `To Do`, `In Progress`, `Completed` |
| `priority` | String | Enum: `Low`, `Medium`, `High` |
| `dueDate` | Date \| null | Target completion date |
| `createdAt` / `updatedAt` | Date | Timestamps |

*Compound Index:* `{ team: 1, status: 1, priority: 1 }` for rapid multi-filter querying.

---

## 4. RESTful API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `confirmPassword`)
- `POST /api/auth/login` — Authenticate user and initiate session (`email`, `password`)
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/logout` — Terminate session and clear `ttm.sid` cookie

### Teams
- `GET /api/teams` — List all teams the current user belongs to or owns
- `POST /api/teams` — Create a new team (`name`, `description`)
- `GET /api/teams/:id` — Get team details, owner, and member roster
- `PUT /api/teams/:id` — Update team name and description (Owner only)
- `POST /api/teams/:id/members` — Add registered user to team by `userId` or `email` (Owner only)
- `DELETE /api/teams/:id/members/:userId` — Remove member (Owner or member leaving)
- `DELETE /api/teams/:id` — Delete team and cascade delete associated tasks (Owner only)

### Tasks
- `GET /api/tasks` — List tasks with query filtering (`?teamId=`, `?assigneeId=`, `?status=`, `?priority=`, `?search=`)
- `POST /api/tasks` — Create task (`title`, `description`, `team`, `assignedTo`, `status`, `priority`, `dueDate`)
- `GET /api/tasks/:id` — Get single task details
- `PUT /api/tasks/:id` — Update task fields
- `PATCH /api/tasks/:id/status` — Quick status transition (`status`: `To Do` \| `In Progress` \| `Completed`)
- `DELETE /api/tasks/:id` — Delete task (Owner or Creator only)

### Users & Dashboard
- `GET /api/users/search?q=` — Search registered user directory
- `GET /api/users/dashboard-stats` — Get aggregated metrics (total, pending, completed, overdue, breakdown)
- `GET /api/health` — Service health check

---

## 5. Local Development Setup

### Frontend & Backend Setup
Frontend and backend are independent projects. Run each in its own terminal window:

#### Terminal 1 (Backend):
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

For MongoDB Atlas, copy `backend/.env.example` to `backend/.env` and replace the
`MONGODB_URI` placeholder with the connection string from Atlas. The backend
loads `.env` from the `backend` directory; `.env.example` is only a template.
If `MONGODB_URI` is missing or the connection fails, the API starts with a
non-persistent in-memory store, and database changes will be lost when it stops.

#### Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 6. Docker & Docker Compose Setup

To launch the complete application stack along with local MongoDB and PostgreSQL instances:
```bash
docker-compose up --build
```
This spins up:
- **MongoDB:** `localhost:27017`
- **PostgreSQL:** `localhost:5432`
- **Backend API:** `http://localhost:5000`
- **Frontend Client:** `http://localhost:5173`

---

## 7. Google Cloud Platform Deployment Guide

### A. MongoDB Atlas
1. Create a project in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Provision an M0 free tier cluster.
3. In **Database Access**, create a user with read/write privileges.
4. In **Network Access**, add `0.0.0.0/0` (required for Google Cloud Run egress).
5. Copy the SRV connection URI:
   ```
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.abc.mongodb.net/team_task_manager?retryWrites=true&w=majority"
   ```

### B. PostgreSQL Session Store
1. Provision a managed PostgreSQL instance (e.g. Google Cloud SQL for PostgreSQL, Neon, or Supabase).
2. Obtain the connection string:
   ```
   DATABASE_URL="postgres://postgres:<password>@<host>:5432/<dbname>?sslmode=require"
   ```
3. `connect-pg-simple` automatically initializes the `user_sessions` table on boot.

### C. Deploy Backend to Google Cloud Run
```bash
gcloud run deploy team-task-manager-api \
  --source ./backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,SESSION_STORE=postgres,FRONTEND_URL=https://<your-frontend-domain> \
  --set-secrets MONGODB_URI=mongodb-uri:latest,DATABASE_URL=postgres-url:latest,SESSION_SECRET=session-secret:latest
```

### D. Deploy Frontend
1. Set the production backend URL in `frontend/.env.production`:
   ```
   VITE_API_URL=https://team-task-manager-api-xyz.run.app/api
   ```
2. Build and deploy frontend:
   ```bash
   gcloud run deploy team-task-manager-ui \
     --source ./frontend \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated
   ```

### E. Cookie & CORS Requirements for Production
- **HTTPS:** Both domains must use SSL certificates (`https://`).
- **SameSite Policy:** In cross-origin deployments (different domains), cookies must be `SameSite=none; Secure; HttpOnly`.
- **CORS Credentials:** `cors({ origin: 'https://<frontend>', credentials: true })`.

---

## 8. Git & GitHub Branching Workflow

```bash
# 1. Initialize main repository
git init
git checkout -b main
git add .
git commit -m "feat: initial commit of Team Task Manager structure"

# 2. Authentication feature branch
git checkout -b feature/authentication
# [make changes]
git add backend/config/passport.js backend/controllers/authController.js frontend/src/pages/LoginPage.jsx
git commit -m "feat(auth): implement Passport.js local strategy and session cookies"
git push -u origin feature/authentication

# 3. Team Management feature branch
git checkout -b feature/team-management
# [make changes]
git add backend/controllers/teamController.js frontend/src/pages/TeamsPage.jsx
git commit -m "feat(teams): implement team CRUD and role authorization"
git push -u origin feature/team-management

# 4. Task Management feature branch
git checkout -b feature/task-management
# [make changes]
git add backend/controllers/taskController.js frontend/src/pages/TasksPage.jsx
git commit -m "feat(tasks): implement task CRUD, filters, and Kanban board"
git push -u origin feature/task-management

# 5. Open Pull Request on GitHub
gh pr create --base main --head feature/authentication --title "Feature: Authentication"
```

---

## 9. Verification & Testing Checklist

- [x] **Registration:** New user registration with name, email, password, confirmPassword validation.
- [x] **Duplicate Rejection:** Registering an existing email returns 409 Conflict.
- [x] **Login:** Authenticates with Passport, sets HttpOnly session cookie, regenerates session.
- [x] **Authentication Protection:** Protected routes return 401 Unauthorized for unauthenticated requests.
- [x] **Logout:** Destroys session in session store and clears `ttm.sid` cookie.
- [x] **Team Creation:** User creates a team and is automatically assigned as owner.
- [x] **Team Authorization:** Only the team owner can edit name/description or delete the team.
- [x] **Team Member Management:** Owner can invite existing users by email or ID; members can leave.
- [x] **Task Creation:** Tasks require a valid team; assignees must belong to the selected team.
- [x] **Task Status Update:** Quick status transition between To Do, In Progress, and Completed.
- [x] **Task Filtering:** Filter by team, assignee, status, priority, and text search.
- [x] **Overdue Calculation:** Flags tasks whose deadlines have elapsed.
- [x] **Security Headers:** Helmet enabled with CSP and cross-origin protections.
- [x] **Rate Limiting:** Protects `/api/auth` endpoints from brute-force attempts.
- [x] **Session Persistence:** Page reload restores authentication state seamlessly.
