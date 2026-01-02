import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ChevronRight, ArrowUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  yearOfDeparture: string;
  serviceCategory: string;
  location: string;
  gender: string;
  guru: string;
}

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

const FILTER_OPTIONS: Record<string, string[]> = {
  gender: ["Male", "Female"],
  yearOfDeparture: Array.from({length: 35}, (_, i) => (2024 - i).toString()),
  guru: ["Srila Prabhupada", "HH Radhanath Swami", "HH Gopal Krishna Goswami", "HH Jayapataka Swami"],
  serviceCategory: ["Kirtan", "Book Distribution", "Temple Management", "Cooking", "Preaching"],
  location: ["Vrindavan", "Mayapur", "Mumbai", "London", "New York"],
};

export default function Filters({ filters, onFilterChange, onReset }: FiltersProps) {
  return (
    <div className="flex flex-col gap-6 my-8">
      {/* Search Bar */}
      <div className="relative w-full">
        <Input 
          placeholder="Search Name" 
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-6 bg-[#FFF8E7] border-none rounded-full h-12 text-[#5D4037] placeholder:text-[#8D6E63]/50 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-[#8D6E63]/30"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8D6E63] rounded-full p-2 text-white cursor-pointer hover:bg-[#795548] transition-colors">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Filter Chips Row */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Main Filter Button */}
          <Button 
            onClick={onReset}
            className="bg-[#8D6E63] hover:bg-[#795548] text-white rounded-full px-6 gap-2 h-[36px] text-[14px]"
          >
            Reset <SlidersHorizontal className="w-3.5 h-3.5" />
          </Button>

          {/* Filter Pills */}
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
                    "rounded-full border-[#8D6E63]/30 text-[#5D4037] hover:bg-[#8D6E63]/5 bg-transparent h-[36px] px-4 gap-2 font-normal text-[14px]",
                    filters[filter.key as keyof FilterState] !== "all" && "bg-[#8D6E63]/10 border-[#8D6E63]"
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
                        onSelect={() => onFilterChange(filter.key as keyof FilterState, "all")}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters[filter.key as keyof FilterState] === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All
                      </CommandItem>
                      {FILTER_OPTIONS[filter.key]?.map((option) => (
                        <CommandItem
                          key={option}
                          onSelect={() => onFilterChange(filter.key as keyof FilterState, option)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters[filter.key as keyof FilterState] === option ? "opacity-100" : "opacity-0"
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

        {/* Sort Button */}
        <Button variant="outline" className="rounded-full border-[#8D6E63]/30 text-[#5D4037] hover:bg-[#8D6E63]/5 bg-transparent w-[36px] h-[36px] p-0">
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}