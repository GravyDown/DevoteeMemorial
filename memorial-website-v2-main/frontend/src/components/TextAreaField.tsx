import { Textarea } from "@/components/ui/textarea";

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextAreaField({ label, placeholder, value, onChange }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#5D4037] font-medium text-sm">{label}</label>
      <Textarea 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="min-h-[120px] rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400 focus-visible:ring-[#8D6E63] shadow-none resize-none p-4"
      />
    </div>
  );
}
