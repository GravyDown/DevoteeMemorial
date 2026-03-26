import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Profile } from "./models/profile.models.js";
import offeringRoutes from "./routes/offering.routes.js";

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

export { app };