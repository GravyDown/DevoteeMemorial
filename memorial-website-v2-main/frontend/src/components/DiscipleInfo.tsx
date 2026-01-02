import { Button } from "@/components/ui/button";
import { Share2, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface DiscipleInfoProps {
  name: string;
  ageRange: string;
  services: string;
}

export default function DiscipleInfo({ name, ageRange, services }: DiscipleInfoProps) {
  return (
    <div className="px-6 md:px-16 flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
      {/* Basic Info */}
      <div className="mt-4">
        <h1 className="text-[#5D4037] font-bold text-3xl md:text-4xl mb-2">{name}</h1>
        <p className="text-[#8D6E63] text-sm mb-1">{ageRange}</p>
        <p className="text-[#8D6E63] text-sm">{services}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 md:mt-0">
        <Link to="/offerings/new">
          <Button className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-6 h-10 text-sm font-medium shadow-none">
            Give Offering <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Button variant="outline" className="border-[#804B23] text-[#804B23] hover:bg-[#804B23]/10 rounded-full px-6 h-10 text-sm font-medium bg-transparent shadow-none">
          Follow <Heart className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline" className="border-[#804B23] text-[#804B23] hover:bg-[#804B23]/10 rounded-full px-6 h-10 text-sm font-medium bg-transparent shadow-none">
          Share <Share2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
