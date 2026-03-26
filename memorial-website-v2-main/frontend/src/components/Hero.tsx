import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Hero() {
  return (
    <section className="pt-16 pb-10">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16">

        {/* LEFT: Text */}
        <div className="flex flex-col items-start text-left max-w-lg">
          {/* ✅ Figma: large Sacramento script heading */}
          <h1
            className="font-script text-[#804B23] leading-[1.1]"
            style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)" }}
          >
            A Tribute to<br />
            Eternal Service
          </h1>

          <p className="text-[#295F98] font-medium mt-5 text-sm sm:text-base leading-relaxed">
            A sacred space to honor Srila Prabhupada's disciples — explore
            their lives, cherish their memories, and offer your heartfelt
            tributes.
          </p>

          {/* ✅ Figma: "Explore →" dark brown pill + "Give Offering" outline */}
          <div className="flex flex-row gap-3 mt-7">
            <Link to="/disciples">
              <Button className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-7 h-[44px] font-medium">
                Explore →
              </Button>
            </Link>
            <Link to="/offerings/new">
              <Button
                variant="outline"
                className="border-[#804B23]/40 text-[#804B23] hover:bg-[#804B23]/5 rounded-full px-7 h-[44px] font-medium bg-transparent"
              >
                Give Offering
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT: Oval image + script subtitle */}
        <div className="relative w-full max-w-[420px] lg:max-w-[480px] flex flex-col items-center">
          {/* ✅ Figma: oval/ellipse crop with fade at bottom */}
          <div
            className="relative overflow-hidden w-full shadow-xl"
            style={{ borderRadius: "50% / 45%", aspectRatio: "4/3" }}
          >
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/34ce29e0-5b3a-4677-a64d-a384afbc2bc6"
              alt="Temple"
              className="w-full h-full object-cover scale-110"
            />
            {/* Bottom fade into page background */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#FFF1DF] to-transparent" />
          </div>

          {/* ✅ Figma: italic script subtitle below image */}
          <p
            className="font-script text-[#C98A4B] text-center mt-4 leading-tight"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
          >
            In Loving Service and Remembrance
          </p>
        </div>
      </div>
    </section>
  );
}