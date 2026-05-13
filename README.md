# Gen-AI Ideathon Management Platform

A full-stack web application for managing a Generative AI hackathon/ideathon event end-to-end — from participant registration and team formation, through mentor assignment and check-ins, to final submission and judge evaluation.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
   - [How Tables Relate to Each Other](#how-tables-relate-to-each-other)
   - [Entity Relationship Diagram](#entity-relationship-diagram)
   - [Table-by-Table Explanation](#table-by-table-explanation)
4. [User Roles & Workflows](#user-roles--workflows)
5. [API Reference](#api-reference)
6. [Setup & Running Locally](#setup--running-locally)
7. [Connecting to Supabase (Production)](#connecting-to-supabase-production)
8. [Evaluation & Scoring Logic](#evaluation--scoring-logic)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | UI and routing |
| Styling | Tailwind CSS v3 | Utility-first styling |
| Bundler | Vite | Fast dev server and build |
| Backend | Node.js + Express + TypeScript | REST API server |
| ORM | Prisma | Database access and migrations |
| Database | PostgreSQL (Supabase) | Persistent data storage |
| Auth | JWT + bcryptjs | Stateless authentication |
| Routing | React Router v6 | Client-side navigation |
| HTTP Client | Axios | API calls from frontend |
| Notifications | react-hot-toast | In-app toast messages |

---

## Project Structure

```
Gen-Ai-Ideathon-Management-Platform/
│
├── client/                        # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/                   # Axios API wrappers (one file per resource)
│   │   │   ├── client.ts          # Axios instance with JWT interceptor
│   │   │   ├── auth.ts
│   │   │   ├── teams.ts
│   │   │   ├── checkin.ts
│   │   │   ├── submission.ts
│   │   │   ├── evaluation.ts
│   │   │   ├── admin.ts
│   │   │   └── notifications.ts
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Layout wrapper
│   │   │   ├── ui/                # Badge, LoadingSpinner
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── ProtectedRoute.tsx # Redirects unauthenticated users
│   │   │   └── RoleRoute.tsx      # Redirects wrong-role users
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Global auth state (user, token, login, logout)
│   │   ├── pages/
│   │   │   ├── Landing.tsx        # Public landing page
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Results.tsx        # Public leaderboard
│   │   │   ├── participant/       # Dashboard, TeamCreate, TeamJoin, CheckIn1, CheckIn2, Submission
│   │   │   ├── mentor/            # Mentor dashboard
│   │   │   ├── judge/             # Judge panel, Evaluate page
│   │   │   └── admin/             # Admin dashboard, Users, Teams
│   │   ├── types/
│   │   │   └── index.ts           # All TypeScript interfaces
│   │   └── utils/
│   │       └── date.ts            # Date formatting helpers
│   └── index.html
│
└── server/                        # Express backend
    ├── prisma/
    │   ├── schema.prisma          # Database schema & relations
    │   ├── seed.ts                # Creates demo admin/judge/mentor accounts
    │   └── migrations/            # SQL migration history
    └── src/
        ├── index.ts               # Express app entry point
        ├── lib/
        │   ├── prisma.ts          # Singleton Prisma client
        │   └── jwt.ts             # Sign and verify JWT tokens
        ├── middleware/
        │   └── auth.ts            # authenticate() and requireRole() guards
        └── routes/
            ├── auth.ts            # /api/auth/*
            ├── teams.ts           # /api/teams/*
            ├── checkin.ts         # /api/checkin/*
            ├── submission.ts      # /api/submission/*
            ├── evaluation.ts      # /api/evaluation/*
            ├── mentors.ts         # /api/mentors/*
            ├── admin.ts           # /api/admin/*
            └── notifications.ts   # /api/notifications/*
```

---

## Database Schema

### How Tables Relate to Each Other

A database stores data in separate tables to avoid repetition and keep things organized. Instead of copying a user's name into every related record, we store the user's **ID** (a unique identifier) as a foreign key. When we need the actual name or email, Prisma follows the ID and fetches it from the original table automatically using a SQL JOIN.

**Example:**
The `TeamMember` table does not store a participant's name. It stores a `userId` that points to a row in the `User` table, and a `teamId` that points to a row in the `Team` table. When the API fetches team members, Prisma resolves both IDs into full objects so the frontend receives names and emails — not just IDs.

```
TeamMember row:  { userId: "cm_111", teamId: "cm_xyz" }
                          ↓                   ↓
User table:      { id: "cm_111", username: "melvin" }
Team table:      { id: "cm_xyz", name: "Neural Pioneers" }

API response:    { user: { username: "melvin" }, team: { name: "Neural Pioneers" } }
```

---

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                              USER                                    │
│  id · username · email · password · role · createdAt                │
└──────┬───────────────────────┬──────────────────────┬───────────────┘
       │                       │                      │
       │ ONE user owns         │ ONE user is a        │ ONE user can be
       │ ONE team              │ member of ONE team   │ a MENTOR of MANY teams
       ▼                       ▼                      ▼
┌─────────────┐      ┌──────────────────┐    ┌────────────────────┐
│    TEAM     │◄─────│   TEAM MEMBER    │    │  TEAM (mentorId)   │
│             │      │                  │    │  (back to Team)    │
│ id          │      │ id               │    └────────────────────┘
│ name        │      │ teamId ──────────┼──► TEAM.id
│ code        │      │ userId ──────────┼──► USER.id
│ problemStmt │      │ joinedAt         │
│ description │      └──────────────────┘
│ ownerId ────┼──────────────────────────► USER.id (team leader)
│ mentorId ───┼──────────────────────────► USER.id (assigned mentor)
└──────┬──────┘
       │
       │ ONE team has ONE of each below
       │
       ├──────────────► ┌────────────────────────────────────────────┐
       │                │              CHECK-IN 1                    │
       │                │  id · teamId · techStack · workflow        │
       │                │  approach · submittedAt                    │
       │                └────────────────────────────────────────────┘
       │
       ├──────────────► ┌────────────────────────────────────────────┐
       │                │              CHECK-IN 2                    │
       │                │  id · teamId · githubLink · workflowStatus │
       │                │  progressUpdate · submittedAt              │
       │                └────────────────────────────────────────────┘
       │
       ├──────────────► ┌────────────────────────────────────────────┐
       │                │             SUBMISSION                     │
       │                │  id · teamId · githubLink · description    │
       │                │  submittedAt · locked                      │
       │                └────────────────────────────────────────────┘
       │
       └──────────────► ┌────────────────────────────────────────────┐
                        │             EVALUATION                     │
                        │  id · teamId · judgeId · technicality      │
                        │  wowFactor · creativity · useCase · total  │
                        │  comments                                  │
                        │                                            │
                        │  teamId  ──────────────────────► TEAM.id  │
                        │  judgeId ──────────────────────► USER.id  │
                        └────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATION                                │
│  id · userId · title · message · read · createdAt                   │
│  userId ───────────────────────────────────────────► USER.id        │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Table-by-Table Explanation

#### `User`
The central table. Every person who interacts with the platform has a row here — participants, mentors, judges, and admins.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Unique auto-generated ID. Used as a foreign key in every other table |
| `username` | String | Display name. Must be unique across all users |
| `email` | String | Login email. Must be unique |
| `password` | String | bcrypt-hashed password. Never stored in plain text |
| `role` | String | `PARTICIPANT`, `MENTOR`, `JUDGE`, or `ADMIN`. Controls what routes a user can access |
| `createdAt` | DateTime | When the account was created |

**Relations going out from User:**
- `ownedTeam` → points to one `Team` where this user is the leader
- `teamMembership` → points to one `TeamMember` row (which team this user belongs to)
- `mentorTeams` → points to many `Team` rows (teams this mentor is assigned to)
- `evaluations` → points to many `Evaluation` rows (scores this judge submitted)
- `notifications` → points to many `Notification` rows for this user

---

#### `Team`
Created by a participant. Represents a competing group. Each team goes through the full event lifecycle.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Unique team ID |
| `name` | String | Team display name. Must be unique |
| `code` | String | 8-character uppercase code (e.g. `AB12CD34`). Shared with teammates to join |
| `problemStatement` | String | One-line description of what problem the team is solving |
| `description` | String | Full project description |
| `ownerId` | String | **Foreign key → `User.id`**. The user who created the team (team leader) |
| `mentorId` | String? | **Foreign key → `User.id`**. Nullable — set by admin after team creation |

**Why `ownerId` is unique:** A participant can only lead one team. If `ownerId` were not unique, the same person could create multiple teams.

**Relations going out from Team:**
- `owner` → resolves `ownerId` to the full `User` object of the team leader
- `mentor` → resolves `mentorId` to the full `User` object of the assigned mentor
- `members` → list of `TeamMember` rows (everyone in the team, including the leader)
- `checkIn1`, `checkIn2`, `submission` → the team's submissions at each stage
- `evaluations` → list of scores submitted by all judges for this team

---

#### `TeamMember`
A join table that connects users to teams. This is how we track who is in which team.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Row ID |
| `teamId` | String | **Foreign key → `Team.id`** |
| `userId` | String | **Foreign key → `User.id`** |
| `joinedAt` | DateTime | When this person joined the team |

**Why `userId` is unique:** A participant can only be in one team at a time. The unique constraint on `userId` enforces this — trying to insert a second row with the same `userId` will fail.

**How it works:** When a team is created, the system automatically inserts a `TeamMember` row for the creator. When someone joins using a team code, a new `TeamMember` row is inserted for them.

---

#### `CheckIn1`
The team's first milestone submission. Captures what they're building and how they're approaching it.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Row ID |
| `teamId` | String | **Foreign key → `Team.id`** (unique — one check-in per team) |
| `techStack` | String | Technologies, frameworks, and AI models being used |
| `workflow` | String | Current progress and what has been built so far |
| `approach` | String | Architecture decisions and development strategy |
| `submittedAt` | DateTime | First submission time |
| `updatedAt` | DateTime | Last update time (teams can revise before Check-In 2) |

**Why `teamId` is unique:** Each team can only have one Check-In 1 record. The `upsert` operation in the API updates the existing record if one exists, or creates a new one if it doesn't.

**Gate:** The API requires a mentor to be assigned (`team.mentorId` must not be null) before accepting this submission.

---

#### `CheckIn2`
The team's second milestone. Captures the GitHub repository and implementation progress.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Row ID |
| `teamId` | String | **Foreign key → `Team.id`** (unique — one per team) |
| `githubLink` | String | Public GitHub repository URL |
| `workflowStatus` | String | What's working, what's not, what's left |
| `progressUpdate` | String | Overall progress description and remaining plan |
| `submittedAt` | DateTime | First submission time |
| `updatedAt` | DateTime | Last update time |

**Gate:** Check-In 1 must be completed before the API accepts Check-In 2.

---

#### `Submission`
The team's final, locked project submission. Once created it cannot be modified.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Row ID |
| `teamId` | String | **Foreign key → `Team.id`** (unique — one per team) |
| `githubLink` | String | Final public GitHub repository URL |
| `description` | String | Comprehensive final project description |
| `submittedAt` | DateTime | When the project was submitted |
| `locked` | Boolean | Always `true` after submission. The API rejects any further changes |

**Gate:** Check-In 2 must be completed before the API accepts the final submission.

**After submission:** Notifications are sent to all judges and admins so they know a new project is ready to evaluate.

---

#### `Evaluation`
A judge's score for one team. Each judge scores each team independently, and the final result is the average across all judges.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Row ID |
| `teamId` | String | **Foreign key → `Team.id`** — which team is being scored |
| `judgeId` | String | **Foreign key → `User.id`** — which judge submitted this score |
| `technicality` | Int | Score 0–100. Tiebreaker criterion |
| `wowFactor` | Int | Score 0–100 |
| `creativity` | Int | Score 0–100 |
| `useCase` | Int | Score 0–100 |
| `total` | Int | Sum of all four scores (max 400) |
| `comments` | String? | Optional feedback for the team |

**Unique constraint `@@unique([teamId, judgeId])`:** A judge can only submit one evaluation per team. The API uses `upsert` so judges can update their scores, but they can never have two separate rows for the same team.

**How the final score is calculated:**
```
Final Technicality = average of all judges' technicality scores
Final Wow Factor   = average of all judges' wowFactor scores
Final Creativity   = average of all judges' creativity scores
Final Use Case     = average of all judges' useCase scores
Final Total        = sum of all four averages (max 400)

Tiebreaker: if two teams have the same Final Total,
            the team with the higher Final Technicality ranks higher.
```

---

#### `Notification`
In-app notifications sent to users when key events happen.

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Row ID |
| `userId` | String | **Foreign key → `User.id`** — who receives this notification |
| `title` | String | Short notification heading |
| `message` | String | Full notification body |
| `read` | Boolean | Whether the user has seen it. Defaults to `false` |
| `createdAt` | DateTime | When the notification was created |

**When notifications are created:**
| Event | Who is notified |
|-------|----------------|
| Team created | All admins |
| Member joins a team | Team owner |
| Mentor assigned | The mentor + all team members |
| Check-In 1 submitted | The team's mentor |
| Check-In 2 submitted | The team's mentor |
| Final submission locked | All judges + all admins |
| Project evaluated | All members of the evaluated team |

---

## User Roles & Workflows

### Role Hierarchy

```
ADMIN
  └── Can do everything: manage users, assign roles, assign mentors, view all data

JUDGE
  └── Can view final submissions, submit and update evaluations

MENTOR
  └── Can view their assigned teams' check-ins and submissions

PARTICIPANT
  └── Can register, create/join teams, submit check-ins, submit final project
```

### Participant Flow (step by step)

```
Register ──► Login ──► Create Team  ──► Share Code ──► Teammates Join
                            │
                            ▼
                    Admin assigns Mentor
                            │
                            ▼
                     Submit Check-In 1
                     (tech stack, workflow, approach)
                            │
                            ▼
                     Submit Check-In 2
                     (GitHub link, progress update)
                            │
                            ▼
                   Lock Final Submission
                   (GitHub link, full description)
                            │
                            ▼
                  Judges Evaluate ──► Results Published
```

### Admin Flow

```
Login ──► Manage Users (/admin/users)
            └── Change role: PARTICIPANT → MENTOR or JUDGE

         Manage Teams (/admin/teams)
            └── Assign a MENTOR user to each team

         View Results (/results)
            └── See final rankings after judges complete evaluations
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | None | Register a new participant account |
| `POST` | `/auth/login` | None | Login and receive a JWT token |
| `GET` | `/auth/me` | Any | Get current user with full team data |

### Teams

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/teams` | PARTICIPANT | Create a new team |
| `POST` | `/teams/join` | PARTICIPANT | Join a team using a code |
| `GET` | `/teams` | Any | List all teams |
| `GET` | `/teams/:id` | Any | Get a single team by ID |

### Check-Ins

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/checkin/1` | PARTICIPANT | Submit or update Check-In 1 |
| `GET` | `/checkin/1/:teamId` | Any | Get a team's Check-In 1 |
| `POST` | `/checkin/2` | PARTICIPANT | Submit or update Check-In 2 |
| `GET` | `/checkin/2/:teamId` | Any | Get a team's Check-In 2 |

### Submission

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/submission` | PARTICIPANT | Lock and submit final project |
| `GET` | `/submission` | JUDGE, ADMIN | List all submissions with team data |
| `GET` | `/submission/:teamId` | Any | Get a team's submission |

### Evaluation

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/evaluation` | JUDGE | Submit or update an evaluation |
| `GET` | `/evaluation/results` | None | Get final ranked leaderboard |
| `GET` | `/evaluation/my` | JUDGE | Get this judge's evaluations |
| `GET` | `/evaluation/team/:teamId` | JUDGE, ADMIN | Get all evaluations for a team |

### Mentors

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/mentors` | Any | List all users with MENTOR role |
| `POST` | `/mentors/assign` | ADMIN | Assign a mentor to a team |
| `GET` | `/mentors/my-teams` | MENTOR | Get teams assigned to this mentor |

### Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/admin/stats` | ADMIN | Platform statistics (counts by role, etc.) |
| `GET` | `/admin/users` | ADMIN | List all users |
| `PATCH` | `/admin/users/:id/role` | ADMIN | Change a user's role |
| `DELETE` | `/admin/users/:id` | ADMIN | Delete a user |
| `GET` | `/admin/teams` | ADMIN | List all teams with full details |
| `DELETE` | `/admin/teams/:id` | ADMIN | Delete a team and all its data |

### Notifications

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/notifications` | Any | Get current user's notifications |
| `PATCH` | `/notifications/:id/read` | Any | Mark one notification as read |
| `PATCH` | `/notifications/read-all` | Any | Mark all notifications as read |

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# Copy the example and fill in your values
cp .env.example server/.env
```

For local development with SQLite, set:
```env
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
JWT_SECRET="any-random-secret-string"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### 3. Create the database and seed demo accounts

```bash
cd server
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 4. Start both servers

```bash
# From the project root — runs frontend + backend together
npm run dev
```

| Server | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

### Demo accounts (created by seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ideathon.com | admin123 |
| Judge | judge1@ideathon.com | judge123 |
| Mentor | mentor1@ideathon.com | mentor123 |

Register a new account to test the Participant flow.

### Inspect the database visually

```bash
cd server
npm run db:studio    # Opens Prisma Studio at http://localhost:5555
```

---

## Connecting to Supabase (Production)

### Why Supabase?
Supabase provides a managed PostgreSQL database with a built-in web UI (Table Editor), connection pooling via PgBouncer, and a free tier suitable for a hackathon event with up to 700 users.

### Why two connection URLs?

Supabase runs a proxy called **PgBouncer** on port `6543`. It pools connections efficiently for the live application but does not support Prisma's migration commands (which require prepared statements). So we use:

| Variable | Port | Used for |
|----------|------|----------|
| `DATABASE_URL` | 6543 | App at runtime — all API queries |
| `DIRECT_URL` | 5432 | Prisma migrations only |

### Step-by-step

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the **Transaction mode** string (port 6543) → `DATABASE_URL`
4. Copy the **Session mode** string (port 5432) → `DIRECT_URL`

Your `server/.env` should look like:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
JWT_SECRET="your-strong-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

> **Important:** The `?pgbouncer=true&connection_limit=1` suffix on `DATABASE_URL` tells Prisma not to use prepared statements, which are incompatible with PgBouncer in transaction mode. Without it, you will get `prepared statement already exists` errors under concurrent load.

5. Push the schema and seed:
```bash
cd server
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

6. View your live data: Supabase dashboard → **Table Editor**

---

## Evaluation & Scoring Logic

### How a team is scored

Each judge independently scores a team on four criteria, each out of 100 (max 400 total per judge).

When results are calculated, each criterion is **averaged across all judges** first, then the four averages are summed for the final total:

```
avgTech       = round( sum of all judges' technicality / number of judges )
avgWow        = round( sum of all judges' wowFactor    / number of judges )
avgCreativity = round( sum of all judges' creativity   / number of judges )
avgUseCase    = round( sum of all judges' useCase      / number of judges )

finalTotal    = avgTech + avgWow + avgCreativity + avgUseCase  (max 400)
```

### Tiebreaker rule

If two teams have the same `finalTotal`, the team with the **higher `avgTech` (Technicality)** score ranks higher. This is applied automatically when the results are sorted on the server.

### What judges see

Each judge sees:
- Their own score per team (green row)
- Which other judges have already evaluated the team, and each judge's total score (grey pills)
- A count badge showing how many judges have evaluated the team so far

This allows judges to work independently without duplicating effort.
