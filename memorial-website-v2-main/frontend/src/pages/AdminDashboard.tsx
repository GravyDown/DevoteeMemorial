import { useCallback, useEffect, useRef, useState, Fragment, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LayoutDashboard,
  UserCheck,
  Heart,
  Users as UsersIcon,
  Settings,
  ShieldCheck,
  ChevronDown,
  MoreVertical,
  Search,
  RefreshCw,
  Check,
  X,
  Pencil,
  Save,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  ExternalLink,
  LogOut,
  UserPlus,
} from "lucide-react";

// Brand colors are inlined as Tailwind arbitrary values (e.g. bg-[#804B23])
// throughout this file, matching Navbar.tsx, rather than kept as JS consts —
// Tailwind's class extraction needs the literal strings, not variables.
// "font-script" (Sacramento) is defined in index.css's @theme block.

// ── Types ────────────────────────────────────────────────
type ProfileStatus = "pending" | "accepted" | "declined";
type OfferingStatus = "pending" | "approved" | "rejected";

interface Profile {
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

interface Offering {
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

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  profilesSubmitted: number;
  createdAt: string;
}

interface Stats {
  totalProfiles: number;
  pendingProfiles: number;
  totalOfferings: number;
  totalUsers: number;
  profilesThisMonth: number;
  offeringsThisMonth: number;
  usersThisWeek: number;
}

// ── Small shared bits ────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-emerald-50 text-emerald-700",
    approved: "bg-emerald-50 text-emerald-700",
    declined: "bg-red-50 text-red-600",
    rejected: "bg-red-50 text-red-600",
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

function Avatar({ label }: { label: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#F5E6CC] text-[#5C3418] flex items-center justify-center text-sm font-semibold shrink-0">
      {(label || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function StatCard({ label, value, delta }: { label: string; value: number; delta?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#8D6E63]/10">
      <p className="text-[11px] uppercase tracking-wide text-[#8D6E63]">{label}</p>
      <p className="text-2xl font-semibold mt-1 text-[#5D4037]">{value}</p>
      {delta && <p className="text-[11px] mt-1 text-[#8D6E63]">{delta}</p>}
    </div>
  );
}

function FilterTabs({
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

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-[#8D6E63]/20 rounded-full px-3 py-1.5">
      <Search className="w-3.5 h-3.5 text-[#8D6E63]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs outline-none w-32 text-[#5D4037] bg-transparent"
      />
    </div>
  );
}

function Kebab({
  actions,
}: {
  actions: { label: string; icon: ReactNode; danger?: boolean; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-7 h-7 rounded-md border border-[#8D6E63]/20 bg-white flex items-center justify-center text-[#8D6E63] hover:bg-[#FDF0E0]"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-[#8D6E63]/15 rounded-lg shadow-lg min-w-[140px] z-20 py-1">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                a.onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#FDF0E0] ${
                a.danger ? "text-red-600" : "text-[#5D4037]"
              }`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar (scroll-links to sections on the single dashboard page) ──
function Sidebar({
  pendingProfiles,
  pendingOfferings,
  onJump,
}: {
  pendingProfiles: number;
  pendingOfferings: number;
  onJump: (section: "top" | "profiles" | "offerings" | "users") => void;
}) {
  return (
    <div className="bg-white border-r border-[#8D6E63]/10 w-[190px] shrink-0 py-4 hidden md:block sticky top-0 h-screen overflow-y-auto">
      <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] px-4 mb-2">Overview</p>
      <button
        onClick={() => onJump("top")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#804B23] bg-[#FDF0E0] border-r-2 border-[#804B23]"
      >
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </button>

      <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] px-4 mb-2 mt-5">Moderation</p>
      <button
        onClick={() => onJump("profiles")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#8D6E63] hover:bg-[#FDF0E0]/60 hover:text-[#804B23] transition-colors"
      >
        <UserCheck className="w-4 h-4" />
        Profiles
        {!!pendingProfiles && (
          <span className="ml-auto bg-[#804B23] text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {pendingProfiles}
          </span>
        )}
      </button>
      <button
        onClick={() => onJump("offerings")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#8D6E63] hover:bg-[#FDF0E0]/60 hover:text-[#804B23] transition-colors"
      >
        <Heart className="w-4 h-4" />
        Offerings
        {!!pendingOfferings && (
          <span className="ml-auto bg-[#804B23] text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {pendingOfferings}
          </span>
        )}
      </button>

      <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] px-4 mb-2 mt-5">Management</p>
      <button
        onClick={() => onJump("users")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#8D6E63] hover:bg-[#FDF0E0]/60 hover:text-[#804B23] transition-colors"
      >
        <UsersIcon className="w-4 h-4" />
        Users
      </button>
      <div className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#8D6E63]/50 cursor-not-allowed">
        <Settings className="w-4 h-4" />
        Settings
      </div>
    </div>
  );
}

function AdminTopBar({ email, onLogout }: { email?: string; onLogout: () => void }) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#8D6E63]/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border border-[#804B23] flex items-center justify-center text-[#804B23] text-sm font-serif">
          V
        </div>
        <span className="font-medium text-[#5D4037] text-sm">Vaishnava Memorial</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 bg-[#FDF0E0] text-[#8D6E63] text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
        <a href="/" className="hidden sm:flex items-center gap-1 text-xs text-[#8D6E63] hover:text-[#804B23]">
          View site <ExternalLink className="w-3 h-3" />
        </a>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#804B23] text-white flex items-center justify-center text-[11px] font-medium">
            {(email || "A").charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} className="text-xs text-[#8D6E63] hover:text-red-600 flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function PanelHeader({ title, right }: { title: string; right: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2">
      <h2 className="text-base font-semibold text-[#5D4037]">{title}</h2>
      <div className="flex items-center gap-3 text-xs text-[#8D6E63]">{right}</div>
    </div>
  );
}

// ── Profiles table ───────────────────────────────────────
function ProfileDetailRow({
  profile,
  onEdit,
  onSave,
  onFieldChange,
}: {
  profile: Profile;
  onEdit: (id: string) => void;
  onSave: (id: string) => void;
  onFieldChange: (id: string, key: string, value: string) => void;
}) {
  const field = (key: string, label: string, multiline = false) => (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wide text-[#8D6E63]">{label}</p>
      {profile.isEditing ? (
        multiline ? (
          <textarea
            value={profile.editData[key] ?? (profile[key as keyof Profile] as string) ?? ""}
            onChange={(e) => onFieldChange(profile.id, key, e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg p-2 text-[#5D4037] resize-none focus:outline-none focus:ring-1 focus:ring-[#8D6E63]"
          />
        ) : (
          <Input
            value={profile.editData[key] ?? (profile[key as keyof Profile] as string) ?? ""}
            onChange={(e) => onFieldChange(profile.id, key, e.target.value)}
            className="h-9 text-sm text-[#5D4037] border-gray-200"
          />
        )
      ) : (
        <p className="text-sm text-[#5D4037]">
          {(profile[key as keyof Profile] as string) || <span className="text-gray-400 italic">Not provided</span>}
        </p>
      )}
    </div>
  );

  return (
    <tr className="bg-[#FFFCF8]">
      <td colSpan={4} className="px-5 pb-4 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          {field("name", "Devotee Name")}
          {field("spiritualMaster", "Initiating Guru")}
          {field("years", "Life Years")}
          {field("location", "Location")}
          {field("honorific", "Honorific")}
          {field("ashramRole", "Ashram / Role")}
          {field("contributorName", "Submitted By")}
          {field("contributorPhone", "Contact")}
        </div>
        <div className="mb-3">{field("description", "About", true)}</div>
        <div className="flex justify-end">
          {profile.isEditing ? (
            <Button onClick={() => onSave(profile.id)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          ) : (
            <Button onClick={() => onEdit(profile.id)} variant="outline" className="h-8 text-xs border-[#8D6E63]/30 text-[#5D4037]">
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit fields
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function ProfilesPanel({ onPendingCountChange }: { onPendingCountChange: (n: number) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ProfileStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const format = (list: any[], status: ProfileStatus): Profile[] =>
    list.map((p) => ({
      id: p._id,
      name: p.name || "",
      years: p.years || "",
      location: p.location || "",
      description: p.description || "",
      coverImage: p.coverImage || "",
      contributorName: p.contributorName || "",
      contributorPhone: p.contributorPhone || "",
      spiritualMaster: p.spiritualMaster || "",
      honorific: p.honorific || "",
      ashramRole: p.ashramRole || "",
      accountType: p.accountType || "",
      status: p.status || status,
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "",
      isEditing: false,
      editData: {},
    }));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, declinedRes, acceptedRes] = await Promise.all([
        api.get("/admin/pending"),
        api.get("/admin/declined"),
        api.get("/profiles"),
      ]);
      const merged = [
        ...format(pendingRes.data.profiles || [], "pending"),
        ...format(declinedRes.data.profiles || [], "declined"),
        ...format(acceptedRes.data.profiles || [], "accepted"),
      ];
      setProfiles(merged);
      onPendingCountChange(pendingRes.data.profiles?.length || 0);
    } catch {
      toast.error("Failed to load profiles.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/profiles/${id}/status`, { status: "accepted" });
      setProfiles((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, status: "accepted" as ProfileStatus } : p));
        onPendingCountChange(next.filter((p) => p.status === "pending").length);
        return next;
      });
      toast.success("Memorial approved and published.");
    } catch {
      toast.error("Failed to approve.");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.patch(`/admin/profiles/${id}/status`, { status: "declined" });
      setProfiles((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, status: "declined" as ProfileStatus } : p));
        onPendingCountChange(next.filter((p) => p.status === "pending").length);
        return next;
      });
      toast.success("Memorial declined.");
    } catch {
      toast.error("Failed to decline.");
    }
  };

  const handleEdit = (id: string) => {
    setExpandedId(id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, isEditing: true, editData: {} } : p)));
  };

  const handleFieldChange = (id: string, key: string, value: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, editData: { ...p.editData, [key]: value } } : p)));
  };

  const handleSave = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile || Object.keys(profile.editData).length === 0) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, isEditing: false } : p)));
      return;
    }
    try {
      await api.patch(`/admin/profiles/${id}/edit`, profile.editData);
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...profile.editData, isEditing: false, editData: {} } : p))
      );
      toast.success("Changes saved.");
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const visible = profiles.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: profiles.length,
    pending: profiles.filter((p) => p.status === "pending").length,
    accepted: profiles.filter((p) => p.status === "accepted").length,
    declined: profiles.filter((p) => p.status === "declined").length,
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8D6E63]/10 overflow-hidden">
      <PanelHeader
        title="Pending profile reviews"
        right={
          <>
            <button onClick={fetchAll} className="hover:text-[#804B23]">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span>{counts.pending} profiles awaiting review</span>
          </>
        }
      />

      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-[#FFF8F0] border-y border-[#8D6E63]/8 flex-wrap">
        <FilterTabs
          active={filter}
          onChange={(v) => setFilter(v as any)}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "pending", label: `Pending (${counts.pending})` },
            { value: "accepted", label: `Approved (${counts.accepted})` },
            { value: "declined", label: `Declined (${counts.declined})` },
          ]}
        />
        <SearchBox value={search} onChange={setSearch} placeholder="Search…" />
      </div>

      {loading ? (
        <p className="text-center text-sm text-[#8D6E63] py-10 animate-pulse">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-sm text-[#8D6E63] py-10">No profiles match this view.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-[#8D6E63] bg-[#FFF8F0]">
              <th className="text-left font-medium px-5 py-2">Devotee</th>
              <th className="text-left font-medium px-4 py-2 w-28">Status</th>
              <th className="text-left font-medium px-4 py-2 w-28 hidden sm:table-cell">Submitted</th>
              <th className="px-4 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <Fragment key={p.id}>
                <tr className="border-t border-[#8D6E63]/8 hover:bg-[#FFFCF8]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar label={p.name} />
                      <div className="min-w-0">
                        <p className="font-medium text-[#5D4037] truncate">{p.name || "Untitled"}</p>
                        <p className="text-[11px] text-[#8D6E63] truncate">
                          {p.contributorName} · {p.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#8D6E63] hidden sm:table-cell">{p.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="w-7 h-7 rounded-md border border-[#8D6E63]/20 bg-white flex items-center justify-center text-[#8D6E63] hover:bg-[#FDF0E0]"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === p.id ? "rotate-180" : ""}`} />
                      </button>
                      <Kebab
                        actions={[
                          { label: "Approve", icon: <Check className="w-3.5 h-3.5" />, onClick: () => handleApprove(p.id) },
                          { label: "Decline", icon: <X className="w-3.5 h-3.5" />, danger: true, onClick: () => handleDecline(p.id) },
                          { label: "Edit", icon: <Pencil className="w-3.5 h-3.5" />, onClick: () => handleEdit(p.id) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
                {expandedId === p.id && (
                  <ProfileDetailRow profile={p} onEdit={handleEdit} onSave={handleSave} onFieldChange={handleFieldChange} />
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Offerings table ──────────────────────────────────────
function offeringTypeBadge(o: Offering) {
  if (o.images.length) return { label: "Image", icon: <ImageIcon className="w-3 h-3" />, cls: "bg-blue-50 text-blue-700" };
  if (o.videoLink) return { label: "Video", icon: <Video className="w-3 h-3" />, cls: "bg-pink-50 text-pink-700" };
  if (o.audios.length) return { label: "Audio", icon: <Music className="w-3 h-3" />, cls: "bg-teal-50 text-teal-700" };
  return { label: "Text", icon: <FileText className="w-3 h-3" />, cls: "bg-[#F5E6CC] text-[#5C3418]" };
}

function OfferingDetailRow({ offering }: { offering: Offering }) {
  return (
    <tr className="bg-[#FFFCF8]">
      <td colSpan={5} className="px-5 pb-4 pt-1 space-y-3">
        <div className="bg-[#FDF0E0] rounded-lg p-3 text-sm text-[#5D4037] italic leading-relaxed">
          "{offering.message}"
        </div>
        {offering.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {offering.images.map((src) => (
              <img key={src} src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
        {offering.audios.length > 0 && (
          <div className="space-y-1">
            {offering.audios.map((src) => (
              <audio key={src} controls src={src} className="w-full h-8" />
            ))}
          </div>
        )}
        {offering.videoLink && (
          <a
            href={offering.videoLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-blue-700 bg-[#FDF0E0] rounded-lg p-2.5 w-fit"
          >
            <Video className="w-3.5 h-3.5" /> {offering.videoLink}
          </a>
        )}
      </td>
    </tr>
  );
}

function OfferingsPanel({ onPendingCountChange }: { onPendingCountChange: (n: number) => void }) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OfferingStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const format = (list: any[]): Offering[] =>
    list.map((o) => ({
      id: o._id,
      profileId: o.profile?._id || o.profile || "",
      profileName: o.profile?.name || "",
      profileLocation: o.profile?.location || "",
      message: o.message || "",
      relation: o.relation || "",
      images: o.images || [],
      audios: o.audios || [],
      videoLink: o.videoLink || "",
      status: o.status || "pending",
      createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "",
    }));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/offerings/admin/all");
      const list = format(res.data.offerings || []);
      setOfferings(list);
      onPendingCountChange(list.filter((o) => o.status === "pending").length);
    } catch {
      toast.error("Failed to load offerings.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateStatus = async (id: string, status: OfferingStatus) => {
    try {
      await api.patch(`/offerings/${id}/status`, { status });
      const next = offerings.map((o) => (o.id === id ? { ...o, status } : o));
      setOfferings(next);
      onPendingCountChange(next.filter((o) => o.status === "pending").length);
      toast.success(status === "approved" ? "Offering approved." : "Offering rejected.");
    } catch {
      toast.error("Failed to update offering.");
    }
  };

  const visible = offerings.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.profileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: offerings.length,
    pending: offerings.filter((o) => o.status === "pending").length,
    approved: offerings.filter((o) => o.status === "approved").length,
    rejected: offerings.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8D6E63]/10 overflow-hidden">
      <PanelHeader
        title="Offering moderation"
        right={
          <>
            <button onClick={fetchAll} className="hover:text-[#804B23]">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span>{counts.pending} offerings awaiting review</span>
          </>
        }
      />

      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-[#FFF8F0] border-y border-[#8D6E63]/8 flex-wrap">
        <FilterTabs
          active={filter}
          onChange={(v) => setFilter(v as any)}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "pending", label: `Pending (${counts.pending})` },
            { value: "approved", label: `Approved (${counts.approved})` },
            { value: "rejected", label: `Rejected (${counts.rejected})` },
          ]}
        />
        <SearchBox value={search} onChange={setSearch} placeholder="Search devotee…" />
      </div>

      {loading ? (
        <p className="text-center text-sm text-[#8D6E63] py-10 animate-pulse">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-sm text-[#8D6E63] py-10">No offerings match this view.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-[#8D6E63] bg-[#FFF8F0]">
              <th className="text-left font-medium px-5 py-2">Devotee / Offering</th>
              <th className="text-left font-medium px-4 py-2 w-28">Status</th>
              <th className="text-left font-medium px-4 py-2 w-24 hidden sm:table-cell">Type</th>
              <th className="text-left font-medium px-4 py-2 w-28 hidden sm:table-cell">Submitted</th>
              <th className="px-4 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const badge = offeringTypeBadge(o);
              return (
                <Fragment key={o.id}>
                  <tr className="border-t border-[#8D6E63]/8 hover:bg-[#FFFCF8]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${badge.cls}`}>
                          {badge.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#5D4037] truncate">{o.profileName || "Unknown devotee"}</p>
                          <p className="text-[11px] text-[#8D6E63] truncate">
                            {o.relation ? `${o.relation} tribute` : "Tribute"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${badge.cls}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#8D6E63] hidden sm:table-cell">{o.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                          className="w-7 h-7 rounded-md border border-[#8D6E63]/20 bg-white flex items-center justify-center text-[#8D6E63] hover:bg-[#FDF0E0]"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === o.id ? "rotate-180" : ""}`} />
                        </button>
                        <Kebab
                          actions={[
                            { label: "Approve", icon: <Check className="w-3.5 h-3.5" />, onClick: () => updateStatus(o.id, "approved") },
                            { label: "Reject", icon: <X className="w-3.5 h-3.5" />, danger: true, onClick: () => updateStatus(o.id, "rejected") },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                  {expandedId === o.id && <OfferingDetailRow offering={o} />}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Users table ──────────────────────────────────────────
function UserRow({ user, onRoleChange }: { user: AdminUser; onRoleChange: (u: AdminUser, role: "user" | "admin") => void }) {
  const [editing, setEditing] = useState(false);

  return (
    <tr className="border-t border-[#8D6E63]/8">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar label={user.username || user.email} />
          <div className="min-w-0">
            <p className="font-medium text-[#5D4037] truncate">{user.username || "—"}</p>
            <p className="text-[11px] text-[#8D6E63] truncate">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex gap-1">
            <button
              onClick={() => { onRoleChange(user, "user"); setEditing(false); }}
              className={`text-[10px] px-2 py-1 rounded-full border ${user.role === "user" ? "bg-[#804B23] text-white border-[#804B23]" : "border-[#8D6E63]/30 text-[#8D6E63]"}`}
            >
              User
            </button>
            <button
              onClick={() => { onRoleChange(user, "admin"); setEditing(false); }}
              className={`text-[10px] px-2 py-1 rounded-full border ${user.role === "admin" ? "bg-[#804B23] text-white border-[#804B23]" : "border-[#8D6E63]/30 text-[#8D6E63]"}`}
            >
              Admin
            </button>
          </div>
        ) : (
          <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${user.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
            {user.role === "admin" ? "Admin" : "User"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-[11px] text-[#8D6E63] hidden sm:table-cell">
        {user.profilesSubmitted} submitted
      </td>
      <td className="px-4 py-3 text-[11px] text-[#8D6E63] hidden sm:table-cell">{user.createdAt}</td>
      <td className="px-4 py-3">
        <button onClick={() => setEditing((e) => !e)} className="text-[11px] text-blue-700 underline underline-offset-2">
          {editing ? "Cancel" : "Edit"}
        </button>
      </td>
    </tr>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/admin/all");
      const list: AdminUser[] = (res.data.users || []).map((u: any) => ({
        id: u._id,
        username: u.username || "",
        email: u.email || "",
        role: u.role || "user",
        profilesSubmitted: u.profilesSubmitted || 0,
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "",
      }));
      setUsers(list);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRoleChange = async (u: AdminUser, role: "user" | "admin") => {
    if (u.role === role) return;
    try {
      await api.patch(`/users/admin/${u.id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      toast.success(`${u.username || u.email} is now ${role}.`);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      await api.post("/users/admin/invite", { email: inviteEmail.trim() });
      toast.success(`Invitation sent to ${inviteEmail.trim()}.`);
      setInviteEmail("");
      setInviting(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send invite.");
    } finally {
      setSendingInvite(false);
    }
  };

  const visible = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    user: users.filter((u) => u.role === "user").length,
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8D6E63]/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2">
        <h2 className="text-base font-semibold text-[#5D4037]">All users</h2>
        <div className="flex items-center gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search users…" />
          {inviting ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="text-xs border border-[#8D6E63]/25 rounded-full px-3 py-1.5 outline-none w-44"
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
              />
              <Button onClick={sendInvite} disabled={sendingInvite} size="sm" className="h-8 text-xs bg-[#804B23] hover:bg-[#6d3f1d]">
                Send
              </Button>
              <button onClick={() => { setInviting(false); setInviteEmail(""); }} className="text-xs text-[#8D6E63] px-1">
                Cancel
              </button>
            </div>
          ) : (
            <Button onClick={() => setInviting(true)} size="sm" className="h-8 text-xs bg-[#804B23] hover:bg-[#6d3f1d] text-white">
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Invite user
            </Button>
          )}
        </div>
      </div>

      <div className="px-5 py-2.5 bg-[#FFF8F0] border-y border-[#8D6E63]/8">
        <FilterTabs
          active={roleFilter}
          onChange={(v) => setRoleFilter(v as any)}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "admin", label: `Admins (${counts.admin})` },
            { value: "user", label: `Users (${counts.user})` },
          ]}
        />
      </div>

      {loading ? (
        <p className="text-center text-sm text-[#8D6E63] py-10 animate-pulse">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-sm text-[#8D6E63] py-10">No users match this view.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-[#8D6E63] bg-[#FFF8F0]">
              <th className="text-left font-medium px-5 py-2">User</th>
              <th className="text-left font-medium px-4 py-2 w-20">Role</th>
              <th className="text-left font-medium px-4 py-2 w-24 hidden sm:table-cell">Profiles</th>
              <th className="text-left font-medium px-4 py-2 w-24 hidden sm:table-cell">Joined</th>
              <th className="text-left font-medium px-4 py-2 w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingProfiles, setPendingProfiles] = useState(0);
  const [pendingOfferings, setPendingOfferings] = useState(0);

  const topRef = useRef<HTMLDivElement>(null);
  const profilesRef = useRef<HTMLDivElement>(null);
  const offeringsRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.stats);
    } catch {
      // Non-fatal — stat cards just stay blank if this fails.
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchStats();
  }, [isAuthenticated, fetchStats]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const jump = (section: "top" | "profiles" | "offerings" | "users") => {
    const refs = { top: topRef, profiles: profilesRef, offerings: offeringsRef, users: usersRef };
    refs[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF1DF] flex items-center justify-center">
        <p className="text-[#5D4037] animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <AdminTopBar email={user?.email} onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar pendingProfiles={pendingProfiles} pendingOfferings={pendingOfferings} onJump={jump} />

        <main className="flex-1 px-4 md:px-6 py-6 max-w-6xl mx-auto w-full space-y-6">
          <div ref={topRef}>
            <h1 className="font-script text-4xl text-[#5C3418]">Admin Dashboard</h1>
            <p className="text-[11px] uppercase tracking-wide text-[#8D6E63] mt-1">Moderation &amp; management</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total profiles" value={stats?.totalProfiles ?? 0} delta={stats ? `+${stats.profilesThisMonth} this month` : undefined} />
            <StatCard label="Pending review" value={stats?.pendingProfiles ?? 0} delta="Needs attention" />
            <StatCard label="Total offerings" value={stats?.totalOfferings ?? 0} delta={stats ? `+${stats.offeringsThisMonth} this month` : undefined} />
            <StatCard label="Registered users" value={stats?.totalUsers ?? 0} delta={stats ? `+${stats.usersThisWeek} this week` : undefined} />
          </div>

          <div ref={profilesRef}>
            <ProfilesPanel onPendingCountChange={setPendingProfiles} />
          </div>

          <div ref={offeringsRef}>
            <OfferingsPanel onPendingCountChange={setPendingOfferings} />
          </div>

          <div className="text-center pt-2">
            <h2 className="font-script text-3xl text-[#5C3418]">User Management</h2>
          </div>

          <div ref={usersRef}>
            <UsersPanel />
          </div>
        </main>
      </div>
    </div>
  );
}