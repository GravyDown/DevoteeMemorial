import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, BookOpen, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: Heart,
    title: "Devotion",
    description:
      "Every profile on this platform is a heartfelt offering to honor the spiritual legacy of departed Vaishnavas.",
  },
  {
    icon: BookOpen,
    title: "Preservation",
    description:
      "We preserve teachings, timelines, and memories so future generations can learn from these great souls.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Built by devotees, for devotees — this is a collective seva to keep the memory of our spiritual family alive.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Honoring devotees from Vrindavan to London, Mayapur to New York — wherever Krishna's glories are sung.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">

        {/* Hero section */}
        <div className="bg-[#804B23] text-white py-20 px-6">
          <div className="max-w-[1280px] mx-auto md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-script text-[52px] md:text-[64px] mb-4">
                About This Seva
              </h1>
              <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                ISKCON Memorial is a humble digital offering — a sacred space
                to remember, honor, and stay connected with the departed
                Vaishnavas who shaped our spiritual lives.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-16">

          {/* Mission */}
          <div className="bg-[#FFF8E7] rounded-3xl p-10 mb-12 border border-[#8D6E63]/10">
            <h2 className="font-script text-[36px] text-[#8D6E63] mb-4">
              Our Mission
            </h2>
            <p className="text-[#5D4037]/80 leading-relaxed text-base">
              When a great devotee departs, they leave behind a treasure of
              spiritual wisdom, selfless service, and divine love. This platform
              exists to ensure that treasure is never lost. Families, disciples,
              and well-wishers can create memorial profiles, share offerings,
              and keep the memory of their beloved Vaishnavas alive for
              generations to come.
            </p>
            <p className="text-[#5D4037]/80 leading-relaxed text-base mt-4">
              Every profile submitted goes through a review process to ensure
              the dignity and accuracy of each memorial. We believe every
              devotee — known or unknown — deserves to be remembered.
            </p>
          </div>

          {/* Values grid */}
          <h2 className="font-script text-[40px] text-[#8D6E63] mb-8">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-[#8D6E63]/10 shadow-sm flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFF1DF] flex items-center justify-center shrink-0">
                  <value.icon className="w-6 h-6 text-[#804B23]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#5D4037] text-lg mb-2">
                    {value.title}
                  </h3>
                  <p className="text-[#8D6E63]/80 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-[#804B23] rounded-3xl p-10 text-white">
            <h2 className="font-script text-[36px] mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create Account",
                  desc: "Register as a family member or devotee to create a memorial profile.",
                },
                {
                  step: "02",
                  title: "Submit Profile",
                  desc: "Fill in details about the departed devotee — their life, service, and spiritual journey.",
                },
                {
                  step: "03",
                  title: "Share Offerings",
                  desc: "Once approved, visitors can give digital offerings — photos, audio, messages of tribute.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="text-white/30 font-bold text-4xl leading-none shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}