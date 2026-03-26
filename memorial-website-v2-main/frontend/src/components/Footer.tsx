import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#2C5282] to-[#1A365D] text-white pt-16 pb-8 mt-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-col md:flex-row gap-12">
        {/* Left: brand info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-12 h-12 brightness-0 invert"
            />
          </div>
          <p className="text-sm text-blue-100 max-w-xs leading-relaxed">
            This website is a humble offering to honor departed Vaishnavas. It
            preserves their memories, services, and teachings so devotees can
            stay connected to their legacy.
          </p>
        </div>

        {/* Center: feedback form */}
        <div className="flex-[1.5]">
          <div className="bg-white rounded-2xl p-6 md:p-8 text-[#5D4037] shadow-xl max-w-md mx-auto">
            <h3 className="text-center text-sm font-medium mb-1 text-[#8D6E63]">
              Feedback
            </h3>
            <p className="text-center text-xs text-gray-400 mb-6">
              Share your thoughts and help us improve this seva
            </p>
            <form className="space-y-4">
              <Input
                placeholder="Name"
                className="bg-gray-50 border-gray-200 h-[44px] rounded-lg"
              />
              <Input
                placeholder="Email"
                className="bg-gray-50 border-gray-200 h-[44px] rounded-lg"
              />
              <Textarea
                placeholder="Feedback"
                className="bg-gray-50 border-gray-200 min-h-[100px] rounded-lg"
              />
              <Button className="w-full bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full h-[44px]">
                Submit →
              </Button>
            </form>
          </div>
        </div>

        {/* Right: nav links — ✅ Quotes instead of Offerings */}
        <div className="flex-1 flex flex-col items-center md:items-end gap-3 text-sm text-blue-100">
          {[
            { label: "Home", path: "/" },
            { label: "Disciples", path: "/disciples" },
            { label: "Quotes", path: "/quotes" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className="hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
