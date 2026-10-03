import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { Profile } from "../models/profile.models.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ── Column contract ──────────────────────────────────────
 * The admin-facing spreadsheet uses human-readable headers (so it's
 * actually fillable by a non-technical person in Excel), mapped here to
 * the Profile schema's field names. Keep this list and the template
 * generator below in sync — they're deliberately kept side by side. */
const COLUMNS = [
  { header: "Name", field: "name", required: true },
  { header: "Honorific", field: "honorific" },
  { header: "Birth Date (YYYY-MM-DD)", field: "birthDate" },
  { header: "Death Date (YYYY-MM-DD)", field: "deathDate", required: true },
  { header: "Spiritual Master", field: "spiritualMaster", required: true },
  { header: "Associated Temple", field: "associatedTemple" },
  { header: "Ashram Role", field: "ashramRole" },
  { header: "Core Services (comma-separated)", field: "coreServices", list: true },
  { header: "Account Type", field: "accountType" },
  { header: "Location", field: "location", required: true },
  { header: "Description", field: "description", required: true },
  { header: "Cover Image URL", field: "coverImage", required: true },
  { header: "Banner Image URL", field: "bannerImage" },
  { header: "Audio URLs (comma-separated)", field: "audioFiles", list: true },
  { header: "Contributor Name", field: "contributorName", required: true },
  { header: "Contributor Phone", field: "contributorPhone", required: true },
  { header: "Birth Place", field: "birthPlace" },
  { header: "Spiritual Lineage", field: "spiritualLineage" },
  { header: "Notable Works", field: "notableWorks" },
  { header: "Philosophical Contributions", field: "philosophicalContributions" },
  { header: "Disciples", field: "disciples" },
  { header: "Memorial Location", field: "memorialLocation" },
  { header: "Key Achievements (comma-separated)", field: "keyAchievements", list: true },
];

const SAMPLE_ROW = {
  "Name": "HG Example Devotee Das",
  "Honorific": "His Grace",
  "Birth Date (YYYY-MM-DD)": "1950-03-12",
  "Death Date (YYYY-MM-DD)": "2021-09-04",
  "Spiritual Master": "Srila Prabhupada",
  "Associated Temple": "ISKCON Delhi",
  "Ashram Role": "Grihastha",
  "Core Services (comma-separated)": "Kirtan, Book Distribution",
  "Account Type": "Memorial",
  "Location": "Delhi, India",
  "Description": "A short, genuine paragraph about this devotee's life and service.",
  "Cover Image URL": "https://example.com/photos/example-devotee.jpg",
  "Banner Image URL": "",
  "Audio URLs (comma-separated)": "",
  "Contributor Name": "Admin",
  "Contributor Phone": "9876543210",
  "Birth Place": "Delhi, India",
  "Spiritual Lineage": "",
  "Notable Works": "",
  "Philosophical Contributions": "",
  "Disciples": "",
  "Memorial Location": "ISKCON Delhi",
  "Key Achievements (comma-separated)": "Served as temple treasurer for 15 years",
};

/* GET /api/admin/profiles/bulk-upload/template
 * Always generated from COLUMNS, so it can never drift out of sync with
 * what the upload endpoint actually accepts. */
export const downloadBulkTemplate = asyncHandler(async (req, res) => {
  const headers = COLUMNS.map((c) => c.header);
  const ws = XLSX.utils.json_to_sheet([SAMPLE_ROW], { header: headers });
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(18, h.length) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Devotees");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", 'attachment; filename="devotees-upload-template.xlsx"');
  res.send(buffer);
});

/* ── Helpers (same shape as bulk-add-devotees.js's standalone script,
 *   inlined here since this runs inside the request lifecycle rather
 *   than as a one-off CLI process) ── */

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

async function downloadToTemp(url, label) {
  const tempDir = path.join(__dirname, "..", "public", "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const tempPath = path.join(tempDir, `bulk_${label.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}${ext}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  fs.writeFileSync(tempPath, await res.buffer());
  return tempPath;
}

async function uploadMediaUrl(url, { folder, label, resourceType = "image" }) {
  if (!url || !isUrl(url)) return null;
  const tempPath = await downloadToTemp(url, label);
  try {
    const result = await uploadToCloudinary(tempPath, folder, resourceType);
    return result?.secure_url ?? null;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Maps one spreadsheet row (keyed by header text) into the shape this
 *  endpoint works with internally (keyed by schema field name), and
 *  validates required fields. Returns { data, errors }. */
function parseRow(rawRow, rowNumber) {
  const data = {};
  const errors = [];

  for (const col of COLUMNS) {
    const raw = rawRow[col.header];
    const value = typeof raw === "string" ? raw.trim() : raw;
    if (col.required && !value) {
      errors.push(`missing "${col.header}"`);
      continue;
    }
    if (!value) continue;
    data[col.field] = col.list ? splitList(value) : value;
  }

  if (data.deathDate && isNaN(new Date(data.deathDate).getTime())) {
    errors.push('"Death Date" is not a valid date');
  }
  if (data.birthDate && isNaN(new Date(data.birthDate).getTime())) {
    errors.push('"Birth Date" is not a valid date');
  }
  if (
    data.birthDate &&
    data.deathDate &&
    !isNaN(new Date(data.birthDate).getTime()) &&
    !isNaN(new Date(data.deathDate).getTime()) &&
    new Date(data.deathDate) <= new Date(data.birthDate)
  ) {
    errors.push('"Death Date" must be after "Birth Date"');
  }
  if (data.coverImage && !isUrl(data.coverImage)) {
    errors.push('"Cover Image URL" must be a URL starting with http(s):// — local file paths cannot be used from a browser upload');
  }

  return {
    row: rowNumber,
    name: data.name || "(unnamed)",
    data,
    errors,
  };
}

/* POST /api/admin/profiles/bulk-upload
 * multipart/form-data, field name "file" (.xlsx/.xls/.csv), plus an
 * optional "publishImmediately" field ("true"/"false", default true since
 * this endpoint is admin-only to begin with). */
export const bulkUploadProfiles = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded. Attach an .xlsx, .xls, or .csv file as \"file\".");

  const publishImmediately = req.body.publishImmediately !== "false";
  const status = publishImmediately ? "accepted" : "pending";

  let workbook;
  try {
    workbook = XLSX.readFile(req.file.path);
  } catch (err) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(400, `Could not read spreadsheet: ${err.message}`);
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  fs.unlinkSync(req.file.path); // done with the uploaded spreadsheet itself

  if (rawRows.length === 0) {
    throw new ApiError(400, "The spreadsheet has no data rows.");
  }

  // ── 1. Parse + validate every row up front ──
  const parsed = rawRows.map((r, i) => parseRow(r, i + 2)); // +2: header row + 1-indexing
  const invalid = parsed.filter((p) => p.errors.length > 0);
  const valid = parsed.filter((p) => p.errors.length === 0);

  // ── 2. Skip devotees already in the database (name + deathDate match) ──
  const skippedDuplicates = [];
  const toProcess = [];
  for (const p of valid) {
    const existing = await Profile.findOne({
      name: p.data.name,
      deathDate: new Date(p.data.deathDate),
    }).select("_id");
    if (existing) {
      skippedDuplicates.push({ row: p.row, name: p.name });
    } else {
      toProcess.push(p);
    }
  }

  // ── 3. Upload images (limited concurrency — this is a free-tier
  //       Cloudinary account, not a bulk-ingest pipeline) ──
  const uploadFailures = [];
  const docs = (
    await mapWithConcurrency(toProcess, 3, async (p) => {
      const coverImage = await uploadMediaUrl(p.data.coverImage, {
        folder: "iskcon/profiles",
        label: p.name,
      }).catch(() => null);
      if (!coverImage) {
        uploadFailures.push({ row: p.row, name: p.name, reason: "cover image upload failed" });
        return null;
      }
      const bannerImage = p.data.bannerImage
        ? await uploadMediaUrl(p.data.bannerImage, { folder: "iskcon/banners", label: `${p.name}_banner` }).catch(() => "")
        : "";

      const audioFiles = [];
      for (const audioUrl of p.data.audioFiles ?? []) {
        const uploaded = await uploadMediaUrl(audioUrl, {
          folder: "iskcon/audio",
          label: `${p.name}_audio`,
          resourceType: "auto",
        }).catch(() => null);
        if (uploaded) audioFiles.push(uploaded);
      }

      return {
        ...p.data,
        birthDate: p.data.birthDate ? new Date(p.data.birthDate) : undefined,
        deathDate: new Date(p.data.deathDate),
        coverImage,
        bannerImage: bannerImage || "",
        audioFiles,
        status,
        submittedBy: req.user?.id || null,
      };
    })
  ).filter(Boolean);

  // ── 4. Insert in one batch (ordered:false so one bad doc doesn't
  //       block the rest) ──
  let inserted = [];
  const insertErrors = [];
  if (docs.length > 0) {
    try {
      inserted = await Profile.insertMany(docs, { ordered: false });
    } catch (err) {
      const writeErrors = err.writeErrors ?? [];
      inserted = err.insertedDocs ?? [];
      writeErrors.forEach((we) =>
        insertErrors.push({ name: docs[we.index]?.name ?? "?", reason: we.errmsg }),
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {
      totalRows: rawRows.length,
      inserted: inserted.map((p) => ({ id: p._id, name: p.name })),
      insertedCount: inserted.length,
      skippedDuplicates,
      rowErrors: invalid.map((p) => ({ row: p.row, name: p.name, errors: p.errors })),
      uploadFailures,
      insertErrors,
    },
    `${inserted.length} of ${rawRows.length} rows added.`,
    ),
  );
});