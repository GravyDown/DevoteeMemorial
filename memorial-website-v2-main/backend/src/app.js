import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Profile } from "./models/profile.models.js";
import offeringRoutes from "./routes/offering.routes.js";

// Import routes and middleware
import profileRoutes from './routes/profile.routes.js';
// import authRoutes from './routes/auth.routes.js';  // Already commented
// import userRoutes from './routes/user.routes.js';  // Already commented
// import { authenticateToken, requireAdmin } from './middlewares/auth.middleware.js';  // Already commented
// import verifyRoutes from './routes/verify.routes.js';  // COMMENT THIS OUT
// import sharedMemoryRouter from "./routes/sharedmemory.routes.js";  // COMMENT THIS OUT


const app = express();

app.use(cors({
  origin: [
    "https://devotee-memorial.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
// app.use("/api/verify", verifyRoutes);  // COMMENT THIS OUT
// app.use("/api/shared-memory", sharedMemoryRouter);  // COMMENT THIS OUT


// Routes
app.use("/api/profiles", profileRoutes);
// app.use("/api/auth", authRoutes);  // COMMENT THIS OUT
// app.use("/api/users", userRoutes);  // COMMENT THIS OUT
app.use("/api/offerings", offeringRoutes);

// Admin-protected routes - COMMENT OUT ALL OF THESE
/*
app.get("/api/admin/check", authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get("/api/pending/profiles", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "pending" }).lean();
    res.json({ success: true, profiles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

app.patch("/api/pending/profiles/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const updated = await Profile.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Profile not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.get("/api/declined/profiles", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const declinedProfiles = await Profile.find({ status: "declined" }).lean();
    res.json(declinedProfiles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch declined profiles" });
  }
});
*/

// This one can stay - it's public and doesn't need auth
app.get("/api/accepted/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "accepted" }).lean();

    // Map to frontend structure
    const memorialCards = profiles.map(profile => ({
      id: profile._id,
      name: profile.name,
      years: profile.years || `${profile.birthYear} - ${profile.deathYear}`,
      description: profile.description,
      location: profile.location,
      memories: profile.timeline?.length || 0,
      image: profile.coverImage
    }));

    res.json(memorialCards);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


export { app };