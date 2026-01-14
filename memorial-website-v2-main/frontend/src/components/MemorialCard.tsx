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

export default function MemorialCard({
  name,
  years,
  image,
  isVerified,
  id,
}: MemorialCardProps) {
  return (
    <Link to={`/disciples/${id}`} className="block">
      <motion.div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-black">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {isVerified && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1">
            <BadgeCheck className="w-4 h-4 text-[#E67E22]" />
          </div>
        )}

        <div className="absolute bottom-0 w-full p-4 text-center">
          <h3 className="text-white font-medium text-base">{name}</h3>
          <p className="text-white/70 text-xs">{years}</p>

          <Button
            size="sm"
            className="mt-3 rounded-full bg-white/90 text-[#5D4037]"
          >
            View Profile
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}
