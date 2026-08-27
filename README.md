# ImpactHub

ImpactHub is a MERN community-impact platform that connects student volunteers with approved projects, structured task workflows, and measurable contribution outcomes.

## The problem

Students want meaningful, skill-building ways to contribute to their communities. Project managers need a reliable way to recruit volunteers, coordinate work, and demonstrate impact. ImpactHub brings those journeys into one secure, role-based product.

## What it delivers

- Public project discovery with search, filters, sorting, and responsive project details
- JWT authentication with bcrypt password hashing and role-based access control
- Student profiles, skills, city, applications, joined projects, tasks, notifications, and contribution scoring
- Manager project creation, volunteer review, member-controlled task assignment, task tracking, and submission review
- Admin user management, project moderation, and MongoDB-backed platform analytics
- Community project comments, in-app notifications, file uploads, task submissions, and leaderboard scoring

## User roles

| Role | Main permissions |
| --- | --- |
| Student | Browse approved projects, apply, join project teams, update assigned work, submit deliverables, comment, and track contributions. |
| Manager | Create and manage owned projects, approve or reject applicants, and assign/review project work. |
| Admin | Moderate all projects, manage users, inspect applications, and view platform-level analytics. |

## Workflow

1. A manager creates a project, which enters `pending` moderation.
2. An admin approves it; approved projects are available for volunteer applications.
3. A student applies once per project. The manager approves or rejects the application.
4. Approval adds the student to the project team and notifies them.
5. A manager assigns work only to approved team members.
6. The student updates progress and submits work; the manager reviews it.
7. Approved work becomes completed and updates contribution scoring and notifications.

## Stack and architecture

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS, Recharts
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, Multer
- Database: MongoDB

`frontend/` is the React client. `backend/` owns the REST API, database models, authorization, uploads, seeds, and tests. The client talks to the backend through `/api` locally or `VITE_API_URL` in deployment.

## Core database models

`User`, `Project`, `Application`, `Task`, `TaskSubmission`, `Comment`, `Notification`, and `VolunteerScore`.

## Local setup

Prerequisites: Node.js 20+ and a running MongoDB instance (local or Atlas).

1. Create `backend/.env` from `backend/.env.example` and provide secure values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/impacthub
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

2. Install and start the API:

```bash
cd backend
npm install
npm run seed:demo
npm run dev
```

3. In a second terminal, install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The seed command creates fake demo data only. It does not run automatically.

### Demo credentials (seed data only)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@impacthub.com` | `admin123` |
| Manager | `manager@impacthub.com` | `manager123` |
| Student | `maya.student@impacthub.test` | `Student123!` |

## Verification commands

```bash
cd backend && npm test
cd frontend && npm run lint && npm run build
```

## Demo flow for judging

1. Open the landing page and browse approved projects.
2. Sign in as a seeded student and apply to a project.
3. Sign in as that project’s manager; approve the application and assign a task.
4. Return as the student; update the task, submit work, and view notifications.
5. Return as manager; review the submission to complete the task.
6. Sign in as admin; review real counts, user management, and pending-project moderation.

The seed script prints the fake/demo credentials it creates. Do not use those credentials outside a demo environment.

## API overview

- `/api/auth` — register, login, current user, profile updates
- `/api/projects` — public discovery plus protected project management
- `/api/applications` — student applications and manager reviews
- `/api/tasks` and `/api/submissions` — assignment, work status, submissions, and review
- `/api/comments` and `/api/notifications` — community interaction and inbox
- `/api/admin` — analytics, moderation, users, and platform management

## Deployment

Set `VITE_API_URL` to the deployed API URL ending in `/api`, set `CLIENT_ORIGIN` to the deployed frontend origin, and use a production MongoDB URI and strong JWT secret. Never commit `.env` files or real credentials.

## Future improvements

Email/push notifications, audit logs, paginated administrative tables, richer impact metrics, and integration tests backed by an isolated MongoDB instance.
