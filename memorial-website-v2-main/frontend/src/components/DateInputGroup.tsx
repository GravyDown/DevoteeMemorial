import { Input } from "@/components/ui/input";

interface DateInputGroupProps {
  label: string;
}

export default function DateInputGroup({ label }: DateInputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#5D4037] font-medium text-sm">{label}</label>
      <div className="flex flex-wrap items-center gap-4">
        {/* Birth Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D4037]/70 font-medium whitespace-nowrap">Birth Date</span>
          <Input placeholder="DD" className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none" />
          <Input placeholder="MM" className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none" />
          <Input placeholder="YYYY" className="w-16 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none" />
        </div>
        
        {/* Death Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D4037]/70 font-medium whitespace-nowrap">Death Date</span>
          <Input placeholder="DD" className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none" />
          <Input placeholder="MM" className="w-12 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none" />
          <Input placeholder="YYYY" className="w-16 h-10 rounded-lg border-gray-200 text-center px-1 placeholder:text-gray-300 shadow-none" />
        </div>
      </div>
    </div>
  );
}
