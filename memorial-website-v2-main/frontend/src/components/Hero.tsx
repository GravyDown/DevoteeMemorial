import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Hero() {
  return (
    <section className="max-w-[1280px] mx-auto px-16 pt-[158px] pb-16">
      <div className="flex justify-between items-center h-[408px]">
        {/* Left Column (Text) */}
        <div className="flex flex-col items-start w-[521px]">
          <h1 className="font-script font-normal text-[82px] leading-[70px] tracking-[0.05em] text-[#804B23]">
            A Tribute to <br />
            <span className="whitespace-nowrap">Eternal Service</span>
          </h1>
          <p className="text-[#295F98] font-medium text-[16px] leading-none w-[508px] mt-6">
            A sacred space to honor Srila Prabhupada's disciples — explore their lives, cherish their memories, and offer your heartfelt tributes.
          </p>
          <div className="flex gap-4 mt-8">
            <Button className="bg-[#8D6E63] hover:bg-[#795548] text-white rounded-full px-8 h-[44px] text-[15px] font-medium shadow-lg hover:shadow-xl transition-all">
              Explore →
            </Button>
            <Link to="/offerings/new">
              <Button variant="outline" className="border-[#8D6E63] text-[#8D6E63] hover:bg-[#8D6E63]/10 bg-transparent rounded-full px-8 h-[44px] text-[15px] font-medium">
                Give Offering
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column (Image Block) */}
        <div className="relative">
          <div className="relative w-[590px] h-[408px] rounded-[284.87px] overflow-hidden backdrop-blur-[56.52px]">
             <img 
               src="https://harmless-tapir-303.convex.cloud/api/storage/34ce29e0-5b3a-4677-a64d-a384afbc2bc6" 
               alt="Temple" 
               className="w-full h-full object-cover"
             />
             {/* Bottom fade effect */}
             <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-[#FFF1DF] to-transparent pointer-events-none" />
          </div>
          {/* Subtext - Positioned absolutely to not affect layout */}
          <p className="absolute top-full left-1/2 -translate-x-1/2 w-[618px] mt-[25px] font-script font-normal text-[48px] leading-[100%] tracking-normal text-[#E2A16F] text-center whitespace-nowrap">
            In Loving Service and Remembrance
          </p>
        </div>
      </div>
    </section>
  );
}