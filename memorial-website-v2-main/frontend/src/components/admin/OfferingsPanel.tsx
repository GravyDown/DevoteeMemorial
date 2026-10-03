import { useCallback, useEffect, useState, Fragment } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  RefreshCw,
  Check,
  X,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Heart,
} from "lucide-react";
import {
  type Offering,
  type OfferingStatus,
  StatusPill,
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

function offeringTypeBadge(o: Offering) {
  if (o.images.length) return { label: "Image", icon: <ImageIcon className="w-3 h-3" />, cls: "bg-blue-50 text-blue-700" };
  if (o.videoLink) return { label: "Video", icon: <Video className="w-3 h-3" />, cls: "bg-pink-50 text-pink-700" };
  if (o.audios.length) return { label: "Audio", icon: <Music className="w-3 h-3" />, cls: "bg-teal-50 text-teal-700" };
  return { label: "Text", icon: <FileText className="w-3 h-3" />, cls: "bg-[#F5E6CC] text-[#5C3418]" };
}

function OfferingDetailRow({ offering }: { offering: Offering }) {
  return (
    <tr className="bg-[#FFFCF8]">
      <td colSpan={6} className="px-5 pb-4 pt-1 space-y-3">
        <div className="bg-[#FDF0E0] rounded-lg p-3 text-sm text-[#5D4037] italic leading-relaxed">
          "{offering.message}"
        </div>
        {offering.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {offering.images.map((src) => (
              <img key={src} src={src} alt="" className="w-20 h-20 rounded-lg object-cover ring-1 ring-black/5" />
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

export default function OfferingsPanel({ onPendingCountChange }: { onPendingCountChange: (n: number) => void }) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OfferingStatus>("pending");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<Offering | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);

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

  const updateStatus = async (id: string, status: OfferingStatus, silent = false) => {
    try {
      await api.patch(`/offerings/${id}/status`, { status });
      setOfferings((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, status } : o));
        onPendingCountChange(next.filter((o) => o.status === "pending").length);
        return next;
      });
      if (!silent) toast.success(status === "approved" ? "Offering approved." : "Offering rejected.");
      return true;
    } catch {
      if (!silent) toast.error("Failed to update offering.");
      return false;
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    setRejectTarget(null);
    await updateStatus(id, "rejected");
  };

  const handleBulkApprove = async () => {
    setBulkApproving(true);
    const ids = [...selected];
    const results = await Promise.allSettled(ids.map((id) => updateStatus(id, "approved", true)));
    const succeeded = results.filter((r) => r.status === "fulfilled" && r.value).length;
    const failed = ids.length - succeeded;
    if (succeeded) toast.success(`${succeeded} offering${succeeded === 1 ? "" : "s"} approved.`);
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

  const visible = offerings.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.profileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { page, setPage, totalPages, paged, total } = usePagedList(visible, 10);
  const selectablePaged = paged.filter((o) => o.status === "pending");
  const allPagedSelected = selectablePaged.length > 0 && selectablePaged.every((o) => selected.has(o.id));

  const counts = {
    all: offerings.length,
    pending: offerings.filter((o) => o.status === "pending").length,
    approved: offerings.filter((o) => o.status === "approved").length,
    rejected: offerings.filter((o) => o.status === "rejected").length,
  };

  const titleByFilter: Record<string, string> = {
    all: "All offerings",
    pending: "Offerings awaiting review",
    approved: "Approved offerings",
    rejected: "Rejected offerings",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8D6E63]/10 overflow-hidden">
      <PanelHeader
        title={titleByFilter[filter]}
        subtitle={`${total} shown`}
        right={
          <>
            <button onClick={fetchAll} className="hover:text-[#804B23]" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span>{counts.pending} awaiting review</span>
          </>
        }
      />

      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-[#FFF8F0] border-y border-[#8D6E63]/8 flex-wrap">
        <FilterTabs
          active={filter}
          onChange={(v) => { setFilter(v as any); setPage(1); setSelected(new Set()); }}
          options={[
            { value: "pending", label: `Pending (${counts.pending})` },
            { value: "approved", label: `Approved (${counts.approved})` },
            { value: "rejected", label: `Rejected (${counts.rejected})` },
            { value: "all", label: `All (${counts.all})` },
          ]}
        />
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search devotee…" />
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
        <EmptyState icon={<Heart className="w-5 h-5" />} text="No offerings match this view." />
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
                          selectablePaged.forEach((o) => (c ? next.add(o.id) : next.delete(o.id)));
                          return next;
                        })
                      }
                    />
                  )}
                </th>
                <th className="text-left font-medium px-2 py-2">Devotee / Offering</th>
                <th className="text-left font-medium px-4 py-2 w-28">Status</th>
                <th className="text-left font-medium px-4 py-2 w-24 hidden sm:table-cell">Type</th>
                <th className="text-left font-medium px-4 py-2 w-28 hidden sm:table-cell">Submitted</th>
                <th className="px-4 py-2 w-[170px]"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((o) => {
                const badge = offeringTypeBadge(o);
                return (
                  <Fragment key={o.id}>
                    <tr className="border-t border-[#8D6E63]/8 hover:bg-[#FFFCF8]">
                      <td className="px-5 py-3">
                        {o.status === "pending" && (
                          <Checkbox checked={selected.has(o.id)} onCheckedChange={(c) => toggleSelect(o.id, !!c)} />
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          {o.images[0] ? (
                            <img src={o.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 ring-1 ring-black/5" />
                          ) : (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${badge.cls}`}>
                              {badge.icon}
                            </div>
                          )}
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
                          {o.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(o.id, "approved")}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
                              >
                                <Check className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRejectTarget(o)}
                                className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2.5"
                              >
                                <X className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Reject</span>
                              </Button>
                            </>
                          )}
                          <button
                            onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                            className="w-7 h-7 rounded-md border border-[#8D6E63]/20 bg-white flex items-center justify-center text-[#8D6E63] hover:bg-[#FDF0E0]"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === o.id ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === o.id && <OfferingDetailRow offering={o} />}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        title="Reject this offering?"
        destructive
        confirmLabel="Reject"
        onConfirm={confirmReject}
        description={
          rejectTarget && (
            <div className="text-left pt-1">
              <p className="font-medium text-[#5D4037]">For {rejectTarget.profileName || "this devotee"}</p>
              <p className="text-xs text-[#8D6E63] mt-1 italic line-clamp-3">"{rejectTarget.message}"</p>
            </div>
          )
        }
      />
    </div>
  );
}