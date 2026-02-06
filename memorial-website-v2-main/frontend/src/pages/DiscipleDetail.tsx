import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import OfferingCard from "@/components/OfferingCard";

const API_URL = import.meta.env.VITE_API_URL;

/* ---------------- Types ---------------- */

type Profile = {
  _id: string;
  name: string;
  years?: string;
  birthYear?: number;
  deathYear?: number;
  location?: string;
  coverImage?: string;
  description?: string;
  honorific?: string;
  spiritualMaster?: string;
  associatedTemple?: string;
  memorialLocation?: string;
  coreServices?: string[];
};

type Offering = {
  _id: string;
  message: string;
  relation?: string;
  images?: string[];
  audios?: string[];
  videoLink?: string;
  createdAt: string;
};

/* ---------------- Helpers ---------------- */

// Convert YouTube/Vimeo links to embed URLs
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo pattern
  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }

  return null;
};

const getOfferingBadge = (off: Offering) => {
  if (off.videoLink) return "🎥 Video Offering";
  if (off.audios && off.audios.length > 0) return "🎵 Audio Offering";
  if (off.images && off.images.length > 0) return "🖼 Photo Offering";
  return "🕯 Tribute";
};

export default function DiscipleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = (location.state as any) || null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  /* ---------------- Fetch data ---------------- */

  useEffect(() => {
    if (!id) return;

    // Fast UI from router state
    if (stateData?.name) {
      setProfile({
        _id: id,
        name: stateData.name,
        coverImage: stateData.image,
        years: stateData.years,
      });
    }

    setLoading(true);
    setError(null);

    // Profile
    fetch(`${API_URL}/profiles/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to fetch profile");
        setProfile(data.profile ?? data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Offerings
    setOfferingsLoading(true);
    fetch(`${API_URL}/offerings/profile/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setOfferings(data.offerings ?? []);
        }
      })
      .catch((err) => console.error("Offerings fetch error:", err))
      .finally(() => setOfferingsLoading(false));
  }, [id, stateData]);

  const years =
    profile?.years ??
    `${profile?.birthYear ?? "?"} - ${profile?.deathYear ?? "?"}`;

  const services = profile?.coreServices ?? [];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto">
        {loading ? (
          <div className="p-10 text-center">Loading…</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : profile ? (
          <>
            {/* Header */}
            <div className="relative mb-16">
              <div className="w-full h-[240px] bg-[#804B23] rounded-b-[32px]" />
              <div className="absolute -bottom-12 left-6 md:left-16">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-[6px] border-[#FFF1DF] bg-white shadow-lg">
                  <AvatarImage src={profile.coverImage} />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 md:px-16 flex justify-between flex-wrap gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-[#5D4037]">
                  {profile.name}
                </h1>
                <p className="text-[#8D6E63]">{years}</p>
                <p className="text-[#8D6E63]">{profile.location}</p>
              </div>

              <Link to="/offerings/new" state={{ devoteeId: profile._id }}>
                <Button className="bg-[#804B23] text-white rounded-full px-6">
                  Give Offering <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* About */}
            <div className="px-6 md:px-16 mb-14">
              <div className="bg-[#FFF8E7] p-8 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">About disciple</h2>
                <p className="text-[#5D4037]/80 leading-relaxed">
                  {expanded
                    ? profile.description
                    : profile.description?.slice(0, 350)}
                  {profile.description && profile.description.length > 350 && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="ml-2 text-[#295F98] hover:underline"
                    >
                      {expanded ? "show less" : "read more"}
                    </button>
                  )}
                </p>
              </div>
            </div>

            {/* Offerings */}
            <section className="px-6 md:px-16 mb-20">
              <h2 className="text-[#5D4037] font-bold text-xl mb-6">
                Offerings ({offerings.length})
              </h2>

              {offeringsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#804B23] border-t-transparent"></div>
                  <p className="mt-4 text-[#8D6E63]">Loading offerings…</p>
                </div>
              ) : offerings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl">
                  <div className="text-6xl mb-4">🕯️</div>
                  <p className="text-[#8D6E63] text-lg">
                    No offerings have been shared yet.
                  </p>
                  <p className="text-[#8D6E63]/60 text-sm mt-2">
                    Be the first to honor this devotee's memory.
                  </p>
                </div>
              ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                  {offerings.map((off) => (
                    <OfferingCard key={off._id} offering={off} />
                  ))}
                </div>
              )}
            </section>

            {/* Core Services */}
            {services.length > 0 && (
              <section className="px-6 md:px-16 mb-12">
                <h3 className="font-semibold mb-3">Core services</h3>
                <ul className="list-disc ml-6">
                  {services.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <div className="p-10 text-center">Profile not found</div>
        )}
      </main>

      <Footer />
    </div>
  );
}