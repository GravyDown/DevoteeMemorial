import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Calendar, Landmark, User, Sun, MapPin, Heart, UserPlus, UserCheck, Share2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { C, getRoleLine, getYears, type Profile } from "./utils";

/* ── Full-width hero with name block ── */
export function HeroBanner({ profile }: { profile: Profile }) {
  const role = getRoleLine(profile);
  return (
    <div className="relative h-[240px] sm:h-[300px] lg:h-[340px] overflow-hidden">
      {profile.bannerImage ? (
        <img src={profile.bannerImage} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#6B3A2A] via-[#804B23] to-[#A0522D]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C1A0E]/0 to-[#2C1A0E]/70" />

      <div className="absolute bottom-6 left-0 right-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 flex items-end gap-4 sm:gap-5">
          <Avatar className="w-20 h-20 sm:w-[100px] sm:h-[100px] border-[3px] border-white/90 shadow-xl shrink-0 bg-[#B8906A]">
            <AvatarImage src={profile.coverImage} alt={profile.name} className="object-cover object-top" />
            <AvatarFallback className="text-3xl text-white bg-gradient-to-br from-[#D4A56A] to-[#8B5E3C] font-['Cormorant_Garamond']">
              {profile.name?.charAt(0) ?? "D"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 pb-1 text-white">
            {profile.honorific && (
              <div className="text-xs tracking-[0.1em] uppercase text-white/70 mb-0.5">{profile.honorific}</div>
            )}
            <h1 className="font-script text-[34px] sm:text-[42px] leading-none drop-shadow-md break-words">
              {profile.name}
            </h1>
            {role && (
              <div className="font-['Cormorant_Garamond'] italic text-base sm:text-[17px] text-white/80 mt-1 truncate">
                {role}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Pill = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div className="flex items-center gap-1.5 rounded-full border px-3 py-[5px] text-[13px]"
       style={{ background: C.cream2, borderColor: C.cream3, color: C.muted }}>
    <span className="[&>svg]:w-[13px] [&>svg]:h-[13px]" style={{ color: C.brand }}>{icon}</span>
    <span>{children}</span>
  </div>
);
const B = ({ children }: { children: ReactNode }) => (
  <strong className="font-medium" style={{ color: C.text }}>{children}</strong>
);

/* ── Follow button: reads/writes GET|POST /profiles/:id/follow ── */
function FollowButton({ profileId }: { profileId: string }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get(`/profiles/${profileId}/follow`)
      .then((res) => {
        if (alive) setFollowing(Boolean(res.data?.data?.following));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [profileId]);

  const handleClick = async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: `/disciples/${profileId}` } });
      return;
    }
    const prev = following;
    setFollowing(!prev); // optimistic
    setBusy(true);
    try {
      const res = await api.post(`/profiles/${profileId}/follow`);
      setFollowing(Boolean(res.data?.data?.following));
    } catch {
      setFollowing(prev); // revert
      toast.error("Couldn't update follow status. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`flex items-center gap-2 rounded-full px-[18px] h-10 text-[13px] border-[1.5px] transition-colors disabled:opacity-60 ${
        following ? "text-white" : "bg-white hover:bg-[#FDF0E0]"
      }`}
      style={
        following
          ? { background: C.brand, borderColor: C.brand }
          : { borderColor: C.brand, color: C.brand }
      }
    >
      {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}

/* ── Meta pills + actions ── */
export function ProfileHeader({ profile, onShare }: { profile: Profile; onShare: () => void }) {
  const years = getYears(profile);
  const services = profile.coreServices ?? [];
  return (
    <div className="bg-white border-b" style={{ borderColor: "rgba(128,75,35,0.1)" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex flex-wrap gap-2">
          {years && <Pill icon={<Calendar />}><B>{years}</B></Pill>}
          {profile.associatedTemple && <Pill icon={<Landmark />}><B>{profile.associatedTemple}</B></Pill>}
          {profile.spiritualMaster && (
            <Pill icon={<User />}>Initiated by <B>{profile.spiritualMaster}</B></Pill>
          )}
          {services.length > 0 && <Pill icon={<Sun />}><B>{services.join(", ")}</B></Pill>}
          {profile.location && <Pill icon={<MapPin />}><B>{profile.location}</B></Pill>}
        </div>

        <div className="flex gap-2.5 flex-wrap shrink-0">
          <Link
            to="/offerings/new"
            state={{ devoteeId: profile._id }}
            className="flex items-center gap-2 rounded-full px-5 h-10 text-[13px] font-medium text-white transition-colors hover:bg-[#5C3418]"
            style={{ background: C.brand }}
          >
            <Heart className="w-4 h-4" /> Give Offering
          </Link>
          <FollowButton profileId={profile._id} />
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 rounded-full px-4 h-10 text-[13px] hover:text-[#804B23] transition-colors"
            style={{ background: C.cream2, color: C.muted }}
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── About strip ── */
export function AboutStrip({ description }: { description?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!description) return null;
  const LIMIT = 350;
  const long = description.length > LIMIT;
  return (
    <div className="bg-white border-b" style={{ borderColor: "rgba(128,75,35,0.08)" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 pt-5 pb-6">
        <h2 className="!text-[13px] tracking-[0.1em] uppercase font-normal mb-2.5" style={{ color: C.muted }}>
          About the disciple
        </h2>
        <p className="text-base sm:text-[17px] leading-[1.8] max-w-[780px]" style={{ color: C.text }}>
          {expanded || !long ? description : description.slice(0, LIMIT) + "…"}
          {long && (
            <button onClick={() => setExpanded(!expanded)} className="ml-1.5 font-medium hover:underline" style={{ color: C.brand }}>
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}