/* Picks who belongs in the homepage hero banner: devotees whose
 * disappearance day (death anniversary) or appearance day (birth
 * anniversary) is near today are surfaced first with a special badge;
 * everyone else still appears (deathDate is required on every profile),
 * just with generic "in loving memory" wording — so the banner always
 * has something to show, matching the always-visible Figma design,
 * instead of disappearing when no one's anniversary is this week. */

export type SpotlightType = "departed" | "birthAnniversary";

export type SpotlightEntry<T> = {
  profile: T;
  type: SpotlightType;
  /** 0 = today, positive = days ago, negative = days from now */
  distanceDays: number;
  /** true when distanceDays falls inside the "notable" window below */
  isNotable: boolean;
};

type DatedProfile = {
  _id: string;
  birthDate?: string;
  deathDate?: string;
};

/** A departed/birthday entry within this many days counts as "notable"
 *  and gets a special badge + priority placement at the front. */
const NOTABLE_WINDOW_DAYS = 7;

const DAY = 24 * 60 * 60 * 1000;
const atMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Given a recurring month/day, returns how many days ago (positive) or
 * from now (negative) the nearest occurrence of that month/day is,
 * checking last year's, this year's and next year's date and picking
 * whichever is closest to today.
 */
function nearestOccurrenceDistance(month: number, day: number, today: Date): number {
  const y = today.getFullYear();
  const candidates = [
    new Date(y - 1, month, day),
    new Date(y, month, day),
    new Date(y + 1, month, day),
  ];
  let best = Infinity;
  for (const c of candidates) {
    const diffDays = Math.round((today.getTime() - atMidnight(c).getTime()) / DAY);
    if (Math.abs(diffDays) < Math.abs(best)) best = diffDays;
  }
  return best;
}

/**
 * Builds the spotlight list — always one entry per profile that has a
 * deathDate (i.e. every profile, per the schema), plus an extra entry for
 * profiles whose birth anniversary is within the notable window. Sorted so
 * notable entries (closest to today first) lead, with everyone else after.
 */
export function getSpotlight<T extends DatedProfile>(
  profiles: T[],
  today: Date = new Date(),
): SpotlightEntry<T>[] {
  const entries: SpotlightEntry<T>[] = [];

  for (const p of profiles) {
    if (p.deathDate) {
      const d = new Date(p.deathDate);
      if (!isNaN(d.getTime())) {
        const dist = nearestOccurrenceDistance(d.getMonth(), d.getDate(), today);
        // only the *past* occurrence counts as "departed" (not an upcoming one)
        const pastDist = dist >= 0 ? dist : dist + 365;
        entries.push({
          profile: p,
          type: "departed",
          distanceDays: pastDist,
          isNotable: pastDist <= NOTABLE_WINDOW_DAYS,
        });
      }
    }
    if (p.birthDate) {
      const b = new Date(p.birthDate);
      if (!isNaN(b.getTime())) {
        const dist = nearestOccurrenceDistance(b.getMonth(), b.getDate(), today);
        if (Math.abs(dist) <= NOTABLE_WINDOW_DAYS) {
          entries.push({
            profile: p,
            type: "birthAnniversary",
            distanceDays: dist,
            isNotable: true,
          });
        }
      }
    }
  }

  entries.sort((a, b) => {
    if (a.isNotable !== b.isNotable) return a.isNotable ? -1 : 1;
    return Math.abs(a.distanceDays) - Math.abs(b.distanceDays);
  });
  return entries;
}

export function spotlightBadge(entry: Pick<SpotlightEntry<unknown>, "type" | "distanceDays" | "isNotable">): string {
  const { type, distanceDays, isNotable } = entry;
  if (type === "departed") {
    if (!isNotable) return "In loving memory";
    return distanceDays === 0 ? "Disappearance day" : "Recently departed";
  }
  if (distanceDays === 0) return "Appearance day";
  return distanceDays < 0 ? "Upcoming appearance day" : "Birth anniversary";
}

export function spotlightMessage(entry: Pick<SpotlightEntry<unknown>, "type" | "isNotable">, name: string): string {
  if (entry.type === "departed") {
    return entry.isNotable
      ? `${name} has returned to Krishna's abode`
      : `${name} is remembered for a life of devoted service`;
  }
  return `Celebrating the appearance day of ${name}`;
}

/** Same wording as spotlightMessage, but without the leading name — for
 *  callers that render the name separately (e.g. bolded) and just need
 *  the trailing clause. */
export function spotlightMessageSuffix(entry: Pick<SpotlightEntry<unknown>, "type" | "isNotable">): string {
  if (entry.type === "departed") {
    return entry.isNotable
      ? "has returned to Krishna's abode"
      : "is remembered for a life of devoted service";
  }
  return "— celebrating their appearance day today";
}