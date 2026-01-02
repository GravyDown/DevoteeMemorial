import { Input } from "@/components/ui/input";

interface InputFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#5D4037] font-medium text-sm">{label}</label>
      <Input 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400 focus-visible:ring-[#8D6E63] shadow-none"
      />
    </div>
  );
}
