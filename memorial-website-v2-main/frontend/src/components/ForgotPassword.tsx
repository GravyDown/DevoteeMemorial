import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

type Step = "verify" | "reset" | "done";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step tracking
  const [step, setStep] = useState<Step>("verify");

  // Step 1 fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Shared state
  const [verifyToken, setVerifyToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Step 1: Verify email + phone ── */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }

    setLoading(true);
    try {
      const res = await api.post("/users/verify-identity", { email, phone });
      setVerifyToken(res.data.verifyToken);
      setStep("reset");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "No account found with this email and phone combination."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Set new password ── */
  const handleReset = async (e: React.FormEvent) => {
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
      await api.post("/users/reset-password", { verifyToken, newPassword });
      setStep("done");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Reset failed. Please start over."
      );
      // If verifyToken expired, send back to step 1
      if (err?.response?.status === 400) {
        setVerifyToken("");
        setStep("verify");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-sm p-10 flex flex-col items-center">

          {/* ── Step indicator (only shown during steps 1 & 2) ── */}
          {step !== "done" && (
            <div className="flex items-center gap-2 mb-8 self-start">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "verify" ? "bg-[#804B23] text-white" : "bg-green-500 text-white"}`}>
                {step === "reset" ? "✓" : "1"}
              </div>
              <div className="w-10 h-0.5 bg-gray-200">
                <div className={`h-full bg-[#804B23] transition-all ${step === "reset" ? "w-full" : "w-0"}`} />
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "reset" ? "bg-[#804B23] text-white" : "bg-gray-200 text-gray-400"}`}>
                2
              </div>
              <span className="text-xs text-[#8D6E63] ml-1">
                {step === "verify" ? "Verify identity" : "Set new password"}
              </span>
            </div>
          )}

          {/* ════ STEP 1: Verify email + phone ════ */}
          {step === "verify" && (
            <>
              <h1 className="text-[#5D4037] font-bold text-2xl mb-2 self-start">
                Forgot Password?
              </h1>
              <p className="text-[#8D6E63]/70 text-sm mb-7 self-start leading-relaxed">
                Enter the email and phone number registered with your account.
              </p>

              {error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="w-full space-y-5">
                <div className="space-y-2">
                  <label className="text-[#5D4037] font-medium text-sm">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#5D4037] font-medium text-sm">
                    Registered Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your registered phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400"
                    required
                  />
                  <p className="text-xs text-[#8D6E63]/60">
                    Must match the phone number used during registration
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full text-base font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <Link
                to="/auth"
                className="mt-6 text-[#8D6E63] text-sm hover:text-[#5D4037] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}

          {/* ════ STEP 2: Set new password ════ */}
          {step === "reset" && (
            <>
              <h1 className="text-[#5D4037] font-bold text-2xl mb-2 self-start">
                Set New Password
              </h1>
              <p className="text-[#8D6E63]/70 text-sm mb-7 self-start">
                Identity verified for{" "}
                <span className="font-medium text-[#5D4037]">{email}</span>
              </p>

              {error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleReset} className="w-full space-y-5">
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#8D6E63]/60">Minimum 6 characters</p>
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
                  {confirmPassword && (
                    <p className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                      {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full text-base font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Reset Password"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <button
                onClick={() => { setStep("verify"); setError(""); }}
                className="mt-6 text-[#8D6E63] text-sm hover:text-[#5D4037] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </>
          )}

          {/* ════ DONE ════ */}
          {step === "done" && (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-[#5D4037] font-bold text-2xl mb-2">
                Password Updated!
              </h2>
              <p className="text-[#8D6E63]/70 text-sm mb-6 leading-relaxed">
                Your password has been reset successfully.
                You can now log in with your new password.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-11"
              >
                Go to Login →
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}