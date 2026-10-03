import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Profile } from "./models/profile.models.js";
import { Offering } from "./models/offering.models.js";
import { User } from "./models/user.models.js";
import offeringRoutes from "./routes/offering.routes.js";
import { authenticateToken, requireAdmin } from "./middlewares/auth.middleware.js";
import { upload } from "./middlewares/multer.middleware.js";
import { downloadBulkTemplate, bulkUploadProfiles } from "./controllers/bulkUpload.controller.js";

// Routes
import profileRoutes from "./routes/profile.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// ================= MIDDLEWARE =================
const allowedOrigins = [
  "https://devotee-memorial-ten.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/profiles", profileRoutes);
app.use("/api/auth", authRoutes);
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

// Dashboard stat cards (total/pending profiles, total offerings, total users + deltas)
app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalProfiles,
      pendingProfiles,
      totalOfferings,
      totalUsers,
      profilesThisMonth,
      offeringsThisMonth,
      usersThisWeek,
    ] = await Promise.all([
      Profile.countDocuments({}),
      Profile.countDocuments({ status: "pending" }),
      Offering.countDocuments({}),
      User.countDocuments({}),
      Profile.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Offering.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalProfiles,
        pendingProfiles,
        totalOfferings,
        totalUsers,
        profilesThisMonth,
        offeringsThisMonth,
        usersThisWeek,
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Bulk devotee upload — download the spreadsheet template, or submit a
// filled-in one. Both admin-only, same as every other /api/admin/* route.
app.get("/api/admin/profiles/bulk-upload/template", authenticateToken, requireAdmin, downloadBulkTemplate);
app.post(
  "/api/admin/profiles/bulk-upload",
  authenticateToken,
  requireAdmin,
  // "file" = the spreadsheet itself (one). "images" = any local photos the
  // admin is uploading alongside it (many), referenced by filename from
  // the spreadsheet's Cover Image / Banner Image columns instead of a URL.
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  bulkUploadProfiles,
);

// Delete a profile
app.delete("/api/admin/profiles/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Profile.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, message: "Profile deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: message,
    errors: err.errors || [],
  });
});

export { app };