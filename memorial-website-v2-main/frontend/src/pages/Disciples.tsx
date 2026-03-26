import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Memorial {
  _id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  coverImage?: string;
  location?: string;
  spiritualMaster?: string;
  ashramRole?: string;
  coreServices?: string[];
  associatedTemple?: string;
  description?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "";

const getYear = (d?: string) =>
  d ? new Date(d).getFullYear().toString() : "?";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ASHRAM_OPTIONS = ["All", "Brahmachari", "Grihastha", "Vanaprastha", "Sannyasi"];
const SERVICE_OPTIONS = ["All", "Pujari", "Cooking", "Management", "Preaching", "Book Distribution"];

export default function Disciples() {
  const navigate = useNavigate();
  const alphabetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [ashramFilter, setAshramFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [templeFilter, setTempleFilter] = useState("All");

  // ── Fetch ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/profiles`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const profiles: Memorial[] = Array.isArray(data)
          ? data
          : data.profiles || data.data || [];
        setMemorials(profiles);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Hero rotation ────────────────────────────────────────
  useEffect(() => {
    if (memorials.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((p) => (p + 1 >= memorials.length ? 0 : p + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [memorials]);

  // ── Derived data ─────────────────────────────────────────
  const temples = [
    "All",
    ...Array.from(
      new Set(memorials.map((m) => m.associatedTemple).filter(Boolean))
    ),
  ] as string[];

  const filtered = memorials.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.location?.toLowerCase().includes(q) ?? false) ||
      (m.spiritualMaster?.toLowerCase().includes(q) ?? false);
    const matchAshram =
      ashramFilter === "All" || m.ashramRole === ashramFilter;
    const matchService =
      serviceFilter === "All" ||
      (m.coreServices?.some((s) =>
        s.toLowerCase().includes(serviceFilter.toLowerCase())
      ) ?? false);
    const matchTemple =
      templeFilter === "All" || m.associatedTemple === templeFilter;
    return matchSearch && matchAshram && matchService && matchTemple;
  });

  // Group by first letter
  const grouped = ALPHABET.reduce(
    (acc, letter) => {
      const items = filtered.filter((m) =>
        m.name.toUpperCase().startsWith(letter)
      );
      if (items.length > 0) acc[letter] = items;
      return acc;
    },
    {} as Record<string, Memorial[]>
  );

  const activeLetters = Object.keys(grouped);

  // Stats
  const totalDevotees = memorials.length;
  const uniqueTemples = new Set(
    memorials.map((m) => m.associatedTemple).filter(Boolean)
  ).size;
  const uniqueLocations = new Set(
    memorials.map((m) => m.location).filter(Boolean)
  ).size;

  const hero = memorials[heroIndex] ?? null;

  const scrollToLetter = (letter: string) => {
    alphabetRefs.current[letter]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ── UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-12">

          {/* ── Header ── */}
          <div className="mb-8">
            <h1 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">
              Disciples Directory
            </h1>
            <p className="text-[#8D6E63]/70 text-sm mt-1">
              A complete record of departed Vaishnavas — their lives, service,
              and legacy
            </p>
          </div>

          {/* ── Stats ── */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: "Devotees Honoured", value: totalDevotees, emoji: "🙏" },
                { label: "Temples Represented", value: uniqueTemples, emoji: "🛕" },
                { label: "Locations", value: uniqueLocations, emoji: "🌏" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-5 border border-[#8D6E63]/10 shadow-sm text-center"
                >
                  <div className="text-2xl mb-1">{stat.emoji}</div>
                  <div className="text-2xl font-bold text-[#5D4037]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#8D6E63] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Featured Spotlight ── */}
          {hero && (
            <div
              className="rounded-2xl text-white relative overflow-hidden mb-10 shadow-md cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #3d6b7a 0%, #4a7d8e 50%, #5a90a3 100%)",
              }}
              onClick={() => navigate(`/disciples/${hero._id}`)}
            >
              <div className="flex items-center px-5 py-5 gap-5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroIndex((p) =>
                      p - 1 < 0 ? memorials.length - 1 : p - 1
                    );
                  }}
                  className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-20 h-20 rounded-full border-2 border-white/50 overflow-hidden shrink-0 shadow-md">
                  <img
                    src={hero.coverImage || ""}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 text-white text-xs px-3 py-0.5 rounded-full">
                      Featured Devotee
                    </span>
                    <span className="text-white/70 text-sm">
                      {getYear(hero.birthDate)} – {getYear(hero.deathDate)}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg leading-snug truncate">
                    {hero.name}
                  </p>
                  {hero.location && (
                    <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hero.location}
                    </p>
                  )}
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/disciples/${hero._id}`);
                  }}
                  className="bg-white text-[#4a7a8a] hover:bg-white/95 rounded-full px-5 h-9 text-sm font-semibold shrink-0"
                >
                  View Profile <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroIndex((p) =>
                      p + 1 >= memorials.length ? 0 : p + 1
                    );
                  }}
                  className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1 pb-3">
                {memorials.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeroIndex(i);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === heroIndex % 8
                        ? "bg-white w-4"
                        : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Search + Filters ── */}
          <div className="flex flex-wrap gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name, location or guru..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-6 pr-12 bg-white border border-[#e8d5c4] rounded-full h-10 text-[#5D4037] placeholder:text-[#8D6E63]/50 text-sm shadow-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8D6E63] rounded-full p-1.5 text-white">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Ashram filter */}
            <select
              value={ashramFilter}
              onChange={(e) => setAshramFilter(e.target.value)}
              className="h-10 px-4 rounded-full border border-[#e8d5c4] bg-white text-[#5D4037] text-sm focus:outline-none focus:ring-1 focus:ring-[#8D6E63]/30"
            >
              {ASHRAM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === "All" ? "Ashram / Role" : o}
                </option>
              ))}
            </select>

            {/* Service filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-10 px-4 rounded-full border border-[#e8d5c4] bg-white text-[#5D4037] text-sm focus:outline-none focus:ring-1 focus:ring-[#8D6E63]/30"
            >
              {SERVICE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === "All" ? "Core Service" : o}
                </option>
              ))}
            </select>

            {/* Temple filter */}
            <select
              value={templeFilter}
              onChange={(e) => setTempleFilter(e.target.value)}
              className="h-10 px-4 rounded-full border border-[#e8d5c4] bg-white text-[#5D4037] text-sm focus:outline-none focus:ring-1 focus:ring-[#8D6E63]/30"
            >
              {temples.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "Temple" : t}
                </option>
              ))}
            </select>

            {/* Reset */}
            {(search || ashramFilter !== "All" || serviceFilter !== "All" || templeFilter !== "All") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setAshramFilter("All");
                  setServiceFilter("All");
                  setTempleFilter("All");
                }}
                className="h-10 rounded-full border-[#8D6E63]/30 text-[#5D4037] text-sm px-4"
              >
                Reset
              </Button>
            )}
          </div>

          {/* ── Count ── */}
          {!loading && !error && (
            <div className="flex items-center gap-2 mb-6 text-sm text-[#8D6E63]">
              <Users className="w-4 h-4" />
              <span>
                {filtered.length} devotee{filtered.length !== 1 ? "s" : ""}
                {search ? ` matching "${search}"` : ""}
              </span>
            </div>
          )}

          {/* ── Main content ── */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#8D6E63]" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#804B23] text-white rounded-full px-6"
              >
                Try Again
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🙏</div>
              <p className="text-[#8D6E63] text-lg">No devotees found.</p>
            </div>
          ) : (
            <div className="flex gap-8">

              {/* ── Alphabet sidebar ── */}
              <div className="hidden lg:flex flex-col gap-0.5 sticky top-24 self-start">
                {ALPHABET.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => scrollToLetter(letter)}
                    disabled={!activeLetters.includes(letter)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                      activeLetters.includes(letter)
                        ? "text-[#804B23] hover:bg-[#804B23]/10 cursor-pointer"
                        : "text-[#8D6E63]/30 cursor-default"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* ── List view ── */}
              <div className="flex-1 space-y-10">
                {activeLetters.map((letter) => (
                  <div
                    key={letter}
                    ref={(el) => { alphabetRefs.current[letter] = el; }}
                  >
                    {/* Letter heading */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold text-[#804B23]">
                        {letter}
                      </span>
                      <div className="flex-1 h-px bg-[#8D6E63]/15" />
                    </div>

                    {/* Cards list */}
                    <div className="space-y-3">
                      {grouped[letter].map((m, i) => (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => navigate(`/disciples/${m._id}`)}
                          className="bg-white rounded-2xl p-4 border border-[#8D6E63]/10 shadow-sm hover:shadow-md hover:border-[#8D6E63]/25 transition-all cursor-pointer flex items-center gap-5 group"
                        >
                          {/* Photo */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#FFF1DF] border border-[#8D6E63]/10">
                            {m.coverImage ? (
                              <img
                                src={m.coverImage}
                                alt={m.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8D6E63]/40 text-xs">
                                🙏
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-[#5D4037] text-base leading-snug">
                                  {m.name}
                                </h3>
                                <p className="text-xs text-[#8D6E63] mt-0.5">
                                  {getYear(m.birthDate)} – {getYear(m.deathDate)}
                                  {m.location && (
                                    <span className="ml-2 inline-flex items-center gap-0.5">
                                      <MapPin className="w-3 h-3" />
                                      {m.location}
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1.5 shrink-0">
                                {m.ashramRole && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF1DF] text-[#804B23] border border-[#804B23]/15 font-medium">
                                    {m.ashramRole}
                                  </span>
                                )}
                                {m.coreServices?.[0] && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#8D6E63] border border-[#8D6E63]/15 font-medium">
                                    {m.coreServices[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bio snippet */}
                            {m.description && (
                              <p className="text-xs text-[#8D6E63]/70 mt-1.5 line-clamp-1">
                                {m.description}
                              </p>
                            )}

                            {/* Guru */}
                            {m.spiritualMaster && (
                              <p className="text-xs text-[#8D6E63] mt-1">
                                <span className="font-medium">Guru:</span>{" "}
                                {m.spiritualMaster}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-4 h-4 text-[#8D6E63]/40 group-hover:text-[#804B23] group-hover:translate-x-1 transition-all shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}