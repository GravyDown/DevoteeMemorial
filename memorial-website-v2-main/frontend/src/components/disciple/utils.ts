/* Shared types + helpers for the DiscipleDetail page */

export type Profile = {
  _id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  location?: string;
  coverImage?: string;
  bannerImage?: string;
  description?: string;
  honorific?: string;
  spiritualMaster?: string;
  associatedTemple?: string;
  ashramRole?: string;
  coreServices?: string[];
  accountType?: string;
};

export type Offering = {
  _id: string;
  message: string;
  relation?: string;
  images?: string[];
  audios?: string[];
  videoLink?: string;
  createdAt: string;
};

export type OfferingType = "text" | "image" | "video" | "audio";
export type TypeFilter = "all" | OfferingType;

export type MediaItem = {
  type: "image" | "video" | "audio";
  src: string; // image url | video link | audio url
};

/* ── Brand tokens (kept in one place so the page stays consistent) ── */
export const C = {
  brand: "#804B23",
  brandDark: "#5C3418",
  cream: "#FFF8F0",
  cream2: "#FDF0E0",
  cream3: "#F5E6CC",
  text: "#2C1A0E",
  muted: "#7A5C42",
};

/* ── Profile helpers ── */
export const getYears = (p: Profile | null): string => {
  if (!p || (!p.birthDate && !p.deathDate)) return "";
  const b = p.birthDate ? new Date(p.birthDate).getFullYear() : "?";
  const d = p.deathDate ? new Date(p.deathDate).getFullYear() : "?";
  return `${b} – ${d}`;
};

export const getRoleLine = (p: Profile): string =>
  [p.ashramRole, ...(p.coreServices ?? [])].filter(Boolean).join(" · ");

/* ── Video helpers (moved from OfferingCard) ── */
const YT =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const VIMEO =
  /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;

export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const y = url.match(YT);
  if (y?.[1]) return `https://www.youtube.com/embed/${y[1]}`;
  const v = url.match(VIMEO);
  if (v?.[1]) return `https://player.vimeo.com/video/${v[1]}`;
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com/video/"))
    return url;
  return null;
};

export const getYouTubeThumbnail = (url: string): string | null => {
  const m = url.match(YT);
  return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

/* ── Offering helpers ── */
export const getTypes = (o: Offering): OfferingType[] => {
  const t: OfferingType[] = [];
  if (o.images?.length) t.push("image");
  if (o.videoLink) t.push("video");
  if (o.audios?.length) t.push("audio");
  return t.length ? t : ["text"];
};

export const matchesType = (o: Offering, f: TypeFilter) =>
  f === "all" || getTypes(o).includes(f);

export const getYear = (o: Offering) => new Date(o.createdAt).getFullYear();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const getInitial = (s?: string, fallback = "D") =>
  (s?.trim()?.[0] ?? fallback).toUpperCase();

/* Flatten every media item of every offering (for the gallery + stats) */
export const collectMedia = (offerings: Offering[]): MediaItem[] =>
  offerings.flatMap((o) => [
    ...(o.images ?? []).map((src) => ({ type: "image" as const, src })),
    ...(o.videoLink ? [{ type: "video" as const, src: o.videoLink }] : []),
    ...(o.audios ?? []).map((src) => ({ type: "audio" as const, src })),
  ]);
