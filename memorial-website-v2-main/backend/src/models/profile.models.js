import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    // New full dates
    birthDate: {
      type: Date,
      required: true,
    },
    deathDate: {
      type: Date,
      required: true,
    },

    // Derived parts for convenience (auto-filled by pre-validate)
    birthYear: { type: Number },
    birthMonth: { type: Number }, // 1-12
    birthDay: { type: Number },
    deathYear: { type: Number },
    deathMonth: { type: Number }, // 1-12
    deathDay: { type: Number },

    // Keep years for display/back-compat (auto-derived if not provided)
    years: {
      type: String,
      required: false,
    },

    spiritualMaster: { type: String, required: true},

    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String, // URL
      required: true,
    },
    contributorName: {
      type: String,
      required: true,
    },
    contributorPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    keyAchievements: [
      {
        type: String,
      },
    ],
    timeline: [
      {
        year: String,
        event: String,
      },
    ],
    // Additional fields from frontend
    birthPlace: {
      type: String,
    },
    spiritualLineage: {
      type: String,
    },
    notableWorks: {
      type: String,
    },
    philosophicalContributions: {
      type: String,
    },
    disciples: {
      type: String,
    },
    memorialLocation: {
      type: String,
    },
    audioFiles: [
      {
        type: String, // URLs to audio files
      },
    ],
  },
  { timestamps: true }
);

// Keep split parts and years in sync automatically
profileSchema.pre("validate", function (next) {
  if (this.birthDate instanceof Date && !isNaN(this.birthDate)) {
    this.birthYear = this.birthDate.getUTCFullYear();
    this.birthMonth = this.birthDate.getUTCMonth() + 1; // 1-12
    this.birthDay = this.birthDate.getUTCDate();
  } else {
    this.birthYear = undefined;
    this.birthMonth = undefined;
    this.birthDay = undefined;
  }

  if (this.deathDate instanceof Date && !isNaN(this.deathDate)) {
    this.deathYear = this.deathDate.getUTCFullYear();
    this.deathMonth = this.deathDate.getUTCMonth() + 1;
    this.deathDay = this.deathDate.getUTCDate();
  } else {
    this.deathYear = undefined;
    this.deathMonth = undefined;
    this.deathDay = undefined;
  }

  if (this.birthYear && this.deathYear) {
    this.years = `${this.birthYear} - ${this.deathYear}`;
  }
  next();
});

// Server-side validation: death must be after birth
profileSchema.path("deathDate").validate(function (value) {
  if (!this.birthDate || !value) return true;
  return value > this.birthDate;
}, "Death date must be after birth date.");

profileSchema.plugin(mongooseAggregatePaginate);

export const Profile = mongoose.model("Profile", profileSchema);