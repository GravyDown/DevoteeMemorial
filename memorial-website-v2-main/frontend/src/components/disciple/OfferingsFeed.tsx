import { useEffect, useMemo, useState } from "react";
import { AlignLeft, ChevronDown, Filter, Image as ImageIcon, Music, Video } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import FeedOfferingCard from "./FeedOfferingCard";
import { C, getYear, matchesType, type MediaItem, type Offering, type TypeFilter } from "./utils";

const PAGE_SIZE = 5;
const ALL = "all";

const TABS: { key: TypeFilter; label: string; icon: typeof Video }[] = [
  { key: "all", label: "All", icon: Filter },
  { key: "text", label: "Text", icon: AlignLeft },
  { key: "image", label: "Images", icon: ImageIcon },
  { key: "video", label: "Videos", icon: Video },
  { key: "audio", label: "Audio", icon: Music },
];

export default function OfferingsFeed({
  offerings, loading, profileId, onOpenMedia, onShare,
}: {
  offerings: Offering[];
  loading: boolean;
  profileId: string;
  onOpenMedia: (items: MediaItem[], index: number) => void;
  onShare: () => void;
}) {
  const [type, setType] = useState<TypeFilter>("all");
  const [year, setYear] = useState<string>(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // newest first
  const sorted = useMemo(
    () => [...offerings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [offerings],
  );

  // year -> count (desc)
  const years = useMemo(() => {
    const m = new Map<number, number>();
    sorted.forEach((o) => m.set(getYear(o), (m.get(getYear(o)) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[0] - a[0]);
  }, [sorted]);

  // default to the latest year once data arrives (matches the design)
  useEffect(() => {
    if (years.length && year === ALL) setYear(String(years[0][0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years.length]);

  useEffect(() => setVisible(PAGE_SIZE), [type, year]);

  const filtered = sorted.filter(
    (o) => matchesType(o, type) && (year === ALL || String(getYear(o)) === year),
  );
  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <div className="min-w-0">
      {/* Sticky filter bar (sits under the 72px navbar) */}
      <div className="sticky top-[72px] z-30 -mx-4 sm:-mx-8 lg:mx-0 px-4 sm:px-8 lg:px-0 pt-3 pb-2.5 mb-1 border-b" style={{ background: C.cream, borderColor: "rgba(128,75,35,0.08)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className={`flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-full border transition-colors ${
                type === key ? "text-white border-[#804B23]" : "bg-white hover:bg-[#FDF0E0] hover:text-[#804B23]"
              }`}
              style={type === key ? { background: C.brand } : { color: C.muted, borderColor: "rgba(128,75,35,0.15)" }}
            >
              <Icon className="w-[13px] h-[13px]" /> {label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3">
            {years.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 bg-white border-[1.5px] rounded-full pl-4 pr-3.5 py-[7px] text-sm font-medium hover:border-[#804B23] data-[state=open]:bg-[#FDF0E0] data-[state=open]:border-[#804B23] outline-none" style={{ borderColor: "rgba(128,75,35,0.2)", color: C.text }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.brand }} />
                    {year === ALL ? "All years" : year}
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: C.muted }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px] bg-white">
                  <DropdownMenuItem onClick={() => setYear(ALL)} className="justify-between text-[13px]">
                    All years <span className="text-[11px]" style={{ color: C.muted }}>{sorted.length}</span>
                  </DropdownMenuItem>
                  {years.map(([y, n]) => (
                    <DropdownMenuItem key={y} onClick={() => setYear(String(y))} className={`justify-between text-[13px] ${String(y) === year ? "font-medium" : ""}`}>
                      {y}
                      <span className="text-[11px] rounded-full px-2 py-px" style={{ background: C.cream3, color: C.muted }}>
                        {n} {n === 1 ? "offering" : "offerings"}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <span className="text-[13px] whitespace-nowrap" style={{ color: C.muted }}>
              Showing <strong className="font-medium" style={{ color: C.text }}>{shown.length}</strong> of{" "}
              <strong className="font-medium" style={{ color: C.text }}>{filtered.length}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#804B23] border-t-transparent" />
            <p className="mt-4" style={{ color: C.muted }}>Loading offerings…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: "rgba(128,75,35,0.1)" }}>
            <div className="text-5xl mb-3">🕯️</div>
            <p className="text-lg font-medium" style={{ color: C.muted }}>
              {offerings.length === 0 ? "No offerings have been shared yet." : "No offerings match these filters."}
            </p>
            {offerings.length === 0 && (
              <>
                <p className="text-sm mt-2 opacity-70" style={{ color: C.muted }}>Be the first to honor this devotee's memory.</p>
                <Link to="/offerings/new" state={{ devoteeId: profileId }} className="inline-block mt-4">
                  <Button className="bg-[#804B23] hover:bg-[#5C3418] text-white rounded-full px-6 h-9 text-sm">Give Offering</Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            {shown.map((o) => (
              <FeedOfferingCard key={o._id} offering={o} onOpenMedia={onOpenMedia} onShare={onShare} />
            ))}
            {remaining > 0 && (
              <div className="text-center mt-2 mb-4">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 bg-white border rounded-full px-6 py-2.5 text-[13px] hover:bg-[#FDF0E0] hover:border-[#804B23] transition-colors"
                  style={{ borderColor: "rgba(128,75,35,0.2)", color: C.brand }}
                >
                  <ChevronDown className="w-3.5 h-3.5" /> Load more · {remaining} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
