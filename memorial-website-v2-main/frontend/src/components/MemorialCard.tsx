import { BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

interface MemorialCardProps {
  name: string;
  years: string;
  image: string;
  isVerified?: boolean;
  id: string;
}

export default function MemorialCard({ name, years, image, isVerified, id }: MemorialCardProps) {
  return (
    <Link to={`/disciples/${id}`} state={{ image, name, years }} className="block h-full">
      <motion.div 
        className="group/card relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md bg-black"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Background Image */}
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-all duration-500 group-hover/card:opacity-40 group-hover/card:scale-105"
        />
        
        {/* Gradient Overlay - Default state */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover/card:opacity-0" />

        {/* Hover Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
          <p className="text-white text-center font-script text-lg mb-4 italic leading-tight">
            "Always chant the holy name of the Lord."
          </p>
          <Button 
            variant="secondary" 
            size="sm"
            className="rounded-full bg-white/90 text-[#5D4037] hover:bg-white font-medium text-xs px-6 h-8"
          >
            View Full Profile
          </Button>
        </div>

        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 text-[#E67E22] bg-white/90 rounded-full p-1 shadow-sm z-10">
            <BadgeCheck className="w-4 h-4" />
          </div>
        )}

        {/* Bottom Content - Name & Years */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center transition-all duration-300 group-hover/card:translate-y-4 group-hover/card:opacity-0">
          <h3 className="text-white font-medium text-sm md:text-base line-clamp-1 mb-1">{name}</h3>
          <p className="text-white/70 text-xs font-light">{years}</p>
        </div>
      </motion.div>
    </Link>
  );
}