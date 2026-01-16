import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectOption = {
  label: string;
  value: string;
};

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#5D4037] font-medium text-sm">
        {label}
      </label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] focus:ring-[#8D6E63] shadow-none">
          <SelectValue
            placeholder={
              <span className="text-gray-400">
                {placeholder}
              </span>
            }
          />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
