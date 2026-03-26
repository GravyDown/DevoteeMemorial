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
];

const duplicatedQuotes = [...quotes, ...quotes, ...quotes];

export default function WisdomSection() {
  return (
    <section className="py-16 overflow-hidden bg-[#FFF0DD]">
      {/* ✅ Figma: left-aligned heading (not centered) */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-10 text-left">
        <h2 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">
          Words of Wisdom
        </h2>
      </div>

      <div className="relative w-full">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#FFF0DD] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#FFF0DD] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6 px-4"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {duplicatedQuotes.map((quote, index) => (
            <QuoteCard key={`${quote.id}-${index}`} quote={quote} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function QuoteCard({ quote }: { quote: (typeof quotes)[0] }) {
  return (
    <motion.div
      className="flex-shrink-0 w-[300px] md:w-[440px] bg-[#FFF8E7] rounded-3xl p-7 md:p-9 border border-[#8D6E63]/10 relative"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
    >
      <Quote className="w-10 h-10 text-[#E67E22] mb-5 rotate-180 opacity-25" />
      <p className="font-script text-xl md:text-2xl text-[#5D4037] leading-relaxed mb-7 min-h-[100px]">
        "{quote.text}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm shrink-0">
          <img
            src={quote.image}
            alt={quote.author}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-bold text-[#5D4037] text-sm">{quote.author}</p>
          <p className="text-xs text-[#8D6E63]">{quote.role}</p>
        </div>
      </div>
    </motion.div>
  );
}
