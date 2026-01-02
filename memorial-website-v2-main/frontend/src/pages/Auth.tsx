import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface AuthPageProps {
  redirectAfterAuth?: string;
}

export default function AuthPage({ redirectAfterAuth = "/" }: AuthPageProps) {
  // State for form fields (visual only as per instructions)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      console.log("Form submitted:", { email, password, redirectAfterAuth });
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
            <Link to="/create-account" className="pb-4 px-12 text-[#8D6E63] font-medium text-lg hover:text-[#5D4037] transition-colors">
              Create Account
            </Link>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-sm p-12 md:p-20 min-h-[600px] flex flex-col items-center">
          
          <h1 className="text-[#5D4037] font-bold text-3xl mb-2">Log In</h1>
          <p className="text-[#8D6E63]/70 text-sm mb-8">Sign up with Email and Password</p>

          {/* Social Icons */}
          <div className="flex gap-6 mb-10">
            {/* Google */}
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors overflow-hidden bg-white">
              <img 
                src="https://harmless-tapir-303.convex.cloud/api/storage/abd0a68b-c2af-4691-acef-96c3c3b864a5" 
                alt="Google" 
                className="w-full h-full object-cover"
              />
            </button>
            {/* Instagram */}
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors overflow-hidden bg-white">
              <img 
                src="https://harmless-tapir-303.convex.cloud/api/storage/2ae2c869-7532-4425-9ee7-66a1191780f8" 
                alt="Instagram" 
                className="w-full h-full object-cover"
              />
            </button>
            {/* Facebook */}
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors overflow-hidden bg-white">
              <img 
                src="https://harmless-tapir-303.convex.cloud/api/storage/cb882324-d25b-489b-9cfe-92833c6416fd" 
                alt="Facebook" 
                className="w-full h-full object-cover"
              />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <label className="text-[#5D4037] font-medium text-sm">Email ID</label>
              <Input 
                type="email" 
                placeholder="Enter email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#5D4037] font-medium text-sm">Password</label>
              <Input 
                type="password" 
                placeholder="Enter Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-[#8D6E63] hover:underline">
                Forgot your password ?
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

        {/* Footer Action */}
        <div className="mt-12">
          <Link 
            to="/create-account" 
            className="text-[#804B23] font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            Create Departed Devotee's Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}