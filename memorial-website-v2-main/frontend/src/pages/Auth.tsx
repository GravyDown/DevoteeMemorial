import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface AuthPageProps {
  redirectAfterAuth?: string;
}

export default function AuthPage({ redirectAfterAuth = "/" }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { isAuthenticated, refresh } = useAuth();

  // Google credential handler
  const handleCredentialResponse = async (response: { credential: string }) => {
    setError("");
    try {
      await api.post("/users/google", { credential: response.credential });
      refresh();
      navigate("/");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Google login failed.");
    }
  };

  // Check if already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get("/auth/verify");
        if (res.data.success) navigate("/home");
      } catch {
        // not logged in, stay on page
      }
    };
    checkLogin();
  }, []);

  // Render Google button
  useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (cancelled) return false;
      if (!window.google?.accounts?.id) return false;
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        const el = document.getElementById("googleSignInDiv");
        if (el) {
          window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "signin_with",
            width: 400,
          });
        }
        return true;
      } catch {
        return false;
      }
    };

    if (!init()) {
      const timer = setInterval(() => {
        if (init()) clearInterval(timer);
      }, 200);
      return () => {
        clearInterval(timer);
        cancelled = true;
      };
    }
    return () => { cancelled = true; };
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  try {
    await api.post("/users/login", { email, password });
    await refresh(); // ← make this await so user loads before navigate
    navigate("/");
  } catch (e: any) {
    setError(e?.response?.data?.error || "Login failed.");
  }
};

  // ✅ Guard for "Create Departed Devotee's Account" link
  const handleCreateDevoteeClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error("Please log in first to create a Departed Devotee's account.", {
        description: "You need to be signed in to access this feature.",
        action: {
          label: "Got it",
          onClick: () => {},
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Tabs */}
        <div className="flex w-full max-w-[900px] mb-8 border-b border-[#8D6E63]/20">
          <div className="flex-1 flex justify-center">
            <button className="pb-4 px-12 text-[#5D4037] font-bold text-lg border-b-2 border-[#5D4037]">
              Login
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <Link
              to="/register"
              className="pb-4 px-12 text-[#8D6E63] font-medium text-lg hover:text-[#5D4037] transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-sm p-12 md:p-20 min-h-[600px] flex flex-col items-center">
          <h1 className="text-[#5D4037] font-bold text-3xl mb-2">Log In</h1>
          <p className="text-[#8D6E63]/70 text-sm mb-8">
            Sign in with Email or Google
          </p>

          <div id="googleSignInDiv" className="mb-6" />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <label className="text-[#5D4037] font-medium text-sm">
                Email ID
              </label>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[#5D4037] font-medium text-sm">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-[#8D6E63] hover:underline"
              >
                Forgot your password?
              </button>
            </div>
            <Button
              type="submit"
              className="w-[140px] h-12 bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full text-base font-medium flex items-center gap-2"
            >
              Submit <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* ✅ Guarded link — shows toast if not logged in */}
        <div className="mt-12">
          <Link
            to="/create-account"
            onClick={handleCreateDevoteeClick}
            className="text-[#804B23] font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            Create Departed Devotee's Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}