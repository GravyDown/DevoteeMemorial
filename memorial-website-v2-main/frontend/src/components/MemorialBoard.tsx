import { useState, useEffect, useRef } from "react";
import MemorialCard from "./MemorialCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

interface Memorial {
  _id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  coverImage?: string;
  description?: string;
  location?: string;
  spiritualMaster?: string;
  coreServices?: string[];
}

interface FilterState {
  search: string;
  yearOfDeparture: string;
  serviceCategory: string;
  location: string;
  gender: string;
  guru: string;
}

const EMPTY_FILTERS: FilterState = {
  search: "",
  yearOfDeparture: "all",
  serviceCategory: "all",
  location: "all",
  gender: "all",
  guru: "all",
};

const FILTER_OPTIONS: Record<string, string[]> = {
  gender: ["Male", "Female"],
  yearOfDeparture: Array.from({ length: 35 }, (_, i) => (2024 - i).toString()),
  guru: [
    "Srila Prabhupada",
    "HH Radhanath Swami",
    "HH Gopal Krishna Goswami",
    "HH Jayapataka Swami",
  ],
  serviceCategory: [
    "Kirtan",
    "Book Distribution",
    "Temple Management",
    "Cooking",
    "Preaching",
  ],
  location: ["Vrindavan", "Mayapur", "Mumbai", "London", "New York"],
};

const getYear = (dateStr?: string) => {
  if (!dateStr) return "?";
  return new Date(dateStr).getFullYear().toString();
};

export default function MemorialBoard() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const VITE_API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    setLoading(true);
    fetch(`${VITE_API_URL}/profiles`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();
        const profiles: Memorial[] = Array.isArray(data)
          ? data
          : data.profiles || data.data || data.results || [];
        setMemorials(profiles);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Frontend filtering ── */
  const filtered = memorials.filter((m) => {
    const q = filters.search.toLowerCase();
    const deathYear = getYear(m.deathDate);
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.location?.toLowerCase().includes(q) ?? false) ||
      deathYear.includes(q);
    const matchesYear =
      filters.yearOfDeparture === "all" ||
      deathYear === filters.yearOfDeparture;
    const matchesLocation =
      filters.location === "all" ||
      (m.location?.toLowerCase().includes(filters.location.toLowerCase()) ??
        false);
    const matchesGuru =
      filters.guru === "all" ||
      (m.spiritualMaster?.toLowerCase().includes(filters.guru.toLowerCase()) ??
        false);
    const matchesService =
      filters.serviceCategory === "all" ||
      (m.coreServices?.some((s) =>
        s.toLowerCase().includes(filters.serviceCategory.toLowerCase()),
      ) ??
        false);
    return (
      matchesSearch &&
      matchesYear &&
      matchesLocation &&
      matchesGuru &&
      matchesService
    );
  });

  const sorted = [...filtered].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );

  const suggestions =
    filters.search.length > 0
      ? memorials
          .filter((m) =>
            m.name.toLowerCase().includes(filters.search.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "search") setShowSuggestions(true);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (m: Memorial) => {
    navigate(`/disciples/${m._id}`);
    setShowSuggestions(false);
    setFilters((prev) => ({ ...prev, search: "" }));
  };

  // Hero banner cycles through memorials fetched from API
  const heroMemorial = memorials[heroIndex] ?? null;
  const handleHeroPrev = () =>
    setHeroIndex((p) =>
      p - 1 < 0 ? Math.max(memorials.length - 1, 0) : p - 1,
    );
  const handleHeroNext = () =>
    setHeroIndex((p) => (p + 1 >= memorials.length ? 0 : p + 1));

  const hasActiveFilters = Object.entries(filters).some(([k, v]) =>
    k === "search" ? v !== "" : v !== "all",
  );

  return (
    <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-12">
      {/* Heading */}
      <div className="text-left mb-6">
        <h2 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">
          Vaishnav Memorial Board
        </h2>
      </div>
      
      {/* ── Hero banner ── */}
      <div
        className="rounded-2xl text-white relative overflow-hidden mb-8 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, #3d6b7a 0%, #4a7d8e 50%, #5a90a3 100%)",
          minHeight: "96px",
        }}
      >
        {/* Lotus decoration — right side, more visible */}
        <div className="absolute right-48 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
          <svg width="80" height="100" viewBox="0 0 72 90" fill="none">
            <path
              d="M36 80 Q23 52 27 24 Q36 6 36 6 Q36 6 45 24 Q49 52 36 80Z"
              fill="white"
            />
            <path
              d="M36 74 Q14 56 16 28 Q23 12 29 16 Q32 44 36 74Z"
              fill="white"
              opacity="0.7"
            />
            <path
              d="M36 74 Q58 56 56 28 Q49 12 43 16 Q40 44 36 74Z"
              fill="white"
              opacity="0.7"
            />
            <path
              d="M36 68 Q4 60 5 32 Q13 16 24 24 Q27 48 36 68Z"
              fill="white"
              opacity="0.45"
            />
            <path
              d="M36 68 Q68 60 67 32 Q59 16 48 24 Q45 48 36 68Z"
              fill="white"
              opacity="0.45"
            />
            <ellipse
              cx="36"
              cy="83"
              rx="12"
              ry="3.5"
              fill="white"
              opacity="0.25"
            />
          </svg>
        </div>

        <div className="flex items-center px-4 py-4 gap-4">
          {/* Prev */}
          <button
            onClick={handleHeroPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/15 hover:bg-black/30 text-white transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Avatar — larger like Figma */}
          <div className="w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden shrink-0 shadow-md">
            <img
              src={
                heroMemorial?.coverImage ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz34AXN9tz2eaTk4yjFzzlj6WO3roO8by2tg&s"
              }
              alt={heroMemorial?.name || "Featured devotee"}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz34AXN9tz2eaTk4yjFzzlj6WO3roO8by2tg&s";
              }}
            />
          </div>

          {/* Info — name on top, dates below (matching Figma) */}
          <div className="flex-1 min-w-0">
            {/* Dates + badge row */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/80 text-sm font-medium">
                {getYear(heroMemorial?.birthDate)} –{" "}
                {getYear(heroMemorial?.deathDate)}
              </span>
              <span className="bg-[#2d5a6b]/70 border border-white/20 text-white text-xs px-3 py-0.5 rounded-full font-medium backdrop-blur-sm">
                Recently departed
              </span>
            </div>

            {/* Name bold, then message */}
            <p className="text-white text-sm leading-snug">
              <span className="font-bold text-white">
                {heroMemorial?.name ?? "HH Gopal Krishna Goswami maharaj"}
              </span>{" "}
              <span className="text-white/80">
                has returned to Krishna's abode
              </span>
            </p>
          </div>

          {/* CTA button */}
          <Button
            onClick={() =>
              heroMemorial && navigate(`/disciples/${heroMemorial._id}`)
            }
            className="bg-white text-[#4a7a8a] hover:bg-white/95 rounded-full px-6 h-9 text-sm font-semibold shadow-md shrink-0 whitespace-nowrap border border-white/20"
          >
            Give Offering →
          </Button>

          {/* Next */}
          <button
            onClick={handleHeroNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/15 hover:bg-black/30 text-white transition-colors shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* ── Search bar ── */}
      <div className="relative mb-4" ref={searchRef}>
        <Input
          placeholder="Search Name"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          onFocus={() => filters.search.length > 0 && setShowSuggestions(true)}
          className="pl-6 pr-14 bg-white border border-[#e8d5c4] rounded-full h-11 text-[#5D4037] placeholder:text-[#8D6E63]/50 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-[#8D6E63]/30"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8D6E63] rounded-full p-1.5 text-white cursor-pointer hover:bg-[#795548] transition-colors">
          <Search className="w-4 h-4" />
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1 w-full bg-white border border-[#e8d5c4] rounded-2xl shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {suggestions.map((m) => (
                <div
                  key={m._id}
                  onClick={() => handleSuggestionClick(m)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF8E7] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <img
                    src={m.coverImage || ""}
                    alt={m.name}
                    className="w-8 h-8 object-cover rounded-full border border-gray-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#5D4037] font-medium text-sm truncate">
                      {m.name}
                    </div>
                    <div className="text-xs text-[#8D6E63] truncate">
                      {m.location && `${m.location} • `}
                      {getYear(m.birthDate)} – {getYear(m.deathDate)}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* ── Filter chips ── */}
      <div className="flex flex-wrap gap-2 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={handleReset}
            className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-4 gap-1.5 h-[34px] text-[13px] shadow-none"
          >
            {hasActiveFilters ? "Reset" : "Filter"}{" "}
            <SlidersHorizontal className="w-3 h-3" />
          </Button>

          {[
            { label: "Gender", key: "gender" },
            { label: "Year of Departure", key: "yearOfDeparture" },
            { label: "Initiating Guru", key: "guru" },
            { label: "Service Category", key: "serviceCategory" },
            { label: "Location", key: "location" },
          ].map((filter) => (
            <Popover key={filter.key}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "rounded-full border-[#804B23]/25 text-[#5D4037] hover:bg-[#804B23]/5 bg-transparent h-[34px] px-3 gap-1.5 font-normal text-[13px] shadow-none",
                    filters[filter.key as keyof FilterState] !== "all" &&
                      "bg-[#804B23]/10 border-[#804B23] font-medium",
                  )}
                >
                  {filters[filter.key as keyof FilterState] !== "all"
                    ? filters[filter.key as keyof FilterState]
                    : filter.label}
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() =>
                          handleFilterChange(
                            filter.key as keyof FilterState,
                            "all",
                          )
                        }
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters[filter.key as keyof FilterState] === "all"
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        All
                      </CommandItem>
                      {FILTER_OPTIONS[filter.key]?.map((option) => (
                        <CommandItem
                          key={option}
                          onSelect={() =>
                            handleFilterChange(
                              filter.key as keyof FilterState,
                              option,
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters[filter.key as keyof FilterState] ===
                                option
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setSortAsc((p) => !p)}
          title={sortAsc ? "Sort Z→A" : "Sort A→Z"}
          className="rounded-full border-[#804B23]/25 text-[#5D4037] hover:bg-[#804B23]/5 bg-transparent w-[34px] h-[34px] p-0 shadow-none"
        >
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>
      {/* ── Cards grid — matches Figma full grid ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#8D6E63]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p className="text-lg">Error loading memorials: {error}</p>
          <Button
            variant="link"
            onClick={() => window.location.reload()}
            className="text-[#8D6E63]"
          >
            Try Again
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-[#8D6E63]/60">
          <p className="text-lg">No memorials found matching your criteria.</p>
          <Button
            variant="link"
            onClick={handleReset}
            className="text-[#8D6E63]"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        // ✅ Figma: full responsive grid (6 cols desktop, 4 tablet, 3 mobile, 2 small)
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sorted.map((memorial) => (
            <MemorialCard
              key={memorial._id}
              id={memorial._id}
              name={memorial.name}
              years={`${getYear(memorial.birthDate)} - ${getYear(memorial.deathDate)}`}
              image={memorial.coverImage || ""}
              isVerified
            />
          ))}
        </div>
      )}
    </section>
  );
}
