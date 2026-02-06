import { useState } from "react";
import { Play } from "lucide-react";

type Offering = {
  _id: string;
  message: string;
  relation?: string;
  images?: string[];
  audios?: string[];
  videoLink?: string;
  createdAt: string;
};

interface OfferingCardProps {
  offering: Offering;
}

// Helper to get embed URL
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }

  return null;
};

// Get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
};

export default function OfferingCard({ offering }: OfferingCardProps) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const embedUrl = offering.videoLink ? getEmbedUrl(offering.videoLink) : null;
  const thumbnailUrl = offering.videoLink ? getYouTubeThumbnail(offering.videoLink) : null;
  
  const shouldTruncate = offering.message.length > 200;
  const displayMessage = showFullMessage || !shouldTruncate 
    ? offering.message 
    : offering.message.slice(0, 200) + "...";

  const hasMedia = offering.videoLink || (offering.images && offering.images.length > 0);

  return (
    <div className="break-inside-avoid mb-6">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
        
        {/* Video Section */}
        {offering.videoLink && embedUrl && (
          <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
            {!isVideoPlaying && thumbnailUrl ? (
              // Thumbnail with play button
              <div 
                className="absolute inset-0 cursor-pointer group"
                onClick={() => setIsVideoPlaying(true)}
              >
                <img
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-[#804B23] ml-1" fill="#804B23" />
                  </div>
                </div>
              </div>
            ) : (
              // Embedded video player
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video offering"
              />
            )}
          </div>
        )}

        {/* Image Gallery */}
        {!offering.videoLink && offering.images && offering.images.length > 0 && (
          <div className="relative">
            <img
              src={offering.images[0]}
              alt="Offering"
              className="w-full h-56 object-cover"
            />
            {offering.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                +{offering.images.length - 1} more
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Message */}
          <div className={hasMedia ? "mb-4" : "mb-3"}>
            <p className="text-[#5D4037] leading-relaxed text-[15px]">
              {displayMessage}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setShowFullMessage(!showFullMessage)}
                className="mt-2 text-sm text-[#804B23] hover:text-[#5D4037] font-medium transition-colors"
              >
                {showFullMessage ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Audio Player */}
          {offering.audios && offering.audios.length > 0 && (
            <div className="mb-4 bg-gradient-to-r from-[#FFF8F0] to-[#FFF4E6] p-4 rounded-xl border border-[#FFE4CC]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#804B23] flex items-center justify-center">
                  <span className="text-white text-sm">🎵</span>
                </div>
                <span className="text-sm font-medium text-[#5D4037]">Audio Offering</span>
              </div>
              <audio controls className="w-full h-10">
                <source src={offering.audios[0]} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A0826D] to-[#5D4037] flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-semibold">
                  {(offering.relation || "D")[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-[#5D4037]">
                {offering.relation || "Devotee"}
              </span>
            </div>
            <span className="text-xs text-[#8D6E63]">
              {new Date(offering.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}