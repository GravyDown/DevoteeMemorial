import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#26537B] to-[#7FAAC1] text-white pt-16 pb-8 mt-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-col md:flex-row gap-12 items-center md:items-start">
        {/* Left: brand info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-8 md:mt-16">
          {/* LOGO: Replace "/your-new-logo.svg" with the path to your actual logo image file in the public folder */}
          <img
            src="/Footer.png"
            alt="Logo"
            className="w-32 h-auto mb-6 object-contain"
          />
          <p className="text-sm text-white max-w-xs leading-relaxed font-medium">
            This website is a humble offering to honor departed Vaishnavas. It
            preserves their memories, services, and teachings so devotees can
            stay connected to their legacy.
          </p>
        </div>

        {/* Center: feedback form */}
        <div className="flex-[1.5] w-full">
          <div className="bg-white rounded-xl p-8 md:p-10 text-[#5D4037] shadow-lg max-w-[500px] mx-auto">
            <h3 className="text-center text-lg font-bold mb-1 text-[#804B23]">
              Feedback
            </h3>
            <p className="text-center text-sm text-gray-500 mb-8">
              Share your thoughts and help us improve this seva
            </p>
            <form className="space-y-5">
              <Input
                placeholder="Name"
                className="bg-white border-gray-200 h-[48px] rounded-lg text-sm"
              />
              <Input
                placeholder="Email"
                className="bg-white border-gray-200 h-[48px] rounded-lg text-sm"
              />
              <Textarea
                placeholder="Feedback"
                className="bg-white border-gray-200 min-h-[120px] rounded-lg text-sm resize-none"
              />
              <div className="flex justify-start pt-2">
                <Button className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-[44px]">
                  Submit →
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: nav links */}
        <div className="flex-1 flex flex-col items-center md:items-end gap-6 text-[15px] font-medium text-white mt-8 md:mt-16">
          {[
            { label: "Home", path: "/" },
            { label: "Disciples", path: "/disciples" },
            { label: "Offerings", path: "/offerings" },
            { label: "Quotes", path: "/quotes" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`hover:opacity-80 transition-opacity ${
                label === "Home"
                  ? "underline underline-offset-4 decoration-2"
                  : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
