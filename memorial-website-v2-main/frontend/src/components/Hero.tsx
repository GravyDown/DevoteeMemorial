import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Hero() {
  return (
    <section className="pt-24 pb-16">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
        {/* LEFT: Text */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
          <h1 className="font-script text-[#804B23] leading-tight">
            A Tribute to <br />
            <span className="whitespace-nowrap">Eternal Service</span>
          </h1>

          <p className="text-[#295F98] font-medium mt-6 text-sm sm:text-base">
            A sacred space to honor Srila Prabhupada's disciples — explore their lives,
            cherish their memories, and offer your heartfelt tributes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <Button className="bg-[#8D6E63] hover:bg-[#795548] text-white rounded-full px-8 h-[44px]">
              Explore →
            </Button>

            <Link to="/offerings/new">
              <Button
                variant="outline"
                className="border-[#8D6E63] text-[#8D6E63] rounded-full px-8 h-[44px] w-full sm:w-auto"
              >
                Give Offering
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT: Image */}
        <div className="relative w-full max-w-md sm:max-w-lg">
          <div className="relative aspect-[3/2] rounded-full overflow-hidden">
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/34ce29e0-5b3a-4677-a64d-a384afbc2bc6"
              alt="Temple"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#FFF1DF] to-transparent" />
          </div>

          <p className="mt-6 font-script text-3xl sm:text-4xl text-[#E2A16F] text-center">
            In Loving Service and Remembrance
          </p>
        </div>
      </div>
    </section>
  );
}
