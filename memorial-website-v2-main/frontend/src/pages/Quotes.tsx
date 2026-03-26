import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const quotes = [
  {
    id: 1,
    text: "A good dancer does not blame the stage! A good cook does not blame the utensils! A good engineer does not blame the instruments, so a good preacher does not blame the field of his preaching.",
    author: "HG Aindra Prabhu",
    role: "24 Hour Kirtan Leader",
    image: "https://i.pravatar.cc/300?img=60",
  },
  {
    id: 2,
    text: "Always chant the holy name of the Lord. There is no other way, no other way, no other way.",
    author: "Srila Prabhupada",
    role: "Founder Acharya",
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    id: 3,
    text: "Real love is based on respect, compromise, care and trust.",
    author: "HH Radhanath Swami",
    role: "Spiritual Leader",
    image: "https://i.pravatar.cc/300?img=12",
  },
  {
    id: 4,
    text: "We must be very careful not to become a source of disturbance to others.",
    author: "HH Bhakti Tirtha Swami",
    role: "Spiritual Warrior",
    image: "https://i.pravatar.cc/300?img=13",
  },
  {
    id: 5,
    text: "The mission of this Krishna consciousness movement is to make people happy. Everyone is unhappy due to lack of Krishna consciousness.",
    author: "Srila Prabhupada",
    role: "Founder Acharya",
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    id: 6,
    text: "Humility is the foundation of all spiritual advancement.",
    author: "HH Jayapataka Swami",
    role: "GBC Member",
    image: "https://i.pravatar.cc/300?img=15",
  },
  {
    id: 7,
    text: "Service to the devotees is even more important than service to the Lord directly.",
    author: "HG Tamal Krishna Goswami",
    role: "Senior Disciple",
    image: "https://i.pravatar.cc/300?img=17",
  },
  {
    id: 8,
    text: "Without love and devotion, all penance and austerity is useless.",
    author: "HH Sridhar Swami",
    role: "Kirtan Leader",
    image: "https://i.pravatar.cc/300?img=18",
  },
];

export default function Quotes() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 md:px-16 py-12 w-full">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">
            Words of Wisdom
          </h1>
          <p className="text-[#8D6E63]/70 text-sm mt-1">
            Timeless teachings from departed Vaishnava saints and spiritual leaders
          </p>
        </div>

        {/* Quotes grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="break-inside-avoid bg-[#FFF8E7] rounded-3xl p-7 border border-[#8D6E63]/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-[#E67E22] mb-4 rotate-180 opacity-30" />

              <p className="font-script text-xl text-[#5D4037] leading-relaxed mb-6">
                {expanded === quote.id || quote.text.length <= 180
                  ? `"${quote.text}"`
                  : `"${quote.text.slice(0, 180)}..."`}
              </p>

              {quote.text.length > 180 && (
                <button
                  onClick={() =>
                    setExpanded(expanded === quote.id ? null : quote.id)
                  }
                  className="text-xs text-[#804B23] hover:underline mb-4 block"
                >
                  {expanded === quote.id ? "show less" : "read more"}
                </button>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-[#8D6E63]/10">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                  <img
                    src={quote.image}
                    alt={quote.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#5D4037] text-sm">
                    {quote.author}
                  </p>
                  <p className="text-xs text-[#8D6E63]">{quote.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}