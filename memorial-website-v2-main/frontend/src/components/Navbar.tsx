import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="w-full bg-[#FFF0DD] sticky top-0 z-50">
      <div className="page-container h-[72px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="https://harmless-tapir-303.convex.cloud/api/storage/f4dcb599-cf9e-423f-89a5-93f35ad8f8d0"
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-[#5D4037] font-medium text-[15px]">
          {[
            { label: "Home", path: "/" },
            { label: "Disciples", path: "/disciples" },
            { label: "Offerings", path: "/offerings" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`py-1 border-b-2 transition-colors ${
                isActive(path)
                  ? "border-[#8D6E63] text-[#8D6E63]"
                  : "border-transparent hover:border-[#8D6E63] hover:text-[#8D6E63]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Login */}
        <div className="hidden md:block">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-[#8D6E63] hover:bg-[#795548] text-white rounded-full px-6 h-[40px] text-[15px]"
          >
            Login →
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#5D4037]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FFF0DD] border-t border-[#8D6E63]/10">
          <div className="page-container py-6 flex flex-col gap-4">
            {[
              { label: "Home", path: "/" },
              { label: "Disciples", path: "/disciples" },
              { label: "Offerings", path: "/offerings" },
              { label: "About", path: "/about" },
              { label: "Contact", path: "/contact" },
            ].map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className="text-[#5D4037] text-lg"
              >
                {label}
              </Link>
            ))}

            <Button
              onClick={() => {
                closeMenu();
                navigate("/auth");
              }}
              className="bg-[#8D6E63] text-white w-full rounded-full h-[44px]"
            >
              Login
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
