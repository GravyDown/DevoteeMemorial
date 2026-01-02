import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronRight, ArrowUpDown } from "lucide-react";

export default function FilterBar() {
  const filters = [
    "Gender",
    "Year of Departure",
    "Initiating Guru",
    "Service Category",
    "Location"
  ];

  return (
    <div className="px-6 md:px-16 mb-12">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Main Filter Button */}
          <Button 
            className="bg-[#8D6E63] hover:bg-[#795548] text-white rounded-full px-6 gap-2 h-[36px] text-[14px] shadow-none"
          >
            Filter <SlidersHorizontal className="w-3.5 h-3.5" />
          </Button>

          {/* Filter Chips */}
          {filters.map((filter) => (
            <Button
              key={filter}
              variant="outline"
              className="rounded-full border-[#8D6E63]/30 text-[#5D4037] hover:bg-[#8D6E63]/5 bg-transparent h-[36px] px-4 gap-2 font-normal text-[14px] shadow-none"
            >
              {filter}
              <ChevronRight className="w-3 h-3 opacity-50" />
            </Button>
          ))}
        </div>

        {/* Sort Button */}
        <Button variant="outline" className="rounded-full border-[#8D6E63]/30 text-[#5D4037] hover:bg-[#8D6E63]/5 bg-transparent w-[36px] h-[36px] p-0 shadow-none">
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
