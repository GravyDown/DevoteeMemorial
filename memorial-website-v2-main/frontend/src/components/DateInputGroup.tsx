import { Input } from "@/components/ui/input";

interface DateInputGroupProps {
  label: string;
  birthDate?: string;
  deathDate?: string;
  onBirthDateChange?: (val: string) => void;
  onDeathDateChange?: (val: string) => void;
  birthDateUnknown?: boolean;
  onBirthDateUnknownChange?: (val: boolean) => void;
}

export default function DateInputGroup({
  label,
  birthDate = "",
  deathDate = "",
  onBirthDateChange,
  onDeathDateChange,
  birthDateUnknown = false,
  onBirthDateUnknownChange,
}: DateInputGroupProps) {
  const parseParts = (date: string) => {
    const [y = "", m = "", d = ""] = date.split("-");
    return { d, m, y };
  };

  const birth = parseParts(birthDate);
  const death = parseParts(deathDate);

  const handleBirth = (part: "d" | "m" | "y", val: string) => {
    const updated = { ...birth, [part]: val };
    onBirthDateChange?.(`${updated.y}-${updated.m}-${updated.d}`);
  };

  const handleDeath = (part: "d" | "m" | "y", val: string) => {
    const updated = { ...death, [part]: val };
    onDeathDateChange?.(`${updated.y}-${updated.m}-${updated.d}`);
  };

  const handleUnknownToggle = (checked: boolean) => {
    onBirthDateUnknownChange?.(checked);
    if (checked) {
      // clear birth date fields when marked unknown
      onBirthDateChange?.("");
    }
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
            disabled={birthDateUnknown}
            onChange={(e) => handleBirth("d", e.target.value)}
            className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none disabled:opacity-40 disabled:bg-gray-50"
          />
          <Input
            placeholder="MM"
            maxLength={2}
            value={birth.m}
            disabled={birthDateUnknown}
            onChange={(e) => handleBirth("m", e.target.value)}
            className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none disabled:opacity-40 disabled:bg-gray-50"
          />
          <Input
            placeholder="YYYY"
            maxLength={4}
            value={birth.y}
            disabled={birthDateUnknown}
            onChange={(e) => handleBirth("y", e.target.value)}
            className="w-16 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none disabled:opacity-40 disabled:bg-gray-50"
          />
        </div>

        {/* Unknown toggle */}
        <label className="flex items-center gap-1.5 text-xs text-[#5D4037]/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={birthDateUnknown}
            onChange={(e) => handleUnknownToggle(e.target.checked)}
            className="accent-[#804B23] w-3.5 h-3.5"
          />
          Birth date unknown
        </label>

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