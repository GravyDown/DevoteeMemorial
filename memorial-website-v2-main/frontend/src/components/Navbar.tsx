import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, UserCircle, PlusCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/auth");
  };

  // ✅ Figma: Home, Disciples, Quotes, About, Contact
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Disciples", path: "/disciples" },
    { label: "Quotes", path: "/quotes" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const displayName = user?.username || user?.email?.split("@")[0] || "Profile";

  return (
    <nav className="w-full bg-[#FFF0DD] sticky top-0 z-50">
      <div className="page-container h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="https://harmless-tapir-303.convex.cloud/api/storage/f4dcb599-cf9e-423f-89a5-93f35ad8f8d0"
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7 text-[#5D4037] font-medium text-[15px]">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`py-1 border-b-2 transition-colors ${
                isActive(path)
                  ? "border-[#804B23] text-[#804B23] font-semibold"
                  : "border-transparent hover:border-[#8D6E63] hover:text-[#8D6E63]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="w-[100px] h-[40px] bg-[#8D6E63]/20 animate-pulse rounded-full" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/create-account"
                className="flex items-center gap-1.5 text-[#804B23] font-medium text-[14px] border border-[#804B23]/40 rounded-full px-4 h-[40px] hover:bg-[#804B23]/10 transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                Create Memorial
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-4 h-[40px] text-[15px] transition-colors"
                >
                  <UserCircle className="w-5 h-5 shrink-0" />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-[48px] bg-white rounded-2xl shadow-lg border border-[#8D6E63]/10 py-2 w-56 z-50">
                    <div className="px-4 py-2 border-b border-[#8D6E63]/10">
                      <p className="text-xs text-[#8D6E63]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#5D4037] truncate">{user?.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // ✅ Figma: dark brown rounded pill
            <Button
              onClick={() => navigate("/auth")}
              className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-6 h-[40px] text-[15px] font-medium"
            >
              Login →
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#5D4037]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FFF0DD] border-t border-[#8D6E63]/10">
          <div className="page-container py-6 flex flex-col gap-4">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className={`text-[#5D4037] text-lg font-medium ${isActive(path) ? "text-[#804B23] font-semibold" : ""}`}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="border-t border-[#8D6E63]/10 pt-4 space-y-0.5">
                  <p className="text-xs text-[#8D6E63]">Signed in as</p>
                  <p className="text-sm font-semibold text-[#5D4037]">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <Link
                  to="/create-account"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-[#804B23] font-medium text-base border border-[#804B23]/40 rounded-full px-4 py-2.5 hover:bg-[#804B23]/10 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Devotee Memorial
                </Link>
                <Button
                  onClick={() => { closeMenu(); handleLogout(); }}
                  variant="outline"
                  className="border-red-300 text-red-600 w-full rounded-full h-[44px] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => { closeMenu(); navigate("/auth"); }}
                className="bg-[#804B23] text-white w-full rounded-full h-[44px]"
              >
                Login →
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}