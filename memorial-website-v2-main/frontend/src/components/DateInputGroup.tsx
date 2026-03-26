import { Input } from "@/components/ui/input";

interface DateInputGroupProps {
  label: string;
  birthDate?: string;       // format: yyyy-MM-dd
  deathDate?: string;       // format: yyyy-MM-dd
  onBirthDateChange?: (val: string) => void;
  onDeathDateChange?: (val: string) => void;
}

export default function DateInputGroup({
  label,
  birthDate = "",
  deathDate = "",
  onBirthDateChange,
  onDeathDateChange,
}: DateInputGroupProps) {

  // Split "yyyy-MM-dd" into parts
  const parseParts = (date: string) => {
    const [y = "", m = "", d = ""] = date.split("-");
    return { d, m, y };
  };

  const birth = parseParts(birthDate);
  const death = parseParts(deathDate);

  // Rebuild "yyyy-MM-dd" when any part changes
  const handleBirth = (part: "d" | "m" | "y", val: string) => {
    const updated = { ...birth, [part]: val };
    onBirthDateChange?.(`${updated.y}-${updated.m}-${updated.d}`);
  };

  const handleDeath = (part: "d" | "m" | "y", val: string) => {
    const updated = { ...death, [part]: val };
    onDeathDateChange?.(`${updated.y}-${updated.m}-${updated.d}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#5D4037] font-medium text-sm">{label}</label>
      <div className="flex flex-wrap items-center gap-4">

        {/* Birth Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D4037]/70 font-medium whitespace-nowrap">
            Birth Date
          </span>
          <Input
            placeholder="DD"
            maxLength={2}
            value={birth.d}
            onChange={(e) => handleBirth("d", e.target.value)}
            className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none"
          />
          <Input
            placeholder="MM"
            maxLength={2}
            value={birth.m}
            onChange={(e) => handleBirth("m", e.target.value)}
            className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none"
          />
          <Input
            placeholder="YYYY"
            maxLength={4}
            value={birth.y}
            onChange={(e) => handleBirth("y", e.target.value)}
            className="w-16 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none"
          />
        </div>

        {/* Death Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D4037]/70 font-medium whitespace-nowrap">
            Death Date
          </span>
          <Input
            placeholder="DD"
            maxLength={2}
            value={death.d}
            onChange={(e) => handleDeath("d", e.target.value)}
            className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none"
          />
          <Input
            placeholder="MM"
            maxLength={2}
            value={death.m}
            onChange={(e) => handleDeath("m", e.target.value)}
            className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none"
          />
          <Input
            placeholder="YYYY"
            maxLength={4}
            value={death.y}
            onChange={(e) => handleDeath("y", e.target.value)}
            className="w-16 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none"
          />
        </div>

      </div>
    </div>
  );
}