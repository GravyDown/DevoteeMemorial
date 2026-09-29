import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

import "@/components/disciple/disciple-fonts.css";
import { HeroBanner, ProfileHeader, AboutStrip } from "@/components/disciple/ProfileHero";
import OfferingsFeed from "@/components/disciple/OfferingsFeed";
import Sidebar from "@/components/disciple/Sidebar";
import MediaLightbox, { type LightboxState } from "@/components/disciple/MediaLightbox";
import type { MediaItem, Offering, Profile } from "@/components/disciple/utils";

export default function DiscipleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = (location.state as any) || null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  const [lightbox, setLightbox] = useState<LightboxState>(null);

  /* ── Fetch (unchanged from the previous page) ── */
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
    api
      .get(`/profiles/${id}`)
      .then((res) => {
        const data = res.data;
        setProfile(data.profile ?? data);
      })
      .catch((err) => setError(getErrorMessage(err, "Failed to fetch profile")))
      .finally(() => setLoading(false));

    setOfferingsLoading(true);
    api
      .get(`/offerings/profile/${id}`)
      .then((res) => {
        const data = res.data;
        if (data && data.success) setOfferings(data.offerings ?? []);
      })
      .catch((err) => console.error("Offerings error:", err))
      .finally(() => setOfferingsLoading(false));
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const openMedia = (items: MediaItem[], index: number) => setLightbox({ items, index });

  return (
    <div className="disciple-page min-h-screen bg-[#FFF8F0] flex flex-col">
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
            <HeroBanner profile={profile} />
            <ProfileHeader profile={profile} onShare={handleShare} />
            <AboutStrip description={profile.description} />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-7 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
              <OfferingsFeed
                offerings={offerings}
                loading={offeringsLoading}
                profileId={profile._id}
                onOpenMedia={openMedia}
                onShare={handleShare}
              />
              <Sidebar profile={profile} offerings={offerings} onOpenMedia={openMedia} />
            </div>
          </>
        ) : (
          <div className="p-10 text-center text-[#8D6E63]">Profile not found</div>
        )}
      </main>

      <MediaLightbox state={lightbox} onClose={() => setLightbox(null)} />
      <Footer />
    </div>
  );
}
