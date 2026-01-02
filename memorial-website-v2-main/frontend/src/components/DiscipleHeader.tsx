import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DiscipleHeaderProps {
  image: string;
}

export default function DiscipleHeader({ image }: DiscipleHeaderProps) {
  return (
    <div className="relative mb-16">
      {/* Banner - Solid Brown as per instructions */}
      <div className="w-full h-[240px] bg-[#804B23] rounded-b-[32px]" />
      
      {/* Profile Photo - Overlapping */}
      <div className="absolute -bottom-12 left-6 md:left-16">
        <div className="rounded-full border-[6px] border-[#FFF1DF] p-0.5 bg-white shadow-lg">
          <Avatar className="w-32 h-32 md:w-40 md:h-40">
            <AvatarImage src={image} className="object-cover" />
            <AvatarFallback>DP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
