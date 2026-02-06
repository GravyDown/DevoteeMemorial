import { useRef } from "react";
import { X, Upload, Music, Image as ImageIcon } from "lucide-react";

type UploadBoxProps = {
  label: string;
  instruction: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesSelect: (files: File[]) => void;
  onRemove: (index: number) => void;
};

export default function UploadBox({
  label,
  instruction,
  accept,
  multiple = false,
  files,
  onFilesSelect,
  onRemove,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onFilesSelect(Array.from(e.target.files));
    e.target.value = "";
  };

  const isImage = accept.includes("image");
  const isAudio = accept.includes("audio");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#5D4037]">{label}</label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
                   hover:border-[#8D6E63] transition bg-[#FFF8E7]"
      >
        <Upload className="mx-auto mb-2 text-[#8D6E63]" />
        <p className="text-sm text-[#8D6E63]">{instruction}</p>
        <p className="text-xs text-[#A1887F] mt-1">
          {multiple ? "You can upload multiple files" : "Single file only"}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={handleSelect}
        />
      </div>

      {/* Preview */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white border rounded-xl px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm text-[#5D4037]">
                {isImage && <ImageIcon size={16} />}
                {isAudio && <Music size={16} />}
                <span className="truncate max-w-[180px]">
                  {file.name}
                </span>
                <span className="text-xs text-[#999]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-[#B71C1C] hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
