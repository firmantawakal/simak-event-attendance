<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# saya mau mengganti teknologi yang digunakan. saya rencana akan menggunakan reactjs dan express.js, dan mysql pada database. karena isu akhir2 ini pada nextjs. buat ulang file tech-spec nya.

Tech spec dapat dibuat ulang untuk stack React.js + Express.js + MySQL dengan struktur dan best practice serupa dengan versi sebelumnya. Berikut versi revisinya dalam format Markdown yang bisa langsung disimpan sebagai file, misalnya `tech-spec-campus-digital-guestbook-react-express.md`.[^1][^2]

```markdown
# Tech Spec – Campus Digital Guestbook Application (React + Express + MySQL)

This document describes the technical specification and system overview of a digital guestbook application for campus events, optimized to be easily understood and processed by an AI agent.[web:31] The application is built with React.js (frontend), Express.js (backend), and MySQL (database), using a simple yet well-structured architecture that follows modern web development best practices.[web:21]

---

## 1. System Overview

The digital guestbook application is used to record attendance for campus events where invitations are addressed to institutions rather than named individuals.[web:37] Each guest fills in their attendance on their own mobile device by accessing a URL or scanning a QR code.[web:25]

Main goals:

- Replace paper-based guestbooks with an electronic system.  
- Simplify attendance recap per event and per institution.  
- Reduce queues and workload for registration desk staff.  

---

## 2. User Roles

### 2.1 Admin/Committee

- Create and manage event data.  
- Access attendance dashboard.  
- Export attendance reports (CSV/Excel).  
- View simple statistics (number of guests, number of institutions, total represented people).  

### 2.2 Guest/Institution Representative

- Access the guestbook form from a mobile device (URL/QR code).  
- Fill in personal and institution information.  
- Submit the form to record attendance.  

---

## 3. Main Use Cases

### 3.1 Admin Creates Event

- Admin logs in (if authentication is enabled).  
- Admin creates a new event: name, date, location, short description.  
- System generates a dedicated guestbook URL for the event (which can be encoded as a QR code).  

### 3.2 Guest Fills Digital Guestbook

- Guest scans the QR code or opens the event URL.  
- Guest sees the digital guestbook form.  
- Guest fills in the fields and presses submit.  
- Backend stores the attendance data along with a timestamp.  

### 3.3 Admin Views Attendance Data

- Admin opens the event dashboard page.  
- System displays a table of guests who have checked in.  
- Admin can filter/sort (e.g., by institution or arrival time) and export data as CSV/Excel.  

---

## 4. Feature Scope (Simple Version)

### 4.1 Minimal Features

- Event list page (for admin).  
- Event creation form.  
- Per-event guestbook form (for guests).  
- Attendance data storage in MySQL.  
- Per-event attendance dashboard page.  
- Attendance data export (at least CSV).  

### 4.2 Optional Features (Later Phase)

- Admin authentication (JWT-based).  
- Simple charts and statistics on the dashboard.  
- Email/WhatsApp confirmation after check-in.  
- Additional roles (e.g., super admin, read-only viewer).  

---

## 5. High-Level Architecture

- **Frontend**: React.js SPA  
  - Built with a component-based architecture.  
  - Uses a router library (e.g., React Router) for client-side routing.  
  - Communicates with the backend via RESTful JSON APIs.  

- **Backend**: Express.js  
  - Provides REST API endpoints for events and attendance.  
  - Handles input validation, authentication (if enabled), and business logic.  

- **Database**: MySQL  
  - Stores events and attendance data.  
  - Accessed via an ORM (e.g., Prisma/Sequelize/TypeORM) or a query builder to reduce raw SQL.  

- **Deployment**:  
  - Frontend: served as static assets (e.g., via CDN or Node server).  
  - Backend: deployed on a Node.js environment (e.g., VPS, PaaS).  
  - Database: managed MySQL service (e.g., RDS, PlanetScale, or equivalent).  

---

## 6. Folder Structure (Example)

A simple but organized monorepo-style structure:

```

/
├─ client/                   \# React frontend
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ Layout/
│  │  │  ├─ EventForm/
│  │  │  ├─ AttendanceForm/
│  │  │  └─ AttendanceTable/
│  │  ├─ pages/
│  │  │  ├─ Home.tsx        \# event list / landing
│  │  │  ├─ EventsList.tsx  \# admin events list
│  │  │  ├─ EventCreate.tsx \# create event
│  │  │  ├─ EventDetail.tsx \# event dashboard
│  │  │  └─ AttendForm.tsx  \# guestbook form (per event)
│  │  ├─ routes/
│  │  │  └─ index.tsx       \# React Router configuration
│  │  ├─ api/
│  │  │  └─ client.ts       \# HTTP client (e.g., axios / fetch wrapper)
│  │  ├─ types/
│  │  │  └─ index.ts        \# shared TS types
│  │  └─ styles/
│  │     └─ global.css
│  ├─ public/
│  └─ package.json
│
├─ server/                   \# Express backend
│  ├─ src/
│  │  ├─ app.ts              \# Express app bootstrap
│  │  ├─ routes/
│  │  │  ├─ events.ts        \# /api/events
│  │  │  └─ attendance.ts    \# /api/attendance
│  │  ├─ controllers/
│  │  │  ├─ eventsController.ts
│  │  │  └─ attendanceController.ts
│  │  ├─ services/
│  │  │  ├─ eventsService.ts
│  │  │  └─ attendanceService.ts
│  │  ├─ models/             \# ORM models or query modules
│  │  │  ├─ Event.ts
│  │  │  └─ Attendance.ts
│  │  ├─ db/
│  │  │  └─ index.ts         \# DB connection + ORM init
│  │  ├─ middleware/
│  │  │  ├─ errorHandler.ts
│  │  │  └─ auth.ts          \# optional
│  │  ├─ utils/
│  │  │  └─ validation.ts    \# input validation schemas
│  │  └─ config/
│  │     └─ index.ts         \# env, config constants
│  ├─ package.json
│
├─ .env                      \# shared environment variables (if applicable)
├─ package.json              \# root (for scripts / tooling)
└─ README.md

```

This separation keeps the frontend and backend independent but still colocated for easier development and AI agent orchestration.

---

## 7. Database Schema Design (MySQL)

### 7.1 `events` Table

Stores campus event data.

Columns:

- `id` (PK, bigint/UUID)  
- `name` (varchar, event name)  
- `slug` (varchar, unique, used in URLs, e.g., `open-house-fti-2025`)  
- `description` (text, optional)  
- `date` (date/datetime)  
- `location` (varchar, optional)  
- `created_at` (datetime, default current timestamp)  
- `updated_at` (datetime, default current timestamp on update)  

### 7.2 `attendance` Table

Stores guest attendance for each event.

Columns:

- `id` (PK, bigint/UUID)  
- `event_id` (FK to `events.id`)  
- `guest_name` (varchar)  
- `institution` (varchar, institution name)  
- `position` (varchar, position/title, optional)  
- `phone` (varchar, optional)  
- `email` (varchar, optional)  
- `representative_count` (int, number of people represented, default 1)  
- `category` (varchar, guest type, e.g., `official_invitation`, `sponsor`, optional)  
- `arrival_time` (datetime, default current timestamp)  
- `created_at` (datetime, default current timestamp)  

Recommended indexes:

- Index on `event_id`.  
- Index on `institution` (for frequent filtering by institution).  

### 7.3 `users` Table (Optional, Admin)

If admin authentication is needed:

- `id` (PK)  
- `name`  
- `email` (unique)  
- `password_hash`  
- `role` (e.g., `admin`, `superadmin`)  
- `created_at`, `updated_at`  

---

## 8. API Design (Express REST API)

Base URL example: `/api`

### 8.1 Event Endpoints

- `GET /api/events`  
  - Returns a list of events.  

- `POST /api/events`  
  - Body:  
    ```
    {
      "name": "Event Name",
      "slug": "event-slug",
      "date": "2025-04-01T08:00:00.000Z",
      "location": "Main Hall",
      "description": "Short description"
    }
    ```  
  - Creates a new event.  

- `GET /api/events/:id`  
  - Returns details for a single event.  

- `PUT /api/events/:id`  
  - Updates event details.  

- `DELETE /api/events/:id`  
  - Deletes an event (optional / soft delete).  

### 8.2 Attendance Endpoints

- `POST /api/attendance`  
  - Example body:
    ```
    {
      "eventSlug": "open-house-fti-2025",
      "guestName": "Guest Name",
      "institution": "Institution Name",
      "position": "Position",
      "phone": "08xxxx",
      "email": "email@example.com",
      "representativeCount": 3,
      "category": "official_invitation"
    }
    ```  
  - Steps in controller/service:
    - Resolve `eventSlug` to `event_id`.  
    - Validate input (required fields, types, formats).  
    - Insert into `attendance` with `arrival_time = NOW()`.  

- `GET /api/events/:id/attendance`  
  - Returns attendance list for a specific event.  
  - Query params (optional):  
    - `institution` – filter by institution.  
    - `search` – search by name/institution.  
    - `page`, `pageSize` – pagination.  

- `GET /api/events/:id/attendance/export`  
  - Returns CSV data for the event’s attendance (for admin download).  

---

## 9. Frontend Page Design (React)

### 9.1 Guestbook Form Page (Guest)

Route example: `/attend/:eventSlug`

Main elements:

- Event header: name, date, location, short description.  
- Guestbook form:
  - Guest name (required).  
  - Institution (required).  
  - Position (optional).  
  - Phone (optional, with basic format check).  
  - Email (optional, with basic email validation).  
  - Number of people represented (required, default 1).  
  - Category/purpose (dropdown).  
- Submit button.  
- Success/error notifications.  

UX principles:

- Mobile-friendly layout (single-column form).  
- Client-side validation (with matching server-side validation).  
- After successful submit, show a clear confirmation message and optionally reset the form.  

### 9.2 Event Dashboard Page (Admin)

Route example: `/events/:id`

Main elements:

- Event info summary (name, date, location).  
- Statistics section:
  - Total guests (count of rows).  
  - Total institutions (distinct `institution`).  
  - Total represented people (sum of `representative_count`).  
- Attendance table:
  - Columns: Guest name, Institution, Position, Phone, Email, Count, Category, Arrival time.  
  - Features:
    - Text search (name/institution).  
    - Sorting by arrival time.  
    - Pagination for large data sets.  
- Export button:
  - Triggers call to `GET /api/events/:id/attendance/export` to download CSV.  

---

## 10. Best Practices Applied

- **Separation of concerns**  
  - React components for UI, Express controllers/services for business logic, models for DB access.  
- **Input validation**  
  - Server-side validation (e.g., with Zod/Joi/Yup) in Express middleware or service layer.  
  - Frontend form validation for better UX.  
- **Configuration via environment variables**  
  - DB connection (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).  
  - JWT secret (if using authentication).  
- **Error handling**  
  - Centralized Express error handler middleware.  
  - Meaningful HTTP status codes (400, 401, 404, 500).  
- **Security basics**  
  - Use prepared statements or ORM to prevent SQL injection.  
  - CORS configuration for frontend–backend communication.  
  - Optional rate limiting middleware for public endpoints.  

---

## 11. High-Level Data Flow

1. Admin creates an event via the React admin UI → POST `/api/events` → record stored in `events`.  
2. System exposes a guestbook URL using the event’s `slug`.  
3. Guest opens the URL, views event details, and fills the guestbook form.  
4. React sends POST `/api/attendance` → Express validates and writes to `attendance`.  
5. Admin opens the dashboard for the event → React calls `GET /api/events/:id/attendance`.  
6. Admin exports CSV via `GET /api/events/:id/attendance/export`.  

---

## 12. Notes for AI Agent Integration

- The AI agent can:
  - Generate SQL or ORM queries based on the `events` and `attendance` schemas (e.g., institution-based reports).  
  - Orchestrate API calls to filter, sort, or export attendance for specific use cases.  
  - Suggest UX improvements for React components based on page structure and data fields.  

- Naming conventions:
  - Use consistent property and route names (`eventSlug`, `guestName`, `institution`, `representativeCount`, etc.) to simplify mapping for the AI agent.  

- Additional documentation:
  - OpenAPI/Swagger definition for the Express API.  
  - Schema diagrams for `events`, `attendance`, and `users` tables.  

---
```

Semua bagian sudah disesuaikan untuk stack React + Express + MySQL dengan struktur yang tetap sederhana namun rapi dan siap dikembangkan lebih lanjut.[^2][^1]

<div align="center">⁂</div>

[^1]: https://desnet.id/buku-tamu/

[^2]: https://viding.co/blog/mengenal-buku-tamu-digital-solusi-modern-untuk-mengelola-daftar-tamu-acara

