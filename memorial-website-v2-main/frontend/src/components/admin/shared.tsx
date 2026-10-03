import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";

/* ────────────────────────────────────────────────────────
 * Shared types — same shapes the old AdminDashboard.tsx used,
 * kept here so every panel imports from one place.
 * ──────────────────────────────────────────────────────── */
export type ProfileStatus = "pending" | "accepted" | "declined";
export type OfferingStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  name: string;
  years: string;
  location: string;
  description: string;
  coverImage: string;
  contributorName: string;
  contributorPhone: string;
  spiritualMaster: string;
  honorific: string;
  ashramRole: string;
  accountType: string;
  status: ProfileStatus;
  createdAt: string;
  isEditing: boolean;
  editData: Record<string, string>;
}

export interface Offering {
  id: string;
  profileId: string;
  profileName: string;
  profileLocation: string;
  message: string;
  relation: string;
  images: string[];
  audios: string[];
  videoLink: string;
  status: OfferingStatus;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  profilesSubmitted: number;
  createdAt: string;
}

export interface Stats {
  totalProfiles: number;
  pendingProfiles: number;
  totalOfferings: number;
  totalUsers: number;
  profilesThisMonth: number;
  offeringsThisMonth: number;
  usersThisWeek: number;
}

/* ────────────────────────────────────────────────────────
 * Pending-count context — lets ProfilesPanel/OfferingsPanel (rendered
 * as routed pages) report counts up to the sidebar's badges, and lets
 * Overview feed in /admin/stats' pendingProfiles too. Lives here
 * rather than in AdminDashboard.tsx so Overview.tsx (which needs the
 * hook) and AdminDashboard.tsx (which provides it) don't import each
 * other and create a circular dependency.
 * ──────────────────────────────────────────────────────── */
export interface PendingCounts {
  profiles: number;
  offerings: number;
  setProfiles: (n: number) => void;
  setOfferings: (n: number) => void;
}
export const PendingCountsContext = createContext<PendingCounts | null>(null);

export function usePendingCounts() {
  const ctx = useContext(PendingCountsContext);
  if (!ctx) throw new Error("usePendingCounts must be used within AdminDashboard");
  return ctx;
}

/* ────────────────────────────────────────────────────────
 * Small shared bits
 * ──────────────────────────────────────────────────────── */

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    declined: "bg-red-50 text-red-600 ring-1 ring-red-200",
    rejected: "bg-red-50 text-red-600 ring-1 ring-red-200",
  };
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/** Avatar that shows a real cover image when available, falling back to an
 *  initial letter — the old dashboard never rendered coverImage at all, so
 *  admins were approving submitted photos without ever seeing them. */
export function ThumbAvatar({
  label,
  src,
  size = 36,
  rounded = "rounded-full",
}: {
  label: string;
  src?: string;
  size?: number;
  rounded?: string;
}) {
  const [errored, setErrored] = useState(false);
  const show = src && !errored;
  return (
    <div
      className={`${rounded} bg-[#F5E6CC] text-[#5C3418] flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden ring-1 ring-black/5`}
      style={{ width: size, height: size }}
    >
      {show ? (
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover object-top"
          onError={() => setErrored(true)}
        />
      ) : (
        (label || "?").charAt(0).toUpperCase()
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  delta?: string;
  icon?: ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#8D6E63]/10 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-[#8D6E63]">{label}</p>
        {icon && (
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-[#FDF0E0] text-[#804B23]"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold mt-2 text-[#5D4037]">{value}</p>
      {delta && <p className="text-[11px] mt-1 text-[#8D6E63]">{delta}</p>}
    </div>
  );
}

export function FilterTabs({
  options,
  active,
  onChange,
}: {
  options: { value: string; label: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            active === opt.value
              ? "bg-[#804B23] text-white border-[#804B23]"
              : "bg-white text-[#8D6E63] border-[#8D6E63]/25 hover:border-[#804B23]/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-[#8D6E63]/20 rounded-full px-3 py-1.5 focus-within:border-[#804B23]/50 transition-colors">
      <Search className="w-3.5 h-3.5 text-[#8D6E63]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs outline-none w-32 sm:w-40 text-[#5D4037] bg-transparent"
      />
    </div>
  );
}

export function PanelHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2">
      <div>
        <h2 className="text-base font-semibold text-[#5D4037]">{title}</h2>
        {subtitle && <p className="text-[11px] text-[#8D6E63] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 text-xs text-[#8D6E63]">{right}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
 * Confirm dialog — used before Decline / Reject, so a single
 * accidental click can no longer reject someone's submission.
 * ──────────────────────────────────────────────────────── */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = true,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#804B23] hover:bg-[#6d3f1d] text-white"}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ────────────────────────────────────────────────────────
 * Pagination — client-side (the API returns full lists with no
 * page/limit params today), but gives real paging UX instead of
 * dumping every row into the DOM at once.
 * ──────────────────────────────────────────────────────── */
export function usePagedList<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );
  // Reset to page 1 whenever the underlying filtered list meaningfully
  // changes size (e.g. a new filter/search) and the current page is now
  // out of range.
  if (page !== safePage) setPage(safePage);
  return { page: safePage, setPage, totalPages, paged, total: items.length };
}

export function PaginationBar({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  return (
    <div className="px-5 py-3 border-t border-[#8D6E63]/8 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onChange(page - 1)}
              className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((p, i) => (
            <PaginationItem key={p}>
              {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-[#8D6E63]">…</span>}
              <PaginationLink isActive={p === page} onClick={() => onChange(p)} className="cursor-pointer">
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && onChange(page + 1)}
              className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
 * Bulk action bar — appears once at least one row is selected.
 * ──────────────────────────────────────────────────────── */
export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-[#804B23]/5 border-y border-[#804B23]/15 flex-wrap">
      <span className="text-xs font-medium text-[#5D4037]">{count} selected</span>
      <div className="flex items-center gap-2">{children}</div>
      <button onClick={onClear} className="text-xs text-[#8D6E63] hover:text-[#804B23] ml-1">
        Clear selection
      </button>
    </div>
  );
}

export function LoadingRows({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="divide-y divide-[#8D6E63]/8">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3 px-5 py-3.5">
          <div className="w-9 h-9 rounded-full bg-[#F5E6CC] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-[#F5E6CC] rounded animate-pulse w-1/3" />
            <div className="h-2.5 bg-[#F5E6CC]/60 rounded animate-pulse w-1/4" />
          </div>
          {Array.from({ length: cols - 1 }).map((__, c) => (
            <div key={c} className="h-3 bg-[#F5E6CC]/60 rounded animate-pulse w-16 hidden sm:block" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, text, hint }: { icon?: ReactNode; text: string; hint?: string }) {
  return (
    <div className="text-center py-14 px-5">
      {icon && <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FDF0E0] text-[#804B23] flex items-center justify-center">{icon}</div>}
      <p className="text-sm text-[#5D4037] font-medium">{text}</p>
      {hint && <p className="text-xs text-[#8D6E63] mt-1">{hint}</p>}
    </div>
  );
}