import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Simulate submission — wire to backend later
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 md:px-16 py-16 w-full">

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-script text-[48px] md:text-[56px] text-[#8D6E63]">
            Get in Touch
          </h1>
          <p className="text-[#8D6E63]/70 text-sm mt-1">
            Have a question, suggestion, or want to report an issue? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Contact info */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                label: "Email",
                value: "contact@iskconmemorial.org",
              },
              {
                icon: Phone,
                label: "Phone",
                value: "+91 98765 43210",
              },
              {
                icon: MapPin,
                label: "Address",
                value: "ISKCON Temple, Juhu, Mumbai - 400049, India",
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 border border-[#8D6E63]/10 shadow-sm flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF1DF] flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#804B23]" />
                </div>
                <div>
                  <p className="text-xs text-[#8D6E63] font-medium mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-[#5D4037] text-sm font-medium">
                    {item.value}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Note */}
            <div className="bg-[#FFF8E7] rounded-2xl p-6 border border-[#8D6E63]/10">
              <p className="text-xs text-[#8D6E63] leading-relaxed">
                🙏 This is a volunteer-run seva. We try to respond within 2–3
                business days. Thank you for your patience and understanding.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 border border-[#8D6E63]/10 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-[#5D4037] mb-2">
                  Message Sent!
                </h3>
                <p className="text-[#8D6E63] text-sm max-w-xs">
                  Thank you for reaching out. We'll get back to you within 2–3
                  business days. Hare Krishna! 🙏
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  variant="outline"
                  className="mt-6 rounded-full border-[#8D6E63]/30 text-[#5D4037]"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-8 md:p-10 border border-[#8D6E63]/10 shadow-sm space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#5D4037]">
                      Full Name *
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="h-11 rounded-xl border-gray-200 bg-[#FAFAFA] text-[#5D4037]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#5D4037]">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="h-11 rounded-xl border-gray-200 bg-[#FAFAFA] text-[#5D4037]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#5D4037]">
                    Subject
                  </label>
                  <Input
                    placeholder="What is this regarding?"
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-[#FAFAFA] text-[#5D4037]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#5D4037]">
                    Message *
                  </label>
                  <Textarea
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="min-h-[140px] rounded-xl border-gray-200 bg-[#FAFAFA] text-[#5D4037] resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-11 flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}