import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // If no token or email in URL — invalid link
  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or missing reset link. Please request a new one.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/users/reset-password", {
        token,
        email,
        newPassword,
      });
      setSuccess(true);
      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Reset failed. The link may have expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-sm p-10 flex flex-col items-center">

          {success ? (
            // ── Success state ──
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-[#5D4037] font-bold text-2xl mb-2">
                Password Reset!
              </h2>
              <p className="text-[#8D6E63]/70 text-sm mb-2">
                Your password has been reset successfully.
              </p>
              <p className="text-xs text-[#8D6E63]/50 mb-6">
                Redirecting to login in 3 seconds...
              </p>
              <Link
                to="/auth"
                className="text-[#804B23] text-sm font-medium hover:underline"
              >
                Go to Login →
              </Link>
            </div>
          ) : (
            // ── Form state ──
            <>
              <h1 className="text-[#5D4037] font-bold text-2xl mb-2">
                Reset Password
              </h1>
              <p className="text-[#8D6E63]/70 text-sm mb-8 text-center">
                Enter your new password below.
              </p>

              {/* Invalid link error */}
              {!token || !email ? (
                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">
                      Invalid Reset Link
                    </p>
                    <p className="text-red-600 text-xs mt-1">
                      This link is invalid or has expired.{" "}
                      <Link
                        to="/forgot-password"
                        className="underline font-medium"
                      >
                        Request a new one
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                      <p className="text-red-600 text-sm text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="w-full space-y-5">
                    {/* New password */}
                    <div className="space-y-2">
                      <label className="text-[#5D4037] font-medium text-sm">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400 pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#5D4037]"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[#8D6E63]/60">
                        Minimum 6 characters
                      </p>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                      <label className="text-[#5D4037] font-medium text-sm">
                        Confirm Password
                      </label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                        required
                      />
                      {/* Live match indicator */}
                      {confirmPassword && (
                        <p
                          className={`text-xs ${
                            newPassword === confirmPassword
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {newPassword === confirmPassword
                            ? "✓ Passwords match"
                            : "✗ Passwords do not match"}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full text-base font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}