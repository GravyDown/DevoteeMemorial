import { useState } from "react";
import MemorialCard from "./MemorialCard";
import Filters, { FilterState } from "./Filters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { motion } from "framer-motion";

export default function MemorialBoard() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    yearOfDeparture: "all",
    serviceCategory: "all",
    location: "all",
    gender: "all",
    guru: "all"
  });

  const [sliderIndex, setSliderIndex] = useState(0);
  const CARD_WIDTH = 190;
  const GAP = 24;

  // Mock data for memorials
  const memorials = [
    { _id: "1", name: "Srila Prabhupada", yearOfBirth: "1896", yearOfDeparture: "1977", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bhaktivedanta_Swami_Prabhupada_in_1975_at_Varsana_dhama.jpg/220px-Bhaktivedanta_Swami_Prabhupada_in_1975_at_Varsana_dhama.jpg", isVerified: true },
    { _id: "2", name: "Bhaktisiddhanta Sarasvati", yearOfBirth: "1874", yearOfDeparture: "1937", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Bhaktisiddhanta_Sarasvati.jpg/220px-Bhaktisiddhanta_Sarasvati.jpg", isVerified: true },
    { _id: "3", name: "Gaurakisora Dasa Babaji", yearOfBirth: "1838", yearOfDeparture: "1915", image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Gaura_Kishora_Dasa_Babaji.jpg", isVerified: true },
  ];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSliderIndex(0);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      yearOfDeparture: "all",
      serviceCategory: "all",
      location: "all",
      gender: "all",
      guru: "all"
    });
    setSliderIndex(0);
  };

  const handleNextSlide = () => {
    if (!memorials) return;
    // Loop back to start if we've scrolled past the end
    setSliderIndex((prev) => {
      const next = prev + 1;
      // If we have fewer items than can fill the screen, or we're at the end, loop
      if (next >= memorials.length) return 0;
      return next;
    });
  };

  const handlePrevSlide = () => {
    if (!memorials) return;
    setSliderIndex((prev) => {
      const next = prev - 1;
      if (next < 0) return memorials.length - 1;
      return next;
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-12">
      <div className="text-left mb-6">
        <h2 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">Vaishnav Memorial Board</h2>
      </div>

      {/* Featured Card */}
      <div className="bg-[#6B8E9B] rounded-3xl p-0 text-white relative overflow-hidden mb-12 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          {/* Decorative pattern or logo could go here */}
        </div>

        <div className="flex flex-col md:flex-row items-stretch">
          {/* Left Content */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-lg shrink-0">
                <img src="https://i.pravatar.cc/300?img=12" alt="Featured" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold">HH Gopal Krishna Goswami</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-sm">1944 - 2024</span>
                  <span className="bg-white/20 text-xs px-3 py-1 rounded-full backdrop-blur-sm">Recently departed</span>
                </div>
              </div>
            </div>

            <p className="text-white/90 text-lg mb-2 font-medium">
              "His Holiness Gopal Krishna Goswami Maharaj has returned to Krishna's abode."
            </p>
          </div>

          {/* Right Action Area */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-center items-center border-l border-white/10">
            <Button className="bg-white text-[#5D7E96] hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium shadow-lg">
              View Offering →
            </Button>
          </div>
        </div>

        {/* Navigation Buttons */}
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

      {memorials === undefined ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#8D6E63]" />
        </div>
      ) : memorials.length === 0 ? (
        <div className="text-center py-12 text-[#8D6E63]/60">
          <p className="text-lg">No memorials found matching your criteria.</p>
          <Button variant="link" onClick={handleReset} className="text-[#8D6E63]">Clear Filters</Button>
        </div>
      ) : (
        <div className="relative group">
          <div className="overflow-hidden -mx-4 px-4 py-4">
            <motion.div
              className="flex gap-6"
              animate={{ x: -(sliderIndex * (CARD_WIDTH + GAP)) }}
              transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
            >
              {memorials.map((memorial) => (
                <div key={memorial._id} className="shrink-0" style={{ width: CARD_WIDTH }}>
                  <MemorialCard
                    id={memorial._id}
                    name={memorial.name}
                    years={`${memorial.yearOfBirth} - ${memorial.yearOfDeparture}`}
                    image={memorial.image}
                    isVerified={memorial.isVerified}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Previous Navigation Arrow */}
          <button
            onClick={handlePrevSlide}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-[#8D6E63] rounded-full shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-[#8D6E63]/10"
            aria-label="Previous disciples"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Navigation Arrow */}
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