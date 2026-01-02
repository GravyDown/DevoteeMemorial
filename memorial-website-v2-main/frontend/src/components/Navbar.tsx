import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-[#FFF0DD]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 h-[72px] flex items-center justify-between">
        {/* Logo - Left Aligned */}
        <div className="flex items-center h-full">
          <div className="h-12 w-auto flex items-center justify-center">
            <img 
              src="https://harmless-tapir-303.convex.cloud/api/storage/f4dcb599-cf9e-423f-89a5-93f35ad8f8d0" 
              alt="Logo" 
              className="h-full w-auto object-contain" 
            />
          </div>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-8 text-[#5D4037] font-medium text-[15px] tracking-wide absolute left-1/2 -translate-x-1/2">
          <Link 
            to="/" 
            className={`hover:text-[#8D6E63] transition-colors border-b-2 ${isActive('/') ? 'border-[#8D6E63]' : 'border-transparent'} hover:border-[#8D6E63] py-1`}
          >
            Home
          </Link>
          <Link 
            to="/disciples" 
            className={`hover:text-[#8D6E63] transition-colors border-b-2 ${isActive('/disciples') ? 'border-[#8D6E63]' : 'border-transparent'} hover:border-[#8D6E63] py-1`}
          >
            Disciples
          </Link>
          <Link 
            to="/offerings" 
            className={`hover:text-[#8D6E63] transition-colors border-b-2 ${isActive('/offerings') ? 'border-[#8D6E63]' : 'border-transparent'} hover:border-[#8D6E63] py-1`}
          >
            Offerings
          </Link>
          <Link 
            to="/about" 
            className={`hover:text-[#8D6E63] transition-colors border-b-2 ${isActive('/about') ? 'border-[#8D6E63]' : 'border-transparent'} hover:border-[#8D6E63] py-1`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`hover:text-[#8D6E63] transition-colors border-b-2 ${isActive('/contact') ? 'border-[#8D6E63]' : 'border-transparent'} hover:border-[#8D6E63] py-1`}
          >
            Contact
          </Link>
        </div>

        {/* Login Button - Right Aligned */}
        <div className="hidden md:block">
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-[#8D6E63] hover:bg-[#795548] text-white rounded-full px-8 h-[40px] text-[15px] font-medium"
          >
            Login →
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-[#5D4037]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-[#FFF0DD] shadow-lg p-6 flex flex-col gap-4 md:hidden z-50 border-t border-[#8D6E63]/10">
          <Link to="/" className="text-[#5D4037] text-lg">Home</Link>
          <Link to="/disciples" className="text-[#5D4037] text-lg">Disciples</Link>
          <Link to="/offerings" className="text-[#5D4037] text-lg">Offerings</Link>
          <Link to="/about" className="text-[#5D4037] text-lg">About</Link>
          <Link to="/contact" className="text-[#5D4037] text-lg">Contact</Link>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-[#8D6E63] text-white w-full rounded-full h-[40px]"
          >
            Login
          </Button>
        </div>
      )}
    </nav>
  );
}