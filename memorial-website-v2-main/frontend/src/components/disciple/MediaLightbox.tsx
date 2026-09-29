import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getEmbedUrl, type MediaItem } from "./utils";

export type LightboxState = { items: MediaItem[]; index: number } | null;

export default function MediaLightbox({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  useEffect(() => setI(state?.index ?? 0), [state]);

  if (!state) return null;
  const items = state.items;
  const item = items[i];
  if (!item) return null;
  const many = items.length > 1;
  const go = (d: number) => setI((p) => (p + d + items.length) % items.length);
  const embed = item.type === "video" ? getEmbedUrl(item.src) : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[min(92vw,1000px)] sm:max-w-[min(92vw,1000px)] bg-black/95 border-0 p-2 sm:p-4">
        <DialogTitle className="sr-only">Media viewer</DialogTitle>
        <div className="relative flex items-center justify-center min-h-[40vh]">
          {item.type === "image" && (
            <img src={item.src} alt="" className="max-h-[80vh] max-w-full object-contain rounded-lg" />
          )}
          {item.type === "video" &&
            (embed ? (
              <iframe
                src={embed}
                title="Video"
                className="w-full aspect-video rounded-lg"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a href={item.src} target="_blank" rel="noreferrer" className="text-white underline">
                Open video in a new tab
              </a>
            ))}
          {item.type === "audio" && <audio controls autoPlay src={item.src} className="w-full max-w-md" />}

          {many && (
            <>
              <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button aria-label="Next" onClick={() => go(1)} className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        {many && <p className="text-center text-xs text-white/60">{i + 1} / {items.length}</p>}
      </DialogContent>
    </Dialog>
  );
}
