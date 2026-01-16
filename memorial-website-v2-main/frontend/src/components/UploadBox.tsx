interface UploadBoxProps {
  label: string;
  instruction: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFilesSelect: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export default function UploadBox({
  label,
  instruction,
  accept,
  multiple = false,
  files,
  onFilesSelect,
  onRemove,
}: UploadBoxProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[#5D4037] font-medium text-sm">
        {label}
      </label>

      {/* Upload Area */}
      <label className="flex items-center justify-center h-20 rounded-xl border border-dashed border-gray-300 cursor-pointer bg-white hover:bg-[#FFF6EC] transition">
        <span className="text-sm text-[#8D6E63]">
          {instruction}
        </span>

        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) {
              onFilesSelect(Array.from(e.target.files));
            }
          }}
        />
      </label>

      {/* Preview List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-[#FFF8F0]"
            >
              <div className="flex items-center gap-3">
                {/* Image preview */}
                {file.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-12 h-12 rounded object-cover"
                  />
                )}

                {/* Audio preview */}
                {file.type.startsWith("audio/") && (
                  <audio controls className="h-8">
                    <source src={URL.createObjectURL(file)} />
                  </audio>
                )}

                <span className="text-sm text-[#5D4037] truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
