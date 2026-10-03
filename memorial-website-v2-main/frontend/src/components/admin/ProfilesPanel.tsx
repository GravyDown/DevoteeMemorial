import { useCallback, useEffect, useState, Fragment } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  RefreshCw,
  Check,
  X,
  Pencil,
  Save,
  ChevronDown,
  UserCheck,
  MapPin,
  Upload,
} from "lucide-react";
import BulkUploadDialog from "./BulkUploadDialog";
import {
  type Profile,
  type ProfileStatus,
  StatusPill,
  ThumbAvatar,
  FilterTabs,
  SearchBox,
  PanelHeader,
  ConfirmDialog,
  BulkBar,
  LoadingRows,
  EmptyState,
  usePagedList,
  PaginationBar,
} from "./shared";

/* ── Expanded row: full editable detail + a real photo preview ── */
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
      <td colSpan={5} className="px-5 pb-4 pt-1">
        <div className="flex flex-col sm:flex-row gap-4 mb-3">
          {/* Real photo preview — this is the actual image being approved,
               which the old dashboard never showed at all. */}
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-wide text-[#8D6E63] mb-1">Submitted photo</p>
            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt={profile.name}
                className="w-28 h-28 rounded-xl object-cover object-top ring-1 ring-black/5"
              />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-[#F5E6CC] flex items-center justify-center text-[11px] text-[#8D6E63] text-center px-2">
                No photo provided
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {field("name", "Devotee Name")}
            {field("spiritualMaster", "Initiating Guru")}
            {field("years", "Life Years")}
            {field("location", "Location")}
            {field("honorific", "Honorific")}
            {field("ashramRole", "Ashram / Role")}
            {field("contributorName", "Submitted By")}
            {field("contributorPhone", "Contact")}
          </div>
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

export default function ProfilesPanel({ onPendingCountChange }: { onPendingCountChange: (n: number) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ProfileStatus>("pending");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [declineTarget, setDeclineTarget] = useState<Profile | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

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

  const handleApprove = async (id: string, silent = false) => {
    try {
      await api.patch(`/admin/profiles/${id}/status`, { status: "accepted" });
      setProfiles((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, status: "accepted" as ProfileStatus } : p));
        onPendingCountChange(next.filter((p) => p.status === "pending").length);
        return next;
      });
      if (!silent) toast.success("Memorial approved and published.");
      return true;
    } catch {
      if (!silent) toast.error("Failed to approve.");
      return false;
    }
  };

  const confirmDecline = async () => {
    if (!declineTarget) return;
    const id = declineTarget.id;
    setDeclineTarget(null);
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

  const handleBulkApprove = async () => {
    setBulkApproving(true);
    const ids = [...selected];
    const results = await Promise.allSettled(ids.map((id) => handleApprove(id, true)));
    const succeeded = results.filter((r) => r.status === "fulfilled" && r.value).length;
    const failed = ids.length - succeeded;
    if (succeeded) toast.success(`${succeeded} profile${succeeded === 1 ? "" : "s"} approved.`);
    if (failed) toast.error(`${failed} failed to approve.`);
    setSelected(new Set());
    setBulkApproving(false);
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const visible = profiles.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { page, setPage, totalPages, paged, total } = usePagedList(visible, 10);

  // Only pending rows are selectable — bulk-approving an already-decided
  // row doesn't make sense.
  const selectablePaged = paged.filter((p) => p.status === "pending");
  const allPagedSelected = selectablePaged.length > 0 && selectablePaged.every((p) => selected.has(p.id));

  const counts = {
    all: profiles.length,
    pending: profiles.filter((p) => p.status === "pending").length,
    accepted: profiles.filter((p) => p.status === "accepted").length,
    declined: profiles.filter((p) => p.status === "declined").length,
  };

  const titleByFilter: Record<string, string> = {
    all: "All profile submissions",
    pending: "Pending profile reviews",
    accepted: "Approved profiles",
    declined: "Declined profiles",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8D6E63]/10 overflow-hidden">
      <PanelHeader
        title={titleByFilter[filter]}
        subtitle={`${total} shown`}
        right={
          <>
            <button
              onClick={() => setBulkUploadOpen(true)}
              className="flex items-center gap-1.5 bg-[#804B23] hover:bg-[#6d3f1d] text-white text-xs px-3 py-1.5 rounded-full transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Bulk upload
            </button>
            <button onClick={fetchAll} className="hover:text-[#804B23]" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span>{counts.pending} awaiting review</span>
          </>
        }
      />

      <BulkUploadDialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} onUploaded={fetchAll} />

      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-[#FFF8F0] border-y border-[#8D6E63]/8 flex-wrap">
        <FilterTabs
          active={filter}
          onChange={(v) => { setFilter(v as any); setPage(1); setSelected(new Set()); }}
          options={[
            { value: "pending", label: `Pending (${counts.pending})` },
            { value: "accepted", label: `Approved (${counts.accepted})` },
            { value: "declined", label: `Declined (${counts.declined})` },
            { value: "all", label: `All (${counts.all})` },
          ]}
        />
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search…" />
      </div>

      <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button
          size="sm"
          onClick={handleBulkApprove}
          disabled={bulkApproving}
          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Check className="w-3.5 h-3.5 mr-1" /> Approve selected
        </Button>
      </BulkBar>

      {loading ? (
        <LoadingRows cols={3} />
      ) : visible.length === 0 ? (
        <EmptyState icon={<UserCheck className="w-5 h-5" />} text="No profiles match this view." />
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-[#8D6E63] bg-[#FFF8F0]">
                <th className="w-10 px-5 py-2">
                  {filter === "pending" && selectablePaged.length > 0 && (
                    <Checkbox
                      checked={allPagedSelected}
                      onCheckedChange={(c) =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          selectablePaged.forEach((p) => (c ? next.add(p.id) : next.delete(p.id)));
                          return next;
                        })
                      }
                    />
                  )}
                </th>
                <th className="text-left font-medium px-2 py-2">Devotee</th>
                <th className="text-left font-medium px-4 py-2 w-28">Status</th>
                <th className="text-left font-medium px-4 py-2 w-28 hidden sm:table-cell">Submitted</th>
                <th className="px-4 py-2 w-[180px]"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <Fragment key={p.id}>
                  <tr className="border-t border-[#8D6E63]/8 hover:bg-[#FFFCF8]">
                    <td className="px-5 py-3">
                      {p.status === "pending" && (
                        <Checkbox checked={selected.has(p.id)} onCheckedChange={(c) => toggleSelect(p.id, !!c)} />
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <ThumbAvatar label={p.name} src={p.coverImage} size={38} rounded="rounded-xl" />
                        <div className="min-w-0">
                          <p className="font-medium text-[#5D4037] truncate">{p.name || "Untitled"}</p>
                          <p className="text-[11px] text-[#8D6E63] truncate flex items-center gap-1">
                            {p.contributorName}
                            {p.location && (
                              <>
                                <span>·</span>
                                <MapPin className="w-2.5 h-2.5" /> {p.location}
                              </>
                            )}
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
                        {p.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(p.id)}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
                            >
                              <Check className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeclineTarget(p)}
                              className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2.5"
                            >
                              <X className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Decline</span>
                            </Button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(p.id)}
                          title="Edit fields"
                          className="w-7 h-7 rounded-md border border-[#8D6E63]/20 bg-white flex items-center justify-center text-[#8D6E63] hover:bg-[#FDF0E0]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="w-7 h-7 rounded-md border border-[#8D6E63]/20 bg-white flex items-center justify-center text-[#8D6E63] hover:bg-[#FDF0E0]"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === p.id ? "rotate-180" : ""}`} />
                        </button>
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
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!declineTarget}
        onOpenChange={(o) => !o && setDeclineTarget(null)}
        title="Decline this memorial submission?"
        destructive
        confirmLabel="Decline"
        onConfirm={confirmDecline}
        description={
          declineTarget && (
            <div className="flex items-center gap-3 pt-1">
              <ThumbAvatar label={declineTarget.name} src={declineTarget.coverImage} size={44} rounded="rounded-lg" />
              <div className="text-left">
                <p className="font-medium text-[#5D4037]">{declineTarget.name}</p>
                <p className="text-xs text-[#8D6E63]">Submitted by {declineTarget.contributorName || "unknown"}</p>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}