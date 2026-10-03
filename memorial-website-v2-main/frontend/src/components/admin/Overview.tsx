import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import api from "@/lib/api";
import { UserCheck, Heart, Users as UsersIcon, LayoutDashboard, ArrowRight } from "lucide-react";
import { StatCard, type Stats, usePendingCounts } from "./shared";

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  // /admin/stats already includes pendingProfiles — feed it into the
  // sidebar's badge context so that badge is accurate as soon as you land
  // on the dashboard, not only after visiting the Profiles tab once.
  const { setProfiles } = usePendingCounts();

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.stats);
      setProfiles(res.data.stats?.pendingProfiles ?? 0);
    } catch {
      // Non-fatal — stat cards just stay blank if this fails.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total profiles"
          value={stats?.totalProfiles ?? 0}
          delta={stats ? `+${stats.profilesThisMonth} this month` : undefined}
          icon={<LayoutDashboard className="w-4 h-4" />}
        />
        <StatCard
          label="Pending review"
          value={stats?.pendingProfiles ?? 0}
          delta="Needs attention"
          icon={<UserCheck className="w-4 h-4" />}
          tone={stats && stats.pendingProfiles > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Total offerings"
          value={stats?.totalOfferings ?? 0}
          delta={stats ? `+${stats.offeringsThisMonth} this month` : undefined}
          icon={<Heart className="w-4 h-4" />}
        />
        <StatCard
          label="Registered users"
          value={stats?.totalUsers ?? 0}
          delta={stats ? `+${stats.usersThisWeek} this week` : undefined}
          icon={<UsersIcon className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/profiles"
          className="group bg-white rounded-2xl p-5 border border-[#8D6E63]/10 hover:border-[#804B23]/30 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-[#5D4037]">Review pending profiles</p>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              {stats?.pendingProfiles ?? 0} memorial submission{stats?.pendingProfiles === 1 ? "" : "s"} waiting on you
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8D6E63] group-hover:text-[#804B23] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
        <Link
          to="/admin/offerings"
          className="group bg-white rounded-2xl p-5 border border-[#8D6E63]/10 hover:border-[#804B23]/30 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-[#5D4037]">Review pending offerings</p>
            <p className="text-xs text-[#8D6E63] mt-0.5">Tributes submitted by devotees, awaiting moderation</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8D6E63] group-hover:text-[#804B23] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </div>
  );
}