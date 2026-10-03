import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import {
  type AdminUser,
  ThumbAvatar,
  FilterTabs,
  SearchBox,
  PanelHeader,
  LoadingRows,
  EmptyState,
  usePagedList,
  PaginationBar,
} from "./shared";

function UserRow({ user, onRoleChange }: { user: AdminUser; onRoleChange: (u: AdminUser, role: "user" | "admin") => void }) {
  const [editing, setEditing] = useState(false);

  return (
    <tr className="border-t border-[#8D6E63]/8 hover:bg-[#FFFCF8]">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <ThumbAvatar label={user.username || user.email} size={36} />
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
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-[11px] px-2.5 py-1 rounded-full border border-[#8D6E63]/25 text-[#5D4037] hover:bg-[#FDF0E0]"
        >
          {editing ? "Cancel" : "Edit role"}
        </button>
      </td>
    </tr>
  );
}

export default function UsersPanel() {
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

  const visibleAll = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const { page, setPage, totalPages, paged, total } = usePagedList(visibleAll, 12);

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    user: users.filter((u) => u.role === "user").length,
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8D6E63]/10 overflow-hidden">
      <PanelHeader
        title="All users"
        subtitle={`${total} shown`}
        right={
          <div className="flex items-center gap-2">
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users…" />
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
        }
      />

      <div className="px-5 py-2.5 bg-[#FFF8F0] border-y border-[#8D6E63]/8">
        <FilterTabs
          active={roleFilter}
          onChange={(v) => { setRoleFilter(v as any); setPage(1); }}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "admin", label: `Admins (${counts.admin})` },
            { value: "user", label: `Users (${counts.user})` },
          ]}
        />
      </div>

      {loading ? (
        <LoadingRows cols={3} />
      ) : visibleAll.length === 0 ? (
        <EmptyState icon={<UsersIcon className="w-5 h-5" />} text="No users match this view." />
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-[#8D6E63] bg-[#FFF8F0]">
                <th className="text-left font-medium px-5 py-2">User</th>
                <th className="text-left font-medium px-4 py-2 w-20">Role</th>
                <th className="text-left font-medium px-4 py-2 w-24 hidden sm:table-cell">Profiles</th>
                <th className="text-left font-medium px-4 py-2 w-24 hidden sm:table-cell">Joined</th>
                <th className="text-left font-medium px-4 py-2 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} />
              ))}
            </tbody>
          </table>
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}