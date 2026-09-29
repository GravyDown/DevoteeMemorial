import { useRef, useState } from "react";
import { AlignLeft, Image as ImageIcon, Video, Music, Heart, MessageCircle, Share2, Play, Pause } from "lucide-react";
import {
  C, formatDate, getEmbedUrl, getInitial, getTypes, getYouTubeThumbnail,
  type MediaItem, type Offering, type OfferingType,
} from "./utils";

const BADGE: Record<OfferingType, { bg: string; fg: string; icon: typeof Video; label: (n: number) => string }> = {
  text:  { bg: C.cream3,   fg: C.brandDark, icon: AlignLeft, label: () => "Text" },
  image: { bg: "#E6F1FB",  fg: "#185FA5",   icon: ImageIcon, label: (n) => (n > 1 ? `${n} Images` : "Image") },
  video: { bg: "#FBEAF0",  fg: "#72243E",   icon: Video,     label: () => "Video" },
  audio: { bg: "#E1F5EE",  fg: "#085041",   icon: Music,     label: (n) => (n > 1 ? `${n} Audios` : "Audio") },
};

/* ── Image layouts: 1 / 2 / 3+ (with +N overlay) ── */
function ImageGrid({ images, onOpen }: { images: string[]; onOpen: (i: number) => void }) {
  const Tile = ({ i, cls, extra }: { i: number; cls: string; extra?: number }) => (
    <button onClick={() => onOpen(i)} className={`relative overflow-hidden rounded-lg bg-[#F5E6CC] ${cls}`}>
      <img src={images[i]} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.02] transition-transform" />
      {!!extra && (
        <span className="absolute inset-0 bg-[#2C1A0E]/55 text-white text-base font-medium flex items-center justify-center">
          +{extra}
        </span>
      )}
    </button>
  );
  if (images.length === 1) return <Tile i={0} cls="w-full aspect-video block rounded-[10px]" />;
  if (images.length === 2)
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <Tile i={0} cls="aspect-[4/3]" />
        <Tile i={1} cls="aspect-[4/3]" />
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-[5px]">
      <Tile i={0} cls="col-span-2 aspect-video" />
      <Tile i={1} cls="aspect-[4/3]" />
      <Tile i={2} cls="aspect-[4/3]" extra={images.length > 3 ? images.length - 3 : undefined} />
    </div>
  );
}

/* ── Video block: thumbnail + play → inline embed ── */
function VideoBlock({ link }: { link: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = getEmbedUrl(link);
  const thumb = getYouTubeThumbnail(link);

  if (!embed)
    return (
      <a href={link} target="_blank" rel="noreferrer" className="block rounded-[10px] px-4 py-3 text-sm underline" style={{ background: C.cream2, color: C.brand }}>
        Watch video ↗
      </a>
    );
  return (
    <div className="relative w-full aspect-video rounded-[10px] overflow-hidden bg-[#1a0e07]">
      {playing || !thumb ? (
        <iframe
          src={playing ? `${embed}${embed.includes("?") ? "&" : "?"}autoplay=1` : embed}
          title="Video offering"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlaying(true)} aria-label="Play video" className="absolute inset-0 group">
          <img src={thumb} alt="" className="w-full h-full object-cover" />
          <span className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
            <span className="w-[52px] h-[52px] rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 ml-0.5" fill={C.brandDark} color={C.brandDark} />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/* ── Audio player with waveform progress ── */
const BARS = [6, 10, 16, 8, 20, 14, 18, 10, 22, 12, 16, 8, 18, 10, 14, 20, 8, 16, 10, 14];
const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "");

function AudioPlayer({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    a.paused ? a.play() : a.pause();
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current;
    if (!a || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * dur;
  };
  const pct = dur ? t / dur : 0;

  return (
    <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3" style={{ background: C.cream2 }}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
      />
      <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: C.brand }}>
        {playing ? <Pause className="w-3.5 h-3.5" fill="#fff" /> : <Play className="w-3.5 h-3.5 ml-0.5" fill="#fff" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate" style={{ color: C.text }}>{label}</div>
        <div className="text-[11px]" style={{ color: C.muted }}>{fmt(t)}{dur ? ` / ${fmt(dur)}` : ""}</div>
      </div>
      <div onClick={seek} className="flex items-center gap-[2px] h-6 cursor-pointer" role="slider" aria-label="Seek">
        {BARS.map((h, i) => (
          <span key={i} className="w-[3px] rounded-sm" style={{ height: h, background: C.brand, opacity: i / BARS.length < pct ? 0.9 : 0.3 }} />
        ))}
      </div>
    </div>
  );
}

/* ── Card ── */
export default function FeedOfferingCard({
  offering, onOpenMedia, onShare,
}: {
  offering: Offering;
  onOpenMedia: (items: MediaItem[], index: number) => void;
  onShare: () => void;
}) {
  const [full, setFull] = useState(false);
  const types = getTypes(offering);
  const name = offering.relation || "Devotee";
  const long = offering.message.length > 200;
  const images = offering.images ?? [];
  const audios = offering.audios ?? [];

  const counts: Record<OfferingType, number> = { text: 1, image: images.length, video: 1, audio: audios.length };

  return (
    <article className="bg-white rounded-[14px] border overflow-hidden mb-4 hover:shadow-[0_4px_20px_rgba(128,75,35,0.08)] transition-shadow" style={{ borderColor: "rgba(128,75,35,0.1)" }}>
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#D4A56A] to-[#8B5E3C] font-['Cormorant_Garamond'] text-[15px] font-medium">
            {getInitial(name)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: C.text }}>{name}</div>
            <div className="text-xs" style={{ color: C.muted }}>{formatDate(offering.createdAt)}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {types.map((t) => {
            const b = BADGE[t];
            const Icon = b.icon;
            return (
              <span key={t} className="flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-[3px]" style={{ background: b.bg, color: b.fg }}>
                <Icon className="w-3 h-3" /> {b.label(counts[t])}
              </span>
            );
          })}
        </div>
      </header>

      <div className="px-4 pb-3.5 space-y-2.5">
        {offering.message && (
          <div>
            <p className={`text-sm leading-[1.75] whitespace-pre-line ${full || !long ? "" : "line-clamp-3"}`} style={{ color: C.text }}>
              {offering.message}
            </p>
            {long && (
              <button onClick={() => setFull(!full)} className="text-sm font-medium hover:underline" style={{ color: C.brand }}>
                {full ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
        {images.length > 0 && (
          <ImageGrid images={images} onOpen={(i) => onOpenMedia(images.map((src) => ({ type: "image", src })), i)} />
        )}
        {offering.videoLink && <VideoBlock link={offering.videoLink} />}
        {audios.map((src, i) => (
          <AudioPlayer key={src} src={src} label={audios.length > 1 ? `Audio offering ${i + 1}` : "Audio offering"} />
        ))}
      </div>

      <footer className="flex items-center gap-3 px-4 pt-2.5 pb-3.5 border-t" style={{ borderColor: "rgba(128,75,35,0.06)" }}>
        {/* Likes / comments need backend support → visible but disabled */}
        <button disabled title="Coming soon" className="flex items-center gap-1.5 text-xs opacity-60 cursor-not-allowed" style={{ color: C.muted }}>
          <Heart className="w-3.5 h-3.5" /> Like
        </button>
        <button disabled title="Coming soon" className="flex items-center gap-1.5 text-xs opacity-60 cursor-not-allowed" style={{ color: C.muted }}>
          <MessageCircle className="w-3.5 h-3.5" /> Comment
        </button>
        <button onClick={onShare} className="ml-auto flex items-center gap-1.5 text-xs hover:text-[#804B23] transition-colors" style={{ color: C.muted }}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </footer>
    </article>
  );
}
