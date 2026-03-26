# 🕉️ Devotee Memorial Platform

A full-stack memorial platform built for ISKCON to preserve and honor the lives of departed devotees through profiles, offerings, and multimedia tributes.

---

## 📌 Project Overview

This platform allows users to:

- Browse accepted devotee memorial profiles with search and filters
- View detailed disciple pages with offerings and core services
- Submit offerings (text, images, audio, video links)
- Upload media via Cloudinary
- Create departed devotee memorial accounts (requires login)
- Authenticate via Email/Password or Google Sign-In
- Reset forgotten passwords using email + registered phone verification
- View an admin dashboard for moderating profiles and offerings

---

## 🛠 Tech Stack

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS + Shadcn UI
- Framer Motion
- React Router v7

### Backend
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT (access + refresh token auth)
- Multer (file uploads)
- Cloudinary (media storage)
- Google Auth Library (OAuth2)
- Nodemailer (welcome emails)

---

## 📂 Project Structure

```
DevoteeMemorial/
└── memorial-website-v2-main/
    ├── backend/
    │   ├── src/
    │   │   ├── controllers/
    │   │   │   ├── auth.controller.js
    │   │   │   ├── offering.controller.js
    │   │   │   ├── profile.controller.js
    │   │   │   ├── sharedmemory.controller.js
    │   │   │   ├── user.controller.js
    │   │   │   └── verify.controller.js
    │   │   ├── models/
    │   │   │   ├── comment.model.js
    │   │   │   ├── like.model.js
    │   │   │   ├── offering.models.js
    │   │   │   ├── profile.models.js
    │   │   │   ├── sharedmemory.model.js
    │   │   │   └── user.models.js
    │   │   ├── routes/
    │   │   │   ├── auth.routes.js
    │   │   │   ├── offering.routes.js
    │   │   │   ├── profile.routes.js
    │   │   │   └── user.routes.js
    │   │   ├── middlewares/
    │   │   │   ├── auth.middleware.js
    │   │   │   ├── moderation.middleware.js
    │   │   │   ├── multer.middleware.js
    │   │   │   └── offeringmulter.middleware.js
    │   │   ├── utils/
    │   │   │   ├── ApiError.js
    │   │   │   ├── ApiResponse.js
    │   │   │   ├── asyncHandler.js
    │   │   │   ├── Cloudinary.js
    │   │   │   └── mailer.js
    │   │   ├── db/
    │   │   │   └── db.js
    │   │   ├── app.js
    │   │   └── index.js
    │   ├── .env
    │   └── package.json
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── ui/                  # Shadcn UI primitives
    │   │   │   ├── DateInputGroup.tsx
    │   │   │   ├── FilterBar.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Hero.tsx
    │   │   │   ├── InputField.tsx
    │   │   │   ├── MemorialBoard.tsx
    │   │   │   ├── MemorialCard.tsx
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── OfferingCard.tsx
    │   │   │   ├── ProtectedRoute.tsx
    │   │   │   ├── SelectField.tsx
    │   │   │   └── WisdomSection.tsx
    │   │   ├── hooks/
    │   │   │   ├── use-auth.ts
    │   │   │   └── use-mobile.ts
    │   │   ├── lib/
    │   │   │   ├── api.ts
    │   │   │   └── utils.ts
    │   │   ├── pages/
    │   │   │   ├── AdminDashboard.tsx
    │   │   │   ├── Auth.tsx
    │   │   │   ├── CreateAccount.tsx
    │   │   │   ├── CreateOffering.tsx
    │   │   │   ├── DiscipleDetail.tsx
    │   │   │   ├── ForgotPassword.tsx
    │   │   │   ├── Home.tsx
    │   │   │   ├── NotFound.tsx
    │   │   │   └── Register.tsx
    │   │   └── types/
    │   ├── public/
    │   └── .env
    │
    └── README.md
```

---

## 🚀 Getting Started

Both frontend and backend must run simultaneously.

### 🔹 Backend Setup

1. Navigate to the backend folder:
```bash
cd memorial-website-v2-main/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_oauth_client_id

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

4. Start the backend server:
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 🔹 Frontend Setup

1. Navigate to the frontend folder:
```bash
cd memorial-website-v2-main/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

4. Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📦 Core Features

### 🔐 Authentication
- Email + password registration and login
- Google OAuth Sign-In
- JWT-based auth (15-min access token + 7-day refresh token via HTTP-only cookies)
- Role-based access: `user` and `admin`
- Forgot password: verifies identity using **registered email + phone number** (no email link required), then allows direct password reset in a 2-step flow

### 👤 Devotee Profiles
- Create memorial profiles for departed devotees (login required)
- Fields: name, honorific, associated temple, ashram role, core services, initiating guru, birth/death dates, location, description, cover image
- Contributor details auto-filled from logged-in user
- Profile status workflow: `pending` → `accepted` / `declined`
- Only `accepted` profiles are publicly visible

### 🙏 Offerings
- Submit text tributes, image uploads, audio uploads, and YouTube/Vimeo video links
- Cloudinary media storage
- Offerings displayed in a masonry/Pinterest-style layout
- Embedded video playback and audio player support

### 🔍 Search & Filter
- Live name search with suggestion dropdown (avatar + years shown)
- Filter by: Gender, Year of Departure, Initiating Guru, Service Category, Location
- A–Z / Z–A sort toggle
- All filtering done client-side on the fetched profiles list

### 🖼 UI
- Sacramento script font for headings, warm brown (`#804B23`) brand color
- Responsive layout (mobile grid → desktop slider for cards)
- Framer Motion animations throughout
- Sticky auth-aware Navbar: shows Login button when logged out, profile dropdown + "Create Memorial" button when logged in
- Words of Wisdom auto-scrolling carousel

### 🛡 Admin
- Admin dashboard for reviewing pending profiles
- Approve / decline profile submissions
- Moderation workflow for offerings

---

## 🔐 API Routes

### Users
```
POST   /api/users/register
POST   /api/users/login
POST   /api/users/logout
POST   /api/users/google
POST   /api/users/verify-identity     # Step 1: verify email + phone for password reset
POST   /api/users/reset-password      # Step 2: set new password using verifyToken
GET    /api/users/profile             # Protected
PATCH  /api/users/profile             # Protected
```

### Profiles
```
GET    /api/profiles                  # All accepted profiles
GET    /api/profiles/:id              # Single profile
POST   /api/profiles                  # Create (multipart/form-data)
GET    /api/profiles/pending          # Admin: pending profiles
PATCH  /api/profiles/:id/status       # Admin: accept / decline
PATCH  /api/profiles/:id/achievement  # Add achievement
PATCH  /api/profiles/:id/timeline     # Add timeline event
DELETE /api/profiles/:id
```

### Offerings
```
POST   /api/offerings
GET    /api/offerings/profile/:profileId
```

---

## ⚠️ Important Notes

- All media (profile images, offering images, audio) is stored on Cloudinary — never on the local server.
- Profile and offering submissions default to `pending` status and require admin approval to appear publicly.
- The `phone` field is required during registration if users want to use the forgot password flow.
- Google Sign-In accounts cannot use the forgot password flow (they have no local password).
- MongoDB must be running and connected before the backend starts.
- Access tokens expire after 15 minutes; the refresh token silently renews them for 7 days.

---

## 📌 Current Status

| Status | Feature |
|--------|---------|
| ✅ | MongoDB + Mongoose integration |
| ✅ | JWT auth with access + refresh tokens |
| ✅ | Google OAuth Sign-In |
| ✅ | Cloudinary media uploads |
| ✅ | Devotee profile creation + approval workflow |
| ✅ | Offerings submission + display |
| ✅ | Live search + client-side filters |
| ✅ | Forgot password (email + phone verification) |
| ✅ | Auth-aware Navbar (profile dropdown + logout) |
| ✅ | Role-based routing (user / admin) |
| ⚠️ | Admin moderation panel (functional, can be extended) |
| 🔲 | Email notifications for offering approval |

---

## 👥 Team

| Name | Role |
|------|------|
| Aman Vats | Full-stack development |
| Arunabha Mukhopadhyay | Full-stack development |
| Anshul Mandekar | Full-stack development |
| Garvit Tyagi | Full-stack development |

---

*Hare Krishna 🙏 — Built as a humble offering to honor departed Vaishnavas.*
