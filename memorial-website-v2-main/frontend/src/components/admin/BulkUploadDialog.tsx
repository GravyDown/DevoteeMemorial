import { useRef, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

/** Matches the shape ApiResponse(200, {...}) sends back from
 *  bulkUploadProfiles in bulkUpload.controller.js. */
interface BulkUploadResult {
  totalRows: number;
  inserted: { id: string; name: string }[];
  insertedCount: number;
  skippedDuplicates: { row: number; name: string }[];
  rowErrors: { row: number; name: string; errors: string[] }[];
  uploadFailures: { row: number; name: string; reason: string }[];
  insertErrors: { name: string; reason: string }[];
}

export default function BulkUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once at least one devotee was actually inserted, so the
   *  Profiles table can refresh. */
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const reset = () => {
    setFileName("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = (o: boolean) => {
    if (!uploading) {
      onOpenChange(o);
      if (!o) reset();
    }
  };

  const downloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await api.get("/admin/profiles/bulk-upload/template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "devotees-upload-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("publishImmediately", String(publishImmediately));
      const res = await api.post("/admin/profiles/bulk-upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data: BulkUploadResult = res.data.data;
      setResult(data);
      if (data.insertedCount > 0) {
        onUploaded();
        toast.success(`${data.insertedCount} of ${data.totalRows} devotee(s) added.`);
      } else {
        toast.warning("No rows were added — see the details below.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const hasIssues =
    result &&
    (result.skippedDuplicates.length > 0 ||
      result.rowErrors.length > 0 ||
      result.uploadFailures.length > 0 ||
      result.insertErrors.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#5D4037]">Bulk upload devotees</DialogTitle>
          <DialogDescription>
            Add multiple memorial profiles at once from a spreadsheet. Each row needs a name, death date,
            spiritual master, location, description, cover image URL, and contributor details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: template */}
          <div className="flex items-center justify-between bg-[#FFF8F0] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5 text-sm text-[#5D4037]">
              <FileSpreadsheet className="w-4 h-4 text-[#804B23]" />
              Not sure of the format?
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadTemplate}
              disabled={downloadingTemplate}
              className="h-8 text-xs border-[#8D6E63]/30 text-[#5D4037]"
            >
              {downloadingTemplate ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1" />
              )}
              Download template
            </Button>
          </div>

          {/* Step 2: file picker */}
          <div>
            <label className="text-xs font-medium text-[#5D4037] mb-1.5 block">Spreadsheet (.xlsx, .xls, .csv)</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-[#8D6E63]/25 hover:border-[#804B23]/40 rounded-xl py-5 text-center transition-colors"
            >
              <Upload className="w-5 h-5 text-[#8D6E63] mx-auto mb-1.5" />
              <p className="text-xs text-[#5D4037]">{fileName || "Click to choose a file"}</p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
          </div>

          {/* Step 3: publish toggle */}
          <div className="flex items-center justify-between bg-[#FFF8F0] rounded-xl px-4 py-3">
            <div>
              <p className="text-sm text-[#5D4037]">Publish immediately</p>
              <p className="text-[11px] text-[#8D6E63]">
                {publishImmediately
                  ? "Profiles go live right away, same as Approve."
                  : "Profiles land in the Pending tab for review first."}
              </p>
            </div>
            <Switch checked={publishImmediately} onCheckedChange={setPublishImmediately} />
          </div>

          {/* Results */}
          {result && (
            <div className="border border-[#8D6E63]/15 rounded-xl p-3.5 max-h-56 overflow-y-auto space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {result.insertedCount} of {result.totalRows} row(s) added
                {result.skippedDuplicates.length > 0 && ` · ${result.skippedDuplicates.length} already existed`}
              </div>

              {result.rowErrors.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-red-600 font-medium mb-1">
                    <XCircle className="w-3.5 h-3.5" /> {result.rowErrors.length} row(s) with missing/invalid data
                  </p>
                  <ul className="text-[#8D6E63] space-y-0.5 pl-5 list-disc">
                    {result.rowErrors.map((e, i) => (
                      <li key={i}>
                        Row {e.row} ({e.name}): {e.errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.uploadFailures.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-amber-700 font-medium mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {result.uploadFailures.length} image upload failure(s)
                  </p>
                  <ul className="text-[#8D6E63] space-y-0.5 pl-5 list-disc">
                    {result.uploadFailures.map((e, i) => (
                      <li key={i}>
                        Row {e.row} ({e.name}): {e.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.insertErrors.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-red-600 font-medium mb-1">
                    <XCircle className="w-3.5 h-3.5" /> {result.insertErrors.length} failed to save
                  </p>
                  <ul className="text-[#8D6E63] space-y-0.5 pl-5 list-disc">
                    {result.insertErrors.map((e, i) => (
                      <li key={i}>
                        {e.name}: {e.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.skippedDuplicates.length > 0 && (
                <div>
                  <p className="text-[#8D6E63] font-medium mb-1">Already in the database, skipped:</p>
                  <ul className="text-[#8D6E63] space-y-0.5 pl-5 list-disc">
                    {result.skippedDuplicates.map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasIssues && <p className="text-[#8D6E63]">No issues — everything in the sheet was added cleanly.</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={uploading} className="border-[#8D6E63]/30">
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button onClick={handleUpload} disabled={uploading} className="bg-[#804B23] hover:bg-[#6d3f1d] text-white">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1.5" /> Upload
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}