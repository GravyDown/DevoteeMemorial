import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Profile } from "./models/profile.models.js";
import offeringRoutes from "./routes/offering.routes.js";
import { authenticateToken, requireAdmin } from "./middlewares/auth.middleware.js";

// Routes
import profileRoutes from "./routes/profile.routes.js";
// import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

// Middleware
// import { authenticateToken, requireAdmin } from "./middlewares/auth.middleware.js";

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: [
      "https://devotee-memorial.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/profiles", profileRoutes);
// app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/offerings", offeringRoutes);

// ================= PUBLIC ROUTE =================
app.get("/api/accepted/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "accepted" }).lean();

    const memorialCards = profiles.map((profile) => ({
      id: profile._id,
      name: profile.name,
      years:
        profile.years ||
        `${profile.birthYear} - ${profile.deathYear}`,
      description: profile.description,
      location: profile.location,
      memories: profile.timeline?.length || 0,
      image: profile.coverImage,
    }));

    res.json(memorialCards);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin check
app.get("/api/admin/check", authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get all pending profiles
app.get("/api/admin/pending", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "pending" }).lean();
    res.json({ success: true, profiles });
  } catch {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

// Approve or decline a profile
app.patch("/api/admin/profiles/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const updated = await Profile.findByIdAndUpdate(
      id, { status }, { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, profile: updated });
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Edit a profile (admin only)
app.patch("/api/admin/profiles/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Profile.findByIdAndUpdate(
      id, { $set: req.body }, { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, profile: updated });
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get declined profiles
app.get("/api/admin/declined", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "declined" }).lean();
    res.json({ success: true, profiles });
  } catch {
    res.status(500).json({ error: "Failed to fetch declined profiles" });
  }
});

// Delete a profile
app.delete("/api/admin/profiles/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Profile.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, message: "Profile deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

export { app };