import { Upload } from "lucide-react";

interface UploadBoxProps {
  label?: string;
  instruction?: string;
}

export default function UploadBox({ 
  label = "Profile Photo Upload (Required)", 
  instruction = "Upload media" 
}: UploadBoxProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#5D4037] font-medium text-sm">{label}</label>
      <div className="border-2 border-dashed border-gray-200 rounded-xl h-16 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors text-[#8D6E63]/60">
        <span>{instruction}</span>
        <Upload className="w-4 h-4" />
      </div>
    </div>
  );
}