import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Pencil,
  Save,
  RefreshCw,
  Clock,
  AlertTriangle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────
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
  status: string;
  createdAt: string;
  isEditing: boolean;
  editData: Record<string, string>;
}

// ── Stat Card ────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#8D6E63]/10">
      <p className="text-sm text-[#8D6E63]">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

// ── Profile Card ─────────────────────────────────────────
function ProfileCard({
  profile,
  onApprove,
  onDecline,
  onEdit,
  onSave,
  onFieldChange,
}: {
  profile: Profile;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onEdit: (id: string) => void;
  onSave: (id: string) => void;
  onFieldChange: (id: string, key: string, value: string) => void;
}) {
  const field = (
    key: string,
    label: string,
    multiline = false
  ) => (
    <div className="space-y-1">
      <p className="text-xs text-[#8D6E63] font-medium uppercase tracking-wide">
        {label}
      </p>
      {profile.isEditing ? (
        multiline ? (
          <textarea
            value={profile.editData[key] ?? profile[key as keyof Profile] ?? ""}
            onChange={(e) => onFieldChange(profile.id, key, e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg p-2 text-[#5D4037] resize-none focus:outline-none focus:ring-1 focus:ring-[#8D6E63]"
          />
        ) : (
          <Input
            value={profile.editData[key] ?? profile[key as keyof Profile] ?? ""}
            onChange={(e) => onFieldChange(profile.id, key, e.target.value)}
            className="h-9 text-sm text-[#5D4037] border-gray-200"
          />
        )
      ) : (
        <p className="text-sm text-[#5D4037]">
          {(profile[key as keyof Profile] as string) || (
            <span className="text-gray-400 italic">Not provided</span>
          )}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#8D6E63]/10 p-6">
      <div className="flex gap-6">
        {/* Photo */}
        <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#FFF1DF] border border-[#8D6E63]/20">
          {profile.coverImage ? (
            <img
              src={profile.coverImage}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8D6E63] text-xs">
              No photo
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("name", "Devotee Name")}
          {field("spiritualMaster", "Initiating Guru")}
          {field("years", "Life Years")}
          {field("location", "Location")}
          {field("honorific", "Honorific")}
          {field("ashramRole", "Ashram / Role")}
          {field("contributorName", "Submitted By")}
          {field("contributorPhone", "Contact")}
          <div className="md:col-span-2">
            {field("description", "About", true)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="text-xs text-[#8D6E63] text-right mb-1">
            {profile.createdAt}
          </div>

          {profile.isEditing ? (
            <Button
              onClick={() => onSave(profile.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-sm"
            >
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
          ) : (
            <Button
              onClick={() => onEdit(profile.id)}
              variant="outline"
              className="border-[#8D6E63]/30 text-[#5D4037] rounded-xl h-9 px-4 text-sm"
            >
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}

          <Button
            onClick={() => onApprove(profile.id)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 px-4 text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Approve
          </Button>

          <Button
            onClick={() => onDecline(profile.id)}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-9 px-4 text-sm"
          >
            <XCircle className="w-4 h-4 mr-1" /> Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [declinedProfiles, setDeclinedProfiles] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "declined">("pending");

  // ── Admin guard ──────────────────────────────────────
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, user]);

  // ── Fetch pending profiles ───────────────────────────
  const fetchProfiles = async () => {
    setFetching(true);
    try {
      const [pendingRes, declinedRes] = await Promise.all([
        api.get("/admin/pending"),
        api.get("/admin/declined"),
      ]);

      const format = (list: any[]): Profile[] =>
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
          status: p.status || "",
          createdAt: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString("en-IN")
            : "",
          isEditing: false,
          editData: {},
        }));

      setProfiles(format(pendingRes.data.profiles || []));
      setDeclinedProfiles(format(declinedRes.data.profiles || []));
    } catch {
      toast.error("Failed to load profiles.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProfiles();
  }, [isAuthenticated]);

  // ── Actions ──────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/profiles/${id}/status`, { status: "accepted" });
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      toast.success("Memorial approved and published.");
    } catch {
      toast.error("Failed to approve.");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.patch(`/admin/profiles/${id}/status`, { status: "declined" });
      const declined = profiles.find((p) => p.id === id);
      if (declined) {
        setDeclinedProfiles((prev) => [
          { ...declined, status: "declined" },
          ...prev,
        ]);
      }
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      toast.success("Memorial declined.");
    } catch {
      toast.error("Failed to decline.");
    }
  };

  const handleEdit = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isEditing: true, editData: {} } : p
      )
    );
  };

  const handleFieldChange = (id: string, key: string, value: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, editData: { ...p.editData, [key]: value } }
          : p
      )
    );
  };

  const handleSave = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile || Object.keys(profile.editData).length === 0) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isEditing: false } : p))
      );
      return;
    }
    try {
      await api.patch(`/admin/profiles/${id}/edit`, profile.editData);
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...profile.editData, isEditing: false, editData: {} }
            : p
        )
      );
      toast.success("Changes saved.");
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // ── Loading ──────────────────────────────────────────
  if (isLoading || fetching) {
    return (
      <div className="min-h-screen bg-[#FFF1DF] flex items-center justify-center">
        <p className="text-[#5D4037] animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // ── UI ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#8D6E63] mt-1">
              Signed in as {user?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchProfiles}
              variant="outline"
              className="border-[#8D6E63]/30 text-[#5D4037] rounded-xl h-10"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-600 rounded-xl h-10 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Pending Review"
            value={profiles.length}
            color="text-amber-600"
          />
          <StatCard
            label="Declined"
            value={declinedProfiles.length}
            color="text-red-500"
          />
          <StatCard
            label="Total Submitted"
            value={profiles.length + declinedProfiles.length}
            color="text-[#5D4037]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#8D6E63]/20 pb-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2 rounded-t-xl text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-white text-[#5D4037] border border-b-white border-[#8D6E63]/20 -mb-px"
                : "text-[#8D6E63] hover:text-[#5D4037]"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Pending ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab("declined")}
            className={`px-5 py-2 rounded-t-xl text-sm font-medium transition-colors ${
              activeTab === "declined"
                ? "bg-white text-[#5D4037] border border-b-white border-[#8D6E63]/20 -mb-px"
                : "text-[#8D6E63] hover:text-[#5D4037]"
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Declined ({declinedProfiles.length})
          </button>
        </div>

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#8D6E63]/10">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-[#5D4037] font-medium">
                  All caught up! No pending memorials.
                </p>
              </div>
            ) : (
              profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onFieldChange={handleFieldChange}
                />
              ))
            )}
          </div>
        )}

        {/* Declined Tab */}
        {activeTab === "declined" && (
          <div className="space-y-4">
            {declinedProfiles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#8D6E63]/10">
                <p className="text-[#8D6E63]">No declined memorials.</p>
              </div>
            ) : (
              declinedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl p-5 border border-red-100 flex gap-4"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF1DF] flex-shrink-0">
                    {profile.coverImage && (
                      <img
                        src={profile.coverImage}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[#5D4037]">{profile.name}</p>
                    <p className="text-sm text-[#8D6E63]">
                      {profile.location} · {profile.years}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Declined · Submitted by {profile.contributorName}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}