import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterBar from "@/components/FilterBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, Heart, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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

export default function DiscipleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = (location.state as any) || null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fast UI from router state
    if (stateData?.name || stateData?.image) {
      setProfile({
        _id: id,
        name: stateData.name,
        coverImage: stateData.image,
        years: stateData.years,
      });
    }

    setLoading(true);
    setError(null);

    // Fetch profile
    fetch(`${API_URL}/profiles/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to fetch profile");
        setProfile(data.profile ?? data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Fetch offerings
    setOfferingsLoading(true);
    fetch(`${API_URL}/offerings/profile/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setOfferings(data.offerings ?? []);
        }
      })
      .catch((err) => {
        console.error("Offerings fetch error:", err);
      })
      .finally(() => setOfferingsLoading(false));
  }, [id, stateData]);

  const years =
    profile?.years ??
    `${profile?.birthYear ?? "?"} - ${profile?.deathYear ?? "?"}`;

  const services = profile?.coreServices ?? [];

  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto">
        {loading ? (
          <div className="p-8 text-center">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
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
            <div className="px-6 md:px-16 mb-12">
              <div className="bg-[#FFF8E7] p-8 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">About disciple</h2>
                <p className="text-[#5D4037]/80">
                  {expanded
                    ? profile.description
                    : profile.description?.slice(0, 350)}
                  {profile.description &&
                    profile.description.length > 350 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="ml-2 text-[#295F98]"
                      >
                        {expanded ? "show less" : "read more"}
                      </button>
                    )}
                </p>
              </div>
            </div>

            {/* Offerings */}
            <section className="px-6 md:px-16 mb-16">
              <h2 className="text-xl font-bold mb-6">Offerings</h2>

              {offeringsLoading ? (
                <p>Loading offerings…</p>
              ) : offerings.length === 0 ? (
                <p className="text-[#999]">No offerings have been shared yet.</p>
              ) : (
                <div className="space-y-6">
                  {offerings.map((off) => (
                    <div key={off._id} className="bg-white p-6 rounded-2xl shadow">
                      <p className="mb-2">{off.message}</p>

                      {(off.images?.length ?? 0) > 0 && (
                        <div className="flex gap-3 flex-wrap mb-3">
                          {off.images?.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              className="w-28 h-28 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      )}

                      {(off.audios?.length ?? 0) > 0 && (
                        <div className="space-y-2 mb-3">
                          {off.audios?.map((aud, i) => (
                            <audio key={i} controls className="w-full">
                              <source src={aud} />
                            </audio>
                          ))}
                        </div>
                      )}

                      {off.videoLink && (
                        <a
                          href={off.videoLink}
                          target="_blank"
                          className="text-[#295F98] text-sm"
                        >
                          View video offering
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <FilterBar />

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
          <div className="p-8 text-center">Profile not found</div>
        )}
      </main>

      <Footer />
    </div>
  );
}
