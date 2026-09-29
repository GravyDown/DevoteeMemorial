import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { BarChart3, ChevronRight, Image as ImageIcon, LayoutGrid, Music, User, Users, Video } from "lucide-react";
import api from "@/lib/api";
import { C, collectMedia, getInitial, getYouTubeThumbnail, getYears, type MediaItem, type Offering, type Profile } from "./utils";

const Card = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <section className="bg-white border rounded-xl p-[18px] mb-4" style={{ borderColor: "rgba(128,75,35,0.1)" }}>
    <h3 className="!text-xs !font-normal tracking-[0.1em] uppercase flex items-center gap-1.5 mb-3.5" style={{ color: C.muted }}>
      <span className="[&>svg]:w-[13px] [&>svg]:h-[13px]" style={{ color: C.brand }}>{icon}</span>
      {title}
    </h3>
    {children}
  </section>
);

/* ── Summary ── */
function Summary({ offerings, media }: { offerings: Offering[]; media: MediaItem[] }) {
  const n = (t: MediaItem["type"]) => media.filter((m) => m.type === t).length;
  const stats = [
    [offerings.length, "Total offerings"],
    [n("image"), "Images"],
    [n("video"), "Videos"],
    [n("audio"), "Audios"],
  ] as const;
  return (
    <Card icon={<BarChart3 />} title="Offerings summary">
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map(([v, l]) => (
          <div key={l} className="rounded-lg px-3 py-2.5 text-center" style={{ background: C.cream2 }}>
            <div className="text-[22px] font-medium leading-none" style={{ color: C.text }}>{v}</div>
            <div className="text-[11px] mt-1" style={{ color: C.muted }}>{l}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Media gallery ── */
const GRADS = [
  "from-[#D4A56A] to-[#8B5E3C]", "from-[#C4956A] to-[#7A4E2C]", "from-[#B8856A] to-[#6B3E28]",
  "from-[#5A7A3A] to-[#3A5020]", "from-[#3A4A6A] to-[#2A3050]", "from-[#6A3A5A] to-[#4A2040]",
];
type GFilter = "all" | MediaItem["type"];

function Gallery({ media, onOpen }: { media: MediaItem[]; onOpen: (items: MediaItem[], i: number) => void }) {
  const [f, setF] = useState<GFilter>("all");
  if (media.length === 0) return null;
  const list = media.filter((m) => f === "all" || m.type === f);
  const MAX = 6;
  const extra = list.length > MAX ? list.length - (MAX - 1) : 0;
  const tiles = extra ? list.slice(0, MAX - 1) : list.slice(0, MAX);
  const tabs: { k: GFilter; label: string; icon?: typeof Video }[] = [
    { k: "all", label: "All" }, { k: "image", label: "Image", icon: ImageIcon },
    { k: "video", label: "Video", icon: Video }, { k: "audio", label: "Audio", icon: Music },
  ];
  return (
    <Card icon={<LayoutGrid />} title="Media gallery">
      <div className="flex flex-wrap gap-1 mb-2.5">
        {tabs.map(({ k, label, icon: Icon }) => (
          <button key={k} onClick={() => setF(k)}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-[3px] rounded-full border transition-colors ${f === k ? "text-white border-[#804B23]" : "bg-white hover:bg-[#FDF0E0]"}`}
            style={f === k ? { background: C.brand } : { color: C.muted, borderColor: "rgba(128,75,35,0.15)" }}>
            {Icon && <Icon className="w-2.5 h-2.5" />}{label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-xs py-3" style={{ color: C.muted }}>Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {tiles.map((m, i) => {
            const thumb = m.type === "image" ? m.src : m.type === "video" ? getYouTubeThumbnail(m.src) : null;
            const Icon = m.type === "image" ? ImageIcon : m.type === "video" ? Video : Music;
            return (
              <button key={i} onClick={() => onOpen(list, i)} aria-label={`Open ${m.type}`}
                className={`relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br ${GRADS[i % GRADS.length]} flex items-center justify-center`}>
                {thumb && <img src={thumb} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                {(!thumb || m.type !== "image") && <Icon className="relative w-5 h-5 text-white/70 drop-shadow" />}
              </button>
            );
          })}
          {extra > 0 && (
            <button onClick={() => onOpen(list, MAX - 1)} className={`relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br ${GRADS[5]}`}>
              <span className="absolute inset-0 flex items-center justify-center bg-[#2C1A0E]/55 text-white text-sm font-medium">+{extra}</span>
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

/* ── Initiating guru ── */
function Guru({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <Card icon={<User />} title="Initiating guru">
      <div className="flex items-center gap-2.5">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#D4A56A] to-[#8B5E3C] font-['Cormorant_Garamond'] text-lg">
          {getInitial(name, "G")}
        </div>
        <div className="text-sm font-medium" style={{ color: C.text }}>{name}</div>
      </div>
    </Card>
  );
}

/* ── Fellow disciples (same guru, from GET /profiles) ── */
function Fellows({ profile }: { profile: Profile }) {
  const [list, setList] = useState<Profile[]>([]);
  const guru = profile.spiritualMaster?.trim().toLowerCase();

  useEffect(() => {
    if (!guru) return;
    let alive = true;
    api.get("/profiles")
      .then((res) => {
        const d = res.data;
        const all: Profile[] = Array.isArray(d) ? d : d.profiles ?? [];
        if (alive)
          setList(all.filter((p) => p._id !== profile._id && p.spiritualMaster?.trim().toLowerCase() === guru).slice(0, 5));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [guru, profile._id]);

  if (!list.length) return null;
  return (
    <Card icon={<Users />} title="Fellow disciples">
      {list.map((p) => (
        <Link key={p._id} to={`/disciples/${p._id}`} state={{ name: p.name, image: p.coverImage, birthDate: p.birthDate, deathDate: p.deathDate }}
          className="group flex items-center gap-2.5 py-2 border-b last:border-b-0 last:pb-0" style={{ borderColor: "rgba(128,75,35,0.06)" }}>
          {p.coverImage ? (
            <img src={p.coverImage} alt="" className="w-9 h-9 rounded-full object-cover object-top shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0 bg-gradient-to-br from-[#C4956A] to-[#7A4E2C] font-['Cormorant_Garamond']">
              {getInitial(p.name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-medium truncate group-hover:text-[#804B23]" style={{ color: C.text }}>
              {p.honorific ? `${p.honorific} ` : ""}{p.name}
            </div>
            <div className="text-[11px] truncate" style={{ color: C.muted }}>
              {[p.associatedTemple, getYears(p)].filter(Boolean).join(" · ")}
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: C.muted }} />
        </Link>
      ))}
    </Card>
  );
}

export default function Sidebar({
  profile, offerings, onOpenMedia,
}: {
  profile: Profile;
  offerings: Offering[];
  onOpenMedia: (items: MediaItem[], i: number) => void;
}) {
  const media = useMemo(() => collectMedia(offerings), [offerings]);
  return (
    <aside className="lg:sticky lg:top-[88px] self-start">
      <Summary offerings={offerings} media={media} />
      <Guru name={profile.spiritualMaster} />
      <Gallery media={media} onOpen={onOpenMedia} />
      <Fellows profile={profile} />
    </aside>
  );
}
