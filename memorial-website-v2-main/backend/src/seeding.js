import mongoose from "mongoose";
import { Profile } from "./models/profile.models.js";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env"
});

const seedProfiles = [
  {
    name: "Srila Prabhupada",
    birthDate: new Date("1896-09-01"),
    deathDate: new Date("1977-11-14"),
    years: "1896 - 1977",
    location: "Vrindavan, India",
    description: "Founder-Acharya of the International Society for Krishna Consciousness (ISKCON). His Divine Grace A.C. Bhaktivedanta Swami Prabhupada appeared in this world in 1896 in Calcutta, India. He first met his spiritual master, Srila Bhaktisiddhanta Sarasvati Gosvami, in Calcutta in 1922.",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bhaktivedanta_Swami_Prabhupada_in_1975_at_Varsana_dhama.jpg/220px-Bhaktivedanta_Swami_Prabhupada_in_1975_at_Varsana_dhama.jpg",
    contributorName: "Admin",
    contributorPhone: "1234567890",
    status: "accepted",
    honorific: "His Divine Grace",
    spiritualMaster: "Bhaktisiddhanta Sarasvati Thakura",
    associatedTemple: "ISKCON Vrindavan",
    memorialLocation: "Vrindavan, India"
  },
  {
    name: "Bhaktisiddhanta Sarasvati",
    birthDate: new Date("1874-02-06"),
    deathDate: new Date("1937-01-01"),
    years: "1874 - 1937",
    location: "Mayapur, India",
    description: "Spiritual master of Srila Prabhupada and a great Vaishnava acharya. He established the Gaudiya Math and preached Krishna consciousness throughout India.",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Bhaktisiddhanta_Sarasvati.jpg/220px-Bhaktisiddhanta_Sarasvati.jpg",
    contributorName: "Admin",
    contributorPhone: "1234567890",
    status: "accepted",
    honorific: "Srila",
    spiritualMaster: "Gaurakisora Dasa Babaji",
    associatedTemple: "Gaudiya Math",
    memorialLocation: "Mayapur, India"
  },
  {
  name: "HH Radhanath Swami",
  birthDate: new Date("1950-12-07"),
  deathDate: new Date("2023-08-01"),
  spiritualMaster: "Srila Prabhupada",   // ✅ REQUIRED
  location: "Vrindavan, India",
  description: "A great devotee...",
  coverImage: "https://...",
  contributorName: "Admin",
  contributorPhone: "9999999999",
  status: "accepted",
    honorific: "His Holiness",
    associatedTemple: "ISKCON Mumbai",
}
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");

    // Clear existing profiles (optional)
    await Profile.deleteMany({});
    console.log("Cleared existing profiles");

    // Insert seed data
    const result = await Profile.insertMany(seedProfiles);
    console.log(`✅ Successfully seeded ${result.length} profiles`);
    
    result.forEach(profile => {
      console.log(`- ${profile.name} (ID: ${profile._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();