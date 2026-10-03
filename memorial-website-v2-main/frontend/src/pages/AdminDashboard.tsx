import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, Routes, Route, NavLink, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  UserCheck,
  Heart,
  Users as UsersIcon,
  Settings,
  ShieldCheck,
  ExternalLink,
  LogOut,
} from "lucide-react";

import Overview from "@/components/admin/Overview";
import ProfilesPanel from "@/components/admin/ProfilesPanel";
import OfferingsPanel from "@/components/admin/OfferingsPanel";
import UsersPanel from "@/components/admin/UsersPanel";
import { PendingCountsContext, usePendingCounts } from "@/components/admin/shared";

// Brand colors are inlined as Tailwind arbitrary values (e.g. bg-[#804B23])
// throughout this file, matching Navbar.tsx, rather than kept as JS consts —
// Tailwind's class extraction needs the literal strings, not variables.
// "font-script" (Sacramento) is defined in index.css's @theme block.

/* ── Sidebar — real routes now (NavLink + active state), not
     scrollIntoView. Each section mounts (and fetches) only when
     actually visited, instead of all four panels loading at once. ── */
function navCls({ isActive }: { isActive: boolean }) {
  return `w-full flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-lg transition-colors ${
    isActive
      ? "text-[#804B23] bg-[#FDF0E0] font-medium"
      : "text-[#8D6E63] hover:bg-[#FDF0E0]/60 hover:text-[#804B23]"
  }`;
}

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto bg-[#804B23] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
      {n}
    </span>
  );
}

function Sidebar() {
  const { profiles, offerings } = usePendingCounts();
  return (
    <div className="bg-white border-r border-[#8D6E63]/10 w-[200px] shrink-0 py-4 px-2.5 hidden md:block sticky top-0 h-screen overflow-y-auto">
      <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] px-2.5 mb-2">Overview</p>
      <NavLink to="/admin" end className={navCls}>
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </NavLink>

      <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] px-2.5 mb-2 mt-5">Moderation</p>
      <NavLink to="/admin/profiles" className={navCls}>
        <UserCheck className="w-4 h-4" />
        Profiles
        <Badge n={profiles} />
      </NavLink>
      <NavLink to="/admin/offerings" className={navCls}>
        <Heart className="w-4 h-4" />
        Offerings
        <Badge n={offerings} />
      </NavLink>

      <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] px-2.5 mb-2 mt-5">Management</p>
      <NavLink to="/admin/users" className={navCls}>
        <UsersIcon className="w-4 h-4" />
        Users
      </NavLink>
      <div className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8D6E63]/50 cursor-not-allowed">
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

function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-script text-4xl text-[#5C3418]">{title}</h1>
        <p className="text-[11px] uppercase tracking-wide text-[#8D6E63] mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

/* ── Routed pages — each wires its panel's onPendingCountChange into
     context instead of the panel needing to know the sidebar exists. ── */
function OverviewPage() {
  return (
    <PageShell title="Admin Dashboard" subtitle="Overview">
      <Overview />
    </PageShell>
  );
}
function ProfilesPage() {
  const { setProfiles } = usePendingCounts();
  return (
    <PageShell title="Profiles" subtitle="Review and manage memorial submissions">
      <ProfilesPanel onPendingCountChange={setProfiles} />
    </PageShell>
  );
}
function OfferingsPage() {
  const { setOfferings } = usePendingCounts();
  return (
    <PageShell title="Offerings" subtitle="Moderate tributes submitted by devotees">
      <OfferingsPanel onPendingCountChange={setOfferings} />
    </PageShell>
  );
}
function UsersPage() {
  return (
    <PageShell title="Users" subtitle="Manage accounts and roles">
      <UsersPanel />
    </PageShell>
  );
}

/* ── Layout: topbar + sidebar + routed main content ── */
function DashboardLayout({ email, onLogout }: { email?: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <AdminTopBar email={email} onLogout={onLogout} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-4 md:px-6 py-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── Main export — auth guard + context provider + nested routes.
     main.tsx mounts this at "/admin/*" so these nested paths resolve. ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [profiles, setProfiles] = useState(0);
  const [offerings, setOfferings] = useState(0);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF1DF] flex items-center justify-center">
        <p className="text-[#5D4037] animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <PendingCountsContext.Provider value={{ profiles, offerings, setProfiles, setOfferings }}>
      <Routes>
        <Route element={<DashboardLayout email={user?.email} onLogout={handleLogout} />}>
          <Route index element={<OverviewPage />} />
          <Route path="profiles" element={<ProfilesPage />} />
          <Route path="offerings" element={<OfferingsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </PendingCountsContext.Provider>
  );
}