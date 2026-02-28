# 🕉️ Devotee Memorial Platform

A full-stack memorial platform built for ISKCON to preserve and honor the lives of devotees through profiles, offerings, and multimedia tributes.

---

## 📌 Project Overview

This platform allows users to:

- View accepted devotee memorial profiles
- Explore detailed disciple pages
- Submit offerings (text, images, audio, video)
- Upload media via Cloudinary
- Display offerings in a Pinterest-style layout
- Track approved offerings per profile

This project includes both frontend and backend implementations.

---

## 🛠 Tech Stack

### Frontend

- React + Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- Multer (file uploads)
- Cloudinary (media storage)

---

## 📂 Project Structure

```
DevoteeMemorial/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── db/
│   │   ├── app.js
│   │   └── index.js
│   └── .env
│
├── frontend/
│   ├── src/
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
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📦 Core Features

### 👤 Profiles

- Create devotee memorial profiles
- Birth & death date tracking
- Core services & achievements
- Status-based visibility (accepted / pending / declined)

### 🙏 Offerings

- Text tributes
- Image uploads
- Audio uploads
- Video link embedding (YouTube / Vimeo)
- Cloudinary media storage
- Approval workflow (pending → approved → rejected)

### 🎨 UI Features

- Pinterest-style offerings layout
- Embedded video playback inside profile page
- Audio player support
- Image previews before upload
- Upload progress indicator
- Responsive design

---

## 🔐 API Routes

### Profiles

```
GET    /api/accepted/profiles
GET    /api/profiles/:id
POST   /api/profiles
```

### Offerings

```
POST   /api/offerings
GET    /api/offerings/profile/:profileId
```

---

## ⚠️ Important Notes

- Media files are stored on Cloudinary.
- Offerings default to `pending` status.
- Only `approved` offerings count toward profile memory count.
- MongoDB must be connected before the frontend works.
- Backend must run before accessing frontend data.

---

## 📌 Current Status

| Status | Feature |
|--------|---------|
| ✅ | Backend integrated with MongoDB |
| ✅ | Cloudinary configured for media uploads |
| ✅ | Offerings submission flow implemented |
| ✅ | Offerings display redesigned |
| ⚠️ | Admin moderation panel (can be extended) |



