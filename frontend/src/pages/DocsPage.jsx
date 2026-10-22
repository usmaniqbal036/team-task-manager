import React, { useState } from 'react';
import {
  Database,
  Cloud,
  GitBranch,
  ShieldCheck,
  CheckCircle,
  Terminal,
  Layers,
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';

export const DocsPage = () => {
  const [activeTab, setActiveTab] = useState('architecture');
  const toast = useToast();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', label);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System Architecture & Assessment Documentation
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Comprehensive university assessment reference covering the MERN + PostgreSQL architecture,
          MongoDB Atlas models, session security, Google Cloud Run deployment, and Git branch
          workflows.
        </p>

        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'deployment'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            GCP Cloud Run Deployment
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'git'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Git & GitHub Workflow
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'testing'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Testing Checklist
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            API Specifications
          </button>
        </div>
      </div>

      {activeTab === 'architecture' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Full-Stack Architecture & Data Separation</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The project is architected into two decoupled applications residing in a single
              repository: a Vite React client and an Express Node.js REST API with MongoDB Atlas
              application data persistence and PostgreSQL-backed session management.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 mb-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>MongoDB Atlas (Application Data)</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>User Model:</strong> name, unique lowercase email, salted bcrypt
                    passwordHash, timestamps.
                  </li>
                  <li>
                    <strong>Team Model:</strong> name, description, owner ref, members array refs,
                    timestamps.
                  </li>
                  <li>
                    <strong>Task Model:</strong> title, description, team ref, assignedTo ref,
                    createdBy ref, status, priority, dueDate, timestamps.
                  </li>
                  <li>
                    <strong>Validation & Indexes:</strong> Compound indexing on (team, status,
                    priority) for fast dashboard aggregation.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 mb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>PostgreSQL (Production Session Store)</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>connect-pg-simple:</strong> Persists authenticated user sessions across
                    stateless Cloud Run container replicas.
                  </li>
                  <li>
                    <strong>Session Regeneration:</strong> Prevents session fixation attacks on
                    login and register.
                  </li>
                  <li>
                    <strong>Cookie Security:</strong> HttpOnly, secure in production,
                    SameSite=lax/none with credential headers.
                  </li>
                  <li>
                    <strong>Strict Environment Check:</strong> Production disallows silent memory
                    fallback without DATABASE_URL.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Repository File Hierarchy</h4>
            <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto leading-relaxed">
              {`team-task-manager/
├── frontend/                     # React Vite Single Page App
│   ├── src/
│   │   ├── components/           # Common, Layout, Teams, and Tasks
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── pages/                # Login, Register, Dashboard, Teams, Tasks
│   │   ├── services/             # Axios API client, authService, teamService, taskService
│   │   ├── App.jsx & main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── backend/                      # Express REST API
│   ├── config/                   # db.js (MongoDB), session.js (PostgreSQL/Memory), passport.js
│   ├── controllers/              # authController, teamController, taskController, userController
│   ├── middleware/               # requireAuth, requireTeamAccess, validate, rateLimiter, errorHandler
│   ├── models/                   # User.js, Team.js, Task.js
│   ├── routes/                   # authRoutes, teamRoutes, taskRoutes, userRoutes
│   ├── validators/               # Joi request validation schemas
│   ├── app.js & server.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'deployment' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <span>Google Cloud Run & Database Deployment Guide</span>
          </h3>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Step 1: MongoDB Atlas Cluster Provisioning
              </h4>
              <p className="text-slate-600 mb-2">
                Create a free M0 cluster on MongoDB Atlas, configure a dedicated database user, and
                set IP Access List (0.0.0.0/0 for Cloud Run egress).
              </p>
              <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px]">
                MONGODB_URI="mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.abcde.mongodb.net/team_task_manager?retryWrites=true&w=majority"
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Step 2: Managed PostgreSQL Session Store
              </h4>
              <p className="text-slate-600 mb-2">
                Provision a PostgreSQL instance (e.g. Cloud SQL, Neon, or Supabase).
                `connect-pg-simple` automatically provisions the `user_sessions` table on boot.
              </p>
              <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px]">
                DATABASE_URL="postgres://postgres:&lt;password&gt;@ep-rapid-pool.us-east-2.aws.neon.tech/neondb?sslmode=require"
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Step 3: Deploy Backend to Google Cloud Run
              </h4>
              <p className="text-slate-600 mb-2">
                Use Google Cloud SDK to build and deploy the container image with environment
                variables:
              </p>
              <pre className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[11px] overflow-x-auto">
                {`gcloud run deploy team-task-manager-api \\
  --source ./backend \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --set-env-vars NODE_ENV=production,SESSION_STORE=postgres,FRONTEND_URL=https://my-frontend.run.app \\
  --set-secrets MONGODB_URI=mongodb-uri:latest,DATABASE_URL=postgres-url:latest,SESSION_SECRET=session-secret:latest`}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Step 4: Deploy Frontend & Verify Cookies & CORS
              </h4>
              <p className="text-slate-600 mb-2">
                Configure `VITE_API_URL` to point to the Cloud Run backend URL. In production,
                ensure both origins share valid SSL certificates for SameSite=none cookies.
              </p>
              <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px]">
                VITE_API_URL="https://team-task-manager-api-xyz.run.app/api"
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'git' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <span>Git Branching Strategy & Pull Request Workflow</span>
          </h3>

          <p className="text-xs text-slate-600">
            Follow standard Git feature-branching conventions. Each milestone is developed on a
            distinct branch before PR review and merging into `main`.
          </p>

          <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
            {`# 1. Initialize Git repository
git init
git checkout -b main

# 2. Authentication feature branch
git checkout -b feature/authentication
git add backend/config/passport.js backend/controllers/authController.js frontend/src/pages/LoginPage.jsx
git commit -m "feat(auth): implement Passport.js local strategy with bcrypt and session regeneration"
git push -u origin feature/authentication

# 3. Team Management feature branch
git checkout -b feature/team-management
git add backend/controllers/teamController.js frontend/src/pages/TeamsPage.jsx
git commit -m "feat(teams): add team CRUD, member invite search, and role authorization"
git push -u origin feature/team-management

# 4. Task Management feature branch
git checkout -b feature/task-management
git add backend/controllers/taskController.js frontend/src/components/tasks/TaskKanban.jsx
git commit -m "feat(tasks): implement task CRUD, query filters, and Kanban board"
git push -u origin feature/task-management

# 5. Open Pull Request on GitHub
gh pr create --base main --head feature/authentication --title "Feature: Authentication System"
gh pr merge --squash --delete-branch`}
          </pre>
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Assessment Quality & Testing Checklist</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900">Authentication Verification</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>New user registers with full name, email, and password confirmation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Duplicate email registration returns 409 Conflict with validation details.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Valid credentials authenticate with Passport and set HttpOnly cookie.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Invalid credentials return 401 Unauthorized without leaking account existence.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Sign out terminates the session and removes the cookie.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900">Teams & Permissions Verification</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Authenticated user creates and leads new workspace.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Only authorized team owner can edit settings or invite colleagues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unauthorized users cannot access or tamper with other teams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cascade deletion removes tasks when a team workspace is deleted.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900">Task Management Verification</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tasks can be created with title, team, priority, and due dates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Server validates that assignees belong to the selected team.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Quick status patch updates between To Do, In Progress, and Completed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Overdue calculation highlights milestones whose deadlines have passed.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900">Session & Infrastructure Verification</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Page refresh maintains login state without screen flashing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Helmet sets secure HTTP headers (XSS, Sniffing, Frameguard).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Rate limiter blocks brute-force authentication attacks.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <span>REST API Endpoint Reference & Example Payloads</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-mono mb-1">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  POST
                </span>
                <span className="font-bold text-slate-900">/api/auth/register</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">Register a new user account.</p>
              <pre className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px]">
                {`{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}

{
  "success": true,
  "data": { "id": "usr_...", "name": "Jane Doe", "email": "jane@example.com" },
  "message": "Account registered and authenticated successfully."
}`}
              </pre>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-mono mb-1">
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">POST</span>
                <span className="font-bold text-slate-900">/api/tasks</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Create a task assigned to a team member.
              </p>
              <pre className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px]">
                {`{
  "title": "Build Dockerfile for Cloud Run",
  "description": "Multi-stage Node.js build with non-root security",
  "team": "team_eng_101",
  "assignedTo": "usr_alex_001",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-11-01T00:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
