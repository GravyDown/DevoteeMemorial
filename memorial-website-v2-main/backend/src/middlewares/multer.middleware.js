import multer from "multer";
import path from "path";
import fs from "fs";

const tempDir = "./public/temp";

// Ensure temp folder exists — same guard offeringmulter.middleware.js already
// uses. Without this, a fresh deploy (e.g. Render) has no public/temp folder
// at all, since git doesn't track empty directories, and multer throws
// ENOENT the moment the first file upload hits this middleware.
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});