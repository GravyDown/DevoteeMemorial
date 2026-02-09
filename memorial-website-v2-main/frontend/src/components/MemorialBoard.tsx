import { useState, useEffect } from "react";
import MemorialCard from "./MemorialCard";
import Filters, { FilterState } from "./Filters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Memorial {
  id: string;
  name: string;
  years: string;
  image: string;
  description?: string;
  location?: string;
}

export default function MemorialBoard() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    yearOfDeparture: "all",
    serviceCategory: "all",
    location: "all",
    gender: "all",
    guru: "all",
  });

  const [sliderIndex, setSliderIndex] = useState(0);
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CARD_WIDTH = 190;
  const GAP = 24;

  const VITE_API_URL = import.meta.env.VITE_API_URL || "";
  // Fetch memorials from backend
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/accepted/profiles")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profiles");
        }
        const data = await res.json();
        setMemorials(data);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching profiles:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSliderIndex(0);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      yearOfDeparture: "all",
      serviceCategory: "all",
      location: "all",
      gender: "all",
      guru: "all",
    });
    setSliderIndex(0);
  };

  const handleNextSlide = () => {
    if (!memorials.length) return;
    setSliderIndex((prev) => {
      const next = prev + 1;
      if (next >= memorials.length) return 0;
      return next;
    });
  };

  const handlePrevSlide = () => {
    if (!memorials.length) return;
    setSliderIndex((prev) => {
      const next = prev - 1;
      if (next < 0) return memorials.length - 1;
      return next;
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-12">
      <div className="text-left mb-6">
        <h2 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">
          Vaishnav Memorial Board
        </h2>
      </div>

      {/* Featured Card */}
      <div className="bg-[#6B8E9B] rounded-3xl p-0 text-white relative overflow-hidden mb-12 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-20"></div>

        <div className="flex flex-col md:flex-row items-stretch">
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-lg shrink-0">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz34AXN9tz2eaTk4yjFzzlj6WO3roO8by2tg&s"
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold">
                    HH Gopal Krishna Goswami
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-sm">1944 - 2024</span>
                  <span className="bg-white/20 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Recently departed
                  </span>
                </div>
              </div>
            </div>

            <p className="text-white/90 text-lg mb-2 font-medium">
              "His Holiness Gopal Krishna Goswami Maharaj has returned to
              Krishna's abode."
            </p>
          </div>

          <div className="w-full md:w-auto bg-white/10 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-center items-center border-l border-white/10">
            <Button className="bg-white text-[#5D7E96] hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium shadow-lg">
              View Offering →
            </Button>
          </div>
        </div>

        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

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
      ) : memorials.length === 0 ? (
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
        <div className="relative group">
          <div className="mt-8">
            {/* MOBILE: vertical list */}
            <div className="grid grid-cols-1 sm:hidden gap-6">
              {memorials.map((memorial) => (
                <MemorialCard
                  key={memorial.id}
                  id={memorial.id}
                  name={memorial.name}
                  years={memorial.years}
                  image={memorial.image}
                  isVerified
                />
              ))}
            </div>

            {/* DESKTOP: slider */}
            <div className="hidden sm:block relative group">
              <div className="overflow-hidden -mx-4 px-4 py-4">
                <motion.div
                  className="flex gap-6"
                  animate={{ x: -(sliderIndex * (CARD_WIDTH + GAP)) }}
                >
                  {memorials.map((memorial) => (
                    <div
                      key={memorial.id}
                      className="shrink-0"
                      style={{ width: CARD_WIDTH }}
                    >
                      <MemorialCard
                        id={memorial.id}
                        name={memorial.name}
                        years={memorial.years}
                        image={memorial.image}
                        isVerified
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrevSlide}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-[#8D6E63] rounded-full shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-[#8D6E63]/10"
            aria-label="Previous disciples"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextSlide}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-[#8D6E63] rounded-full shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-[#8D6E63]/10"
            aria-label="Next disciples"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
