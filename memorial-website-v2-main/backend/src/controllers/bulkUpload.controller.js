import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { Profile } from "../models/profile.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
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
  { header: "Cover Image (URL or uploaded filename)", field: "coverImage", required: true },
  { header: "Banner Image (URL or uploaded filename)", field: "bannerImage" },
  { header: "Audio (URLs or uploaded filenames, comma-separated)", field: "audioFiles", list: true },
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
  "Cover Image (URL or uploaded filename)": "jayananda-das.jpg",
  "Banner Image (URL or uploaded filename)": "",
  "Audio (URLs or uploaded filenames, comma-separated)": "",
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

  // Second sheet: plain-language instructions, since "Cover Image (URL or
  // uploaded filename)" needs a bit more explanation than a column header
  // can carry on its own.
  const instructions = [
    ["How to fill this in"],
    [""],
    ["1. One row per devotee. Don't rename or reorder the columns on the Devotees sheet."],
    ["2. Required columns: Name, Death Date, Spiritual Master, Location, Description,"],
    ["   Cover Image, Contributor Name, Contributor Phone. Everything else is optional."],
    ["3. Dates must be in YYYY-MM-DD format, e.g. 2021-09-04."],
    [""],
    ["Cover Image / Banner Image / Audio columns — two ways to fill these in:"],
    ["  (a) A web address starting with http:// or https://, if the photo/audio is"],
    ["      already hosted somewhere, OR"],
    ["  (b) The exact filename of a photo/audio file you select in the \"Images\" picker"],
    ["      when you upload this spreadsheet — e.g. type \"jayananda-das.jpg\" here, and"],
    ["      choose a file named exactly jayananda-das.jpg (not case-sensitive) in the"],
    ["      upload dialog. Do not type a file path from your computer (e.g. C:\\Photos\\...)"],
    ["      — browsers can't send that to the server, only the file's own name."],
    [""],
    ["Multiple audio files for one devotee: separate filenames/URLs with a comma."],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(instructions);
  wsInfo["!cols"] = [{ wch: 90 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Instructions");

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

/** Builds a lookup from (lowercased) original filename -> local disk path,
 *  from the files multer saved under the "images" field. Lets a row say
 *  "jayananda-das.jpg" instead of needing the photo hosted somewhere first. */
function buildFileMap(imageFiles) {
  const map = new Map();
  for (const f of imageFiles ?? []) {
    map.set(f.originalname.trim().toLowerCase(), f.path);
  }
  return map;
}

/** Resolves one Cover Image / Banner Image / Audio cell to a Cloudinary
 *  URL. Tries, in order:
 *    1. It's already a URL → download it, then upload.
 *    2. It matches the filename of an uploaded local image (case-insensitive)
 *       → upload that file directly, no download step needed.
 *  Returns { url, reason } — reason is only set on failure, for row-level
 *  error reporting back to the admin. */
async function resolveMediaRef(ref, { fileMap, folder, label, resourceType = "image" }) {
  if (!ref) return { url: null, reason: null };

  if (isUrl(ref)) {
    try {
      const tempPath = await downloadToTemp(ref, label);
      try {
        const result = await uploadToCloudinary(tempPath, folder, resourceType);
        return result?.secure_url ? { url: result.secure_url, reason: null } : { url: null, reason: "Cloudinary upload failed" };
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } catch (err) {
      return { url: null, reason: `could not download ${ref}: ${err.message}` };
    }
  }

  const localPath = fileMap.get(String(ref).trim().toLowerCase());
  if (!localPath) {
    return {
      url: null,
      reason: `"${ref}" is not a URL and no uploaded file with that exact name was found`,
    };
  }
  try {
    const result = await uploadToCloudinary(localPath, folder, resourceType);
    return result?.secure_url ? { url: result.secure_url, reason: null } : { url: null, reason: "Cloudinary upload failed" };
  } catch (err) {
    return { url: null, reason: `upload failed: ${err.message}` };
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
  // No format check on coverImage/bannerImage/audioFiles here — each can be
  // either a URL or an uploaded-file reference, and we can't tell which was
  // intended (or whether the referenced file was actually attached) until
  // we have the uploaded files list, which parseRow doesn't see. That check
  // happens per-row later, once fileMap is available.

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
  // With upload.fields([...]), files land on req.files.<fieldname>, not
  // req.file — "file" is the spreadsheet (always an array, even for
  // maxCount: 1), "images" is whatever local photos were attached.
  const spreadsheetFile = req.files?.file?.[0];
  const imageFiles = req.files?.images ?? [];

  if (!spreadsheetFile) {
    throw new ApiError(400, "No spreadsheet uploaded. Attach an .xlsx, .xls, or .csv file as \"file\".");
  }

  const cleanupLocalFiles = () => {
    for (const f of [spreadsheetFile, ...imageFiles]) {
      if (f?.path && fs.existsSync(f.path)) {
        try {
          fs.unlinkSync(f.path);
        } catch {
          // best-effort cleanup — a leftover temp file isn't worth failing the request over
        }
      }
    }
  };

  const publishImmediately = req.body.publishImmediately !== "false";
  const status = publishImmediately ? "accepted" : "pending";
  const fileMap = buildFileMap(imageFiles);

  let workbook;
  try {
    workbook = XLSX.readFile(spreadsheetFile.path);
  } catch (err) {
    cleanupLocalFiles();
    throw new ApiError(400, `Could not read spreadsheet: ${err.message}`);
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rawRows.length === 0) {
    cleanupLocalFiles();
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

  // ── 3. Resolve + upload media (limited concurrency — this is a
  //       free-tier Cloudinary account, not a bulk-ingest pipeline).
  //       Each ref can be a URL (downloaded then uploaded) or the
  //       filename of one of the images attached in this same request. ──
  const uploadFailures = [];
  const docs = (
    await mapWithConcurrency(toProcess, 3, async (p) => {
      const cover = await resolveMediaRef(p.data.coverImage, {
        fileMap,
        folder: "iskcon/profiles",
        label: p.name,
      });
      if (!cover.url) {
        uploadFailures.push({ row: p.row, name: p.name, reason: cover.reason || "cover image upload failed" });
        return null;
      }

      const banner = p.data.bannerImage
        ? await resolveMediaRef(p.data.bannerImage, { fileMap, folder: "iskcon/banners", label: `${p.name}_banner` })
        : { url: "", reason: null };
      if (p.data.bannerImage && !banner.url) {
        // Banner is optional, so this doesn't block the row — just surface
        // it as a non-fatal note alongside any real failures.
        uploadFailures.push({ row: p.row, name: p.name, reason: `banner image skipped — ${banner.reason}` });
      }

      const audioFiles = [];
      for (const audioRef of p.data.audioFiles ?? []) {
        const audio = await resolveMediaRef(audioRef, {
          fileMap,
          folder: "iskcon/audio",
          label: `${p.name}_audio`,
          resourceType: "auto",
        });
        if (audio.url) {
          audioFiles.push(audio.url);
        } else {
          uploadFailures.push({ row: p.row, name: p.name, reason: `audio "${audioRef}" skipped — ${audio.reason}` });
        }
      }

      return {
        ...p.data,
        birthDate: p.data.birthDate ? new Date(p.data.birthDate) : undefined,
        deathDate: new Date(p.data.deathDate),
        coverImage: cover.url,
        bannerImage: banner.url || "",
        audioFiles,
        status,
        submittedBy: req.user?.id || null,
      };
    })
  ).filter(Boolean);

  cleanupLocalFiles();

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