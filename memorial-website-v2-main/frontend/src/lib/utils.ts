import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown, fallback = "An error occurred"): string {
  if (typeof err === "string") return err;
  if (!err) return fallback;
  if (typeof err === "object") {
    const anyErr = err as Record<string, any>;
    const data = anyErr.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      if (typeof data.message === "string") return data.message;
      if (typeof data.error === "string") return data.error;
      if (data.error && typeof data.error.message === "string") return data.error.message;
      if (data.message && typeof data.message.message === "string") return data.message.message;
    }
    if (typeof anyErr.message === "string") return anyErr.message;
    if (typeof anyErr.error === "string") return anyErr.error;
  }
  return fallback;
}
