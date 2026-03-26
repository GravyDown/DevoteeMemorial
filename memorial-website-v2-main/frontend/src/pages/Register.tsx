import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "", // ✅ new
    temple: "", // ✅ new
    location: "", // ✅ new
    accountType: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms before submitting.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        temple: formData.temple,
        location: formData.location,
        accountType: formData.accountType,
      });

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/auth"), 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Tabs */}
        <div className="flex w-full max-w-[900px] mb-8 border-b border-[#8D6E63]/20">
          <div className="flex-1 flex justify-center">
            <Link
              to="/auth"
              className="pb-4 px-12 text-[#8D6E63] font-medium text-lg hover:text-[#5D4037] transition-colors"
            >
              Login
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <button className="pb-4 px-12 text-[#5D4037] font-bold text-lg border-b-2 border-[#5D4037]">
              Create Account
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-sm p-12 md:p-16 flex flex-col">
          <div className="text-center mb-10">
            <h1 className="text-[#5D4037] font-bold text-3xl mb-2">
              Create Account
            </h1>
            <p className="text-[#8D6E63]/70 text-sm">
              Sign up to create your account
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mb-4">{success}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Full Name
                </label>
                <Input
                  placeholder="Enter name"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                />
              </div>

              {/* Initiated Name — display only, not sent to backend */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Initiated Name{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <Input
                  placeholder="Initiated name"
                  className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Email ID
                </label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                />
              </div>

              {/* Initiated Guru Name — display only */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Initiated Guru Name{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <Input
                  placeholder="Initiated guru name"
                  className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                />
              </div>

              {/* Location — display only */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Location/City
                </label>
                <Input
                  placeholder="Location/city"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 ..."
                />
              </div>

              {/* Connected Temple — display only */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Connected Temple
                </label>
                <Input
                  placeholder="Connected temple"
                  value={formData.temple}
                  onChange={(e) => handleChange("temple", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 ..."
                />
              </div>

              {/* Contact Number — display only */}
              <div className="space-y-2">
                <label className="text-[#5D4037] font-medium text-sm">
                  Contact Number
                </label>
                <Input
                  placeholder="Enter contact number"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 ..."
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2 mt-8">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-[#804B23] cursor-pointer"
              />
              <label
                htmlFor="agree"
                className="text-sm text-[#5D4037] cursor-pointer"
              >
                I agree that all submissions will be reviewed before publishing.
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-start mt-8">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-12 text-base font-medium flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Submit"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
