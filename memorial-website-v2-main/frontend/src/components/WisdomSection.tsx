import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const quotes = [
  {
    id: 1,
    text: "A good dancer does not blame the stage! A good cook does not blame the utensils! A good engineer does not blame the instruments, so a good preacher does not blame the field of his preaching.",
    author: "HG Aindra Prabhu",
    role: "24 Hour Kirtan Leader",
    image: "https://i.pravatar.cc/300?img=60"
  },
  {
    id: 2,
    text: "Always chant the holy name of the Lord. There is no other way, no other way, no other way.",
    author: "Srila Prabhupada",
    role: "Founder Acharya",
    image: "https://i.pravatar.cc/300?img=11"
  },
  {
    id: 3,
    text: "Real love is not based on romance, candle light dinner and walks along the beach. In fact, is based on respect, compromise, care and trust.",
    author: "HH Radhanath Swami",
    role: "Spiritual Leader",
    image: "https://i.pravatar.cc/300?img=12"
  },
  {
    id: 4,
    text: "We must be very careful not to become a source of disturbance to others.",
    author: "HH Bhakti Tirtha Swami",
    role: "Spiritual Warrior",
    image: "https://i.pravatar.cc/300?img=13"
  }
];

// Duplicate quotes to create seamless loop
const duplicatedQuotes = [...quotes, ...quotes, ...quotes];

export default function WisdomSection() {
  return (
    <section className="py-16 overflow-hidden bg-[#FFF0DD]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-12 text-center">
        <h2 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">Words of Wisdom</h2>
      </div>

      <div className="relative w-full">
        {/* Gradient Masks for smooth fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#FFF0DD] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#FFF0DD] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-8 px-4"
          animate={{
            x: ["0%", "-33.33%"]
          }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedQuotes.map((quote, index) => (
            <QuoteCard key={`${quote.id}-${index}`} quote={quote} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function QuoteCard({ quote }: { quote: typeof quotes[0] }) {
  return (
    <motion.div
      className="flex-shrink-0 w-[350px] md:w-[500px] bg-[#FFF8E7] rounded-3xl p-8 md:p-10 border border-[#8D6E63]/10 relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Quote className="w-12 h-12 text-[#E67E22] mb-6 rotate-180 opacity-30" />
      <p className="font-script text-2xl text-[#5D4037] leading-relaxed mb-8 min-h-[120px] text-center">
        "{quote.text}"
      </p>
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
          <img src={quote.image} alt={quote.author} className="w-full h-full object-cover" />
        </div>
        <div className="text-left">
          <p className="font-bold text-[#5D4037]">{quote.author}</p>
          <p className="text-xs text-[#8D6E63]">{quote.role}</p>
        </div>
      </div>
    </motion.div>
  );
}