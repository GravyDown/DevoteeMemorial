import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterBar from "@/components/FilterBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, Heart, ArrowRight } from "lucide-react";

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
  // include any other fields you store
};

export default function DiscipleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = (location.state as any) || null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // If state provides sufficient data, show it immediately and still revalidate
    if (!id) return;

    // If router state contains profile preview, seed UI quickly
    if (stateData?.name || stateData?.image) {
      setProfile({
        _id: id,
        name: stateData.name,
        coverImage: stateData.image,
        years: stateData.years,
      } as Profile);
    }

    setLoading(true);
    setError(null);

    fetch(`/api/profiles/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || data?.message || "Failed to fetch profile");
        const p = data.profile ?? data; // handle both shapes
        setProfile(p);
      })
      .catch((err: any) => {
        setError(err?.message ?? String(err));
      })
      .finally(() => setLoading(false));
  }, [id, stateData]);

  const years = profile?.years ?? `${profile?.birthYear ?? "?"} - ${profile?.deathYear ?? "?"}`;
  const image = profile?.coverImage ?? "";
  const services = profile?.coreServices ?? [];

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto">
        {loading ? (
          <div className="p-8 text-center">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">Error: {error}</div>
        ) : profile ? (
          <>
            {/* Header */}
            <div className="relative mb-16">
              <div className="w-full h-[240px] bg-[#804B23] rounded-b-[32px]" />
              <div className="absolute -bottom-12 left-6 md:left-16">
                <div className="rounded-full border-[6px] border-[#FFF1DF] p-0.5 bg-white shadow-lg">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40">
                    <AvatarImage src={image} className="object-cover" />
                    <AvatarFallback>DP</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Info + Actions */}
            <div className="px-6 md:px-16 flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
              <div className="mt-4">
                <h1 className="text-[#5D4037] font-bold text-3xl md:text-4xl mb-2">{profile.name}</h1>
                <p className="text-[#8D6E63] text-sm mb-1">{years}</p>
                <p className="text-[#8D6E63] text-sm">{profile.location}</p>

                <div className="mt-3 text-sm text-[#5D4037]">
                  <div><strong>Honorific:</strong> {profile.honorific || "—"}</div>
                  <div><strong>Spiritual Master:</strong> {profile.spiritualMaster || "—"}</div>
                  <div><strong>Temple:</strong> {profile.associatedTemple || profile.memorialLocation || "—"}</div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                <Link to="/offerings/new">
                  <Button className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-6 h-10 text-sm font-medium shadow-none">
                    Give Offering <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="border-[#804B23] text-[#804B23] hover:bg-[#804B23]/10 rounded-full px-6 h-10 text-sm font-medium bg-transparent shadow-none"
                  onClick={() => {
                    // placeholder follow action
                    alert("Followed!");
                  }}
                >
                  Follow <Heart className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="border-[#804B23] text-[#804B23] hover:bg-[#804B23]/10 rounded-full px-6 h-10 text-sm font-medium bg-transparent shadow-none"
                  onClick={() => {
                    if ((navigator as any).share) {
                      (navigator as any).share({
                        title: profile.name,
                        text: `${profile.name} — ${years}`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href);
                      alert("Link copied to clipboard");
                    }
                  }}
                >
                  Share <Share2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* About */}
            <div className="px-6 md:px-16 mb-12">
              <div className="bg-[#FFF8E7] rounded-2xl p-8 border border-[#8D6E63]/10">
                <h2 className="text-[#5D4037] font-bold text-xl mb-4">About disciple</h2>
                <p className="text-[#5D4037]/80 text-base leading-relaxed">
                  {profile.description ? (
                    <>
                      {expanded ? profile.description : profile.description.slice(0, 350)}
                      {profile.description.length > 350 && (
                        <button
                          onClick={() => setExpanded((s) => !s)}
                          className="text-[#295F98] cursor-pointer hover:underline ml-1"
                        >
                          {expanded ? "show less" : "read more"}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-[#999]">No description provided.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Filters (existing component) */}
            <FilterBar />

            {/* Core services */}
            {services.length > 0 && (
              <section className="px-6 md:px-16 mb-12">
                <h3 className="text-[#5D4037] font-semibold mb-3">Core services</h3>
                <ul className="list-disc ml-6 text-[#5D4037]/90">
                  {services.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Empty spacer to match original template */}
            <div className="min-h-[200px]" />
          </>
        ) : (
          <div className="p-8 text-center">Profile not found</div>
        )}
      </main>

      <Footer />
    </div>
  );
}