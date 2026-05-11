# Knowvation Learnings — Content Management Dashboard

<p align="center">
  <img src="./src/assets/logo.png" alt="Knowvation Logo" height="60" />
</p>

<p align="center">
  A centralized, multi-organization content management platform for scheduling, reviewing, and publishing educational social media content across KLM, KLS, and KLC channels.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Objectives](#-objectives)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Cloning the Repository](#cloning-the-repository)
  - [Environment Setup](#environment-setup)
  - [Running the Project](#running-the-project)
- [Available Scripts](#-available-scripts)
- [Routing](#-routing)
- [Database Schema (Supabase)](#-database-schema-supabase)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Knowvation Learnings** is an internal content management dashboard built for the Knowvation team. It enables multi-organization workflows for creating, reviewing, approving, scheduling, and publishing educational posts across three distinct social channels: **KLM**, **KLS**, and **KLC**.

The platform is built with **React 19 + Vite** on the frontend and **Supabase** as the backend-as-a-service (authentication, database, real-time).

---

## 🎯 Objectives

1. **Centralized Content Hub** — Manage all posts and media across organizations from one dashboard.
2. **Multi-Organization Support** — Each organization has its own isolated content space with branding.
3. **Content Workflow** — Posts flow through a `pending review → approved/rejected` lifecycle before publishing.
4. **Calendar Scheduling** — Visual calendar for scheduling and tracking approved posts by date.
5. **Team Collaboration** — Invite and manage team members per organization with role-based access.
6. **Quiz Bank** — Build and manage educational quiz questions tied to content.
7. **Social Channel Management** — Dedicated views for KLM, KLS, and KLC social media channels.
8. **Brand Customization** — Per-organization brand color settings applied across all views.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email/password login via Supabase Auth with protected routes |
| 🏢 **Organizations** | Switch between multiple organizations from a central screen |
| 📊 **Dashboard** | Stats overview, weekly schedule, account overview, and activity feed |
| 📅 **Content Calendar** | Monthly/weekly calendar with drag-and-drop post scheduling |
| 📝 **Posts Manager** | Create, list, filter, approve/reject posts with rich text editor |
| 🧠 **Quiz Bank** | Add/manage multiple-choice quiz questions per organization |
| 👥 **Team Management** | Invite members, assign roles, manage access per org |
| ⚙️ **Settings** | Brand color customization, org profile settings |
| 📣 **Socials (KLM/KLS/KLC)** | Dedicated views per social media channel |
| 🔔 **Toast Notifications** | Inline success/error feedback on all user actions |
| 🛡️ **Confirm Modals** | Safe delete/destructive action confirmation dialogs |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│                                                              │
│   ┌──────────┐    ┌───────────────────────────────────────┐ │
│   │  Login   │    │           Protected App Shell          │ │
│   │  Page    │    │  ┌────────────┐  ┌──────────────────┐ │ │
│   └────┬─────┘    │  │  Sidebar   │  │   Page Content   │ │ │
│        │          │  │  (Nav)     │  │  (Outlet/Route)  │ │ │
│        │          │  └────────────┘  └──────────────────┘ │ │
│        │          └───────────────────────────────────────┘ │
└────────┼────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│    Supabase Backend      │
│                          │
│  • Auth (Sessions)       │
│  • PostgreSQL DB         │
│    - organizations       │
│    - profiles            │
│    - posts               │
│    - quiz_questions      │
│    - activity_log        │
│    - org_members         │
│  • Storage (Assets)      │
└─────────────────────────┘
```

### Data Flow

```
User Action → React Component → Supabase JS Client → Supabase API
                                                          │
                                            PostgreSQL Database
                                                          │
                                          Response → State Update → Re-render
```

### Authentication Flow

```
/ → /login → Supabase Auth → Session stored
                                    │
                              ProtectedRoute checks session
                                    │
                   Session valid → /organizations → /org/:orgId/dashboard
                   No session    → Redirect to /login
```

---

## 📂 Project Structure

```
Knowvation-Learnings/
├── .env                          # Environment variables (Supabase URL & Key)
├── .gitignore
├── index.html                    # Vite entry HTML
├── package.json
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── eslint.config.js              # ESLint configuration
│
└── src/
    ├── main.jsx                  # React DOM entry point
    ├── App.jsx                   # Router setup, ProtectedRoute, Layout
    ├── index.css                 # Global styles
    │
    ├── assets/
    │   └── logo.png              # Knowvation brand logo
    │
    ├── supabase/
    │   └── supabase.js           # Supabase client initialization
    │
    ├── components/
    │   ├── common/
    │   │   ├── ConfirmModal.jsx   # Reusable confirm/delete dialog
    │   │   └── Toast.jsx          # Notification toast component
    │   │
    │   ├── dashboard/
    │   │   ├── StatCards.jsx      # KPI stat cards (posts, scheduled, pending)
    │   │   ├── WeeklySchedule.jsx # 7-day post schedule view
    │   │   ├── AccountOverview.jsx# Per-channel stats breakdown
    │   │   └── ActivityFeed.jsx   # Recent team activity log
    │   │
    │   ├── layout/
    │   │   ├── SideBar.jsx        # Navigation sidebar with org-aware routes
    │   │   └── ScrollTotop.jsx    # Scroll restoration on route change
    │   │
    │   ├── posts/
    │   │   ├── CreatePostModal.jsx# Modal form for creating posts
    │   │   ├── PostCard.jsx       # Post card display component
    │   │   └── PostListRow.jsx    # Post list row for table view
    │   │
    │   ├── quiz/
    │   │   ├── AddQuestionModal.jsx # Modal form for adding quiz questions
    │   │   ├── QuestionCard.jsx     # Quiz question card display
    │   │   └── QuestionForm.jsx     # Quiz question form fields
    │   │
    │   └── settings/
    │       (settings-related components)
    │
    └── pages/
        ├── Login.jsx              # Login page (email/password)
        ├── Organizations.jsx      # Organization selector / switcher
        ├── Dashboard.jsx          # Main dashboard with stats & widgets
        ├── Calendar.jsx           # Content scheduling calendar
        ├── Posts.jsx              # Posts list, filter, and management
        ├── CreatePost.jsx         # Full-page post creation editor
        ├── Quiz.jsx               # Quiz bank management
        ├── Team.jsx               # Team member management
        ├── Settings.jsx           # Org settings and brand colors
        └── socials/
            ├── Klm.jsx            # KLM social channel view
            ├── Kls.jsx            # KLS social channel view
            └── Klc.jsx            # KLC social channel view
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI component library |
| **Vite** | 8.x | Build tool and dev server |
| **React Router DOM** | 7.x | Client-side routing |
| **Supabase JS** | 2.x | Auth, database, and storage client |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Lucide React** | 1.x | Icon library |
| **React Colorful** | 5.x | Color picker for brand settings |
| **PostCSS** | 8.x | CSS processing |
| **ESLint** | 10.x | Code linting |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **npm** ≥ 9.x (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)

### Cloning the Repository

```bash
git clone https://github.com/jahnavi-veeramsetty/Knowvation-Learnings.git
cd Knowvation-Learnings
```

### Environment Setup

Create a `.env` file in the root directory with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Where to find these?**
> Go to your [Supabase Dashboard](https://app.supabase.com/) → Project → Settings → API

### Running the Project

**1. Install dependencies:**

```bash
npm install
```

**2. Start the development server:**

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |

---

## 🗺️ Routing

| Route | Page | Auth Required |
|---|---|---|
| `/` | Redirect to `/login` | ❌ |
| `/login` | Login page | ❌ |
| `/organizations` | Organization selector | ✅ |
| `/org/:orgId/dashboard` | Dashboard | ✅ |
| `/org/:orgId/calendar` | Content Calendar | ✅ |
| `/org/:orgId/posts` | Posts Manager | ✅ |
| `/org/:orgId/posts/create` | Create Post | ✅ |
| `/org/:orgId/quiz` | Quiz Bank | ✅ |
| `/org/:orgId/team` | Team Management | ✅ |
| `/org/:orgId/settings` | Settings | ✅ |
| `/org/:orgId/socials/klm` | KLM Social View | ✅ |
| `/org/:orgId/socials/kls` | KLS Social View | ✅ |
| `/org/:orgId/socials/klc` | KLC Social View | ✅ |

All protected routes use a `ProtectedRoute` wrapper that checks the active Supabase session and redirects to `/login` if unauthenticated.

---

## 🗄️ Database Schema (Supabase)

The app interacts with the following Supabase tables:

| Table | Description |
|---|---|
| `organizations` | Org profiles, names, brand colors |
| `profiles` | User profiles linked to `auth.users` |
| `org_members` | Junction table: users ↔ organizations with roles |
| `posts` | Content posts with status, scheduled_date, channel |
| `quiz_questions` | Quiz questions with options and answers |
| `activity_log` | Audit trail of team actions (approve, reject, create) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

<p align="center">Built with ❤️ by the Knowvation Team</p>
