import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Share2, Heart, MapPin, Calendar } from "lucide-react";
import OfferingCard from "@/components/OfferingCard";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

/* ── Types ── */
type Profile = {
  _id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  location?: string;
  coverImage?: string;
  description?: string;
  honorific?: string;
  spiritualMaster?: string;
  associatedTemple?: string;
  ashramRole?: string;
  coreServices?: string[];
  accountType?: string;
  bannerImage?: string;
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

/* ── Helpers ── */
const getYears = (profile: Profile | null): string => {
  if (!profile) return "";
  const birth = profile.birthDate
    ? new Date(profile.birthDate).getFullYear()
    : "?";
  const death = profile.deathDate
    ? new Date(profile.deathDate).getFullYear()
    : "?";
  return `${birth} – ${death}`;
};

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch?.[1])
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoRegex =
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
};

/* ── Component ── */
export default function DiscipleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = (location.state as any) || null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [offeringFilter, setOfferingFilter] = useState("All");

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  /* ── Fetch ── */
  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Invalid profile ID.");
      setLoading(false);
      return;
    }

    if (stateData?.name) {
      setProfile({
        _id: id,
        name: stateData.name,
        coverImage: stateData.image,
        birthDate: stateData.birthDate,
        deathDate: stateData.deathDate,
      });
    }

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/profiles/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to fetch profile");
        setProfile(data.profile ?? data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    setOfferingsLoading(true);
    fetch(`${API_URL}/offerings/profile/${id}`)
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (res.ok && data.success) setOfferings(data.offerings ?? []);
        } catch {
          console.error("Offerings not JSON:", text.slice(0, 100));
        }
      })
      .catch((err) => console.error("Offerings error:", err))
      .finally(() => setOfferingsLoading(false));
  }, [id]);

  /* ── Share handler ── */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const years = getYears(profile);
  const services = profile?.coreServices ?? [];

  /* ── Filter offerings ── */
  const filteredOfferings = offerings.filter((off) => {
    if (offeringFilter === "All") return true;
    if (offeringFilter === "Text")
      return !off.videoLink && !off.images?.length && !off.audios?.length;
    if (offeringFilter === "Video") return !!off.videoLink;
    if (offeringFilter === "Photo") return (off.images?.length ?? 0) > 0;
    if (offeringFilter === "Audio") return (off.audios?.length ?? 0) > 0;
    return true;
  });

  /* ── UI ── */
  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#804B23] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : profile ? (
          <>
            {/* ── Banner — rounded with border ── */}
            <div className="max-w-[1280px] mx-auto px-6 md:px-16 pt-8">
              {/* Banner container — NO overflow-hidden so avatar can spill out */}
              <div className="relative" style={{ height: "280px" }}>
                {/* The actual banner image — rounded with overflow hidden */}
                <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-[#8D6E63]/20 shadow-md">
                  {profile.bannerImage ? (
                    <img
                      src={profile.bannerImage}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#6B3A2A] via-[#804B23] to-[#A0522D]" />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/10 rounded-3xl" />
                </div>

                {/* Avatar — OUTSIDE overflow-hidden, positioned to overlap banner bottom */}
                <div className="absolute -bottom-16 left-8 md:left-12">
                  <div className="relative">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#FFF1DF] shadow-2xl bg-white ring-4 ring-white">
                      <AvatarImage
                        src={profile.coverImage}
                        alt={profile.name}
                        className="object-cover object-top"
                      />
                      <AvatarFallback className="text-4xl font-bold text-[#5D4037] bg-[#FFF8E7]">
                        {profile.name?.charAt(0) ?? "D"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Badge
                    <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#804B23] rounded-full flex items-center justify-center border-2 border-[#FFF1DF] shadow-md">
                      <span className="text-sm">🙏</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer for avatar overlap */}
            <div className="h-20" />

            {/* ── Info row ── */}
            <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-8 flex justify-between flex-wrap gap-6 items-start">
              <div>
                {/* Honorific + name */}
                <h1 className="text-3xl md:text-4xl font-bold text-[#5D4037]">
                  {profile.honorific ? `${profile.honorific} ` : ""}
                  {profile.name}
                </h1>

                {/* Years */}
                <div className="flex items-center gap-2 mt-1 text-[#8D6E63]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{years}</span>
                </div>

                {/* Location */}
                {profile.location && (
                  <div className="flex items-center gap-2 mt-1 text-[#8D6E63]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}

                {/* Core services tags */}
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {services.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded-full bg-[#FFF8E7] border border-[#8D6E63]/20 text-[#8D6E63] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ashram role + temple */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {profile.ashramRole && (
                    <span className="text-xs text-[#8D6E63]/70">
                      {profile.ashramRole}
                    </span>
                  )}
                  {profile.associatedTemple && (
                    <span className="text-xs text-[#8D6E63]/70">
                      · {profile.associatedTemple}
                    </span>
                  )}
                  {profile.spiritualMaster && (
                    <span className="text-xs text-[#8D6E63]/70">
                      · Guru: {profile.spiritualMaster}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <Link to="/offerings/new" state={{ devoteeId: profile._id }}>
                  <Button className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-6 h-10">
                    Give Offering <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="rounded-full px-5 h-10 border-[#8D6E63]/30 text-[#5D4037] hover:bg-[#FFF8E7]"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>

            {/* ── About ── */}
            <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-10">
              <div className="bg-[#FFF8E7] p-8 rounded-2xl border border-[#8D6E63]/10">
                <h2 className="text-lg font-bold text-[#5D4037] mb-3">
                  About disciple
                </h2>
                <p className="text-[#5D4037]/80 leading-relaxed text-sm">
                  {expanded
                    ? profile.description
                    : profile.description?.slice(0, 350)}
                  {profile.description && profile.description.length > 350 && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="ml-2 text-[#804B23] hover:underline font-medium"
                    >
                      {expanded ? "show less" : "read more"}
                    </button>
                  )}
                </p>
              </div>
            </div>

            {/* ── Offerings ── */}
            <section className="max-w-[1280px] mx-auto px-6 md:px-16 mb-20">
              {/* Offerings header + filter */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="text-[#5D4037] font-bold text-xl">
                  Offerings ({offerings.length})
                </h2>

                {/* Filter chips */}
                <div className="flex gap-2 flex-wrap">
                  {["All", "Text", "Photo", "Video", "Audio"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setOfferingFilter(f)}
                      className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                        offeringFilter === f
                          ? "bg-[#804B23] text-white border-[#804B23]"
                          : "bg-white text-[#8D6E63] border-[#8D6E63]/20 hover:border-[#8D6E63]/50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {offeringsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#804B23] border-t-transparent" />
                  <p className="mt-4 text-[#8D6E63]">Loading offerings…</p>
                </div>
              ) : filteredOfferings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#8D6E63]/10">
                  <div className="text-6xl mb-4">🕯️</div>
                  <p className="text-[#8D6E63] text-lg font-medium">
                    {offeringFilter === "All"
                      ? "No offerings have been shared yet."
                      : `No ${offeringFilter.toLowerCase()} offerings yet.`}
                  </p>
                  <p className="text-[#8D6E63]/60 text-sm mt-2">
                    Be the first to honor this devotee's memory.
                  </p>
                  <Link
                    to="/offerings/new"
                    state={{ devoteeId: profile._id }}
                    className="inline-block mt-4"
                  >
                    <Button className="bg-[#804B23] text-white rounded-full px-6 h-9 text-sm">
                      Give Offering <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                  {filteredOfferings.map((off) => (
                    <OfferingCard key={off._id} offering={off} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="p-10 text-center text-[#8D6E63]">
            Profile not found
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
