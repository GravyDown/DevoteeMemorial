import Navbar from "@/components/Navbar";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import DateInputGroup from "@/components/DateInputGroup";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    // STEP 1 — Devotee details
    name: "",
    honorific: "",
    associatedTemple: "",
    ashramRole: "",
    coreServices: [] as string[],
    spiritualMaster: "",
    birthDate: "",
    deathDate: "",
    location: "",
    about: "",
    accountType: "Memorial",

    // STEP 2 — Contributor details
    contributorName: "",
    contributorEmail: "",
    contributorPhone: "",
    contributorLocation: "", // ← separate from devotee location
    relation: "",
    initiatedName: "",
    initiatedGuru: "",
    temple: "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // 🔥 ADD THIS STATE
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // ── Auth guard ───────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated]);

  // ── Auto-fill Step 2 when user reaches Step 2 ───────────
  // Runs every time step changes to 2
  // Only fills fields that are still empty — never overwrites user edits
  useEffect(() => {
    if (step !== 2 || !user) return;

    setFormData((prev) => ({
      ...prev,
      contributorName: prev.contributorName || user.username || "",
      contributorEmail: prev.contributorEmail || user.email || "",
      contributorPhone: prev.contributorPhone || user.phone || "",
      temple: prev.temple || user.temple || "",
      contributorLocation: prev.contributorLocation || user.location || "",
    }));
  }, [step, user]);

  // ── Field change handler ─────────────────────────────────
  const handleChange = (key: string, value: any) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ── Validation ───────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Devotee name is required";

    if (!formData.spiritualMaster.trim())
      newErrors.spiritualMaster = "Initiating Guru is required";

    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (!formData.about.trim())
      newErrors.about = "A short description is required";
    else if (formData.about.trim().length < 20)
      newErrors.about = "Description must be at least 20 characters";

    if (!formData.birthDate) newErrors.birthDate = "Birth date is required";

    if (!formData.deathDate) newErrors.deathDate = "Death date is required";

    if (formData.birthDate && formData.deathDate) {
      const birth = new Date(formData.birthDate);
      const death = new Date(formData.deathDate);
      if (death <= birth)
        newErrors.deathDate = "Death date must be after birth date";
    }

    if (!coverFile) newErrors.coverImage = "Profile photo is required";
    if (!bannerFile) newErrors.bannerImage = "Banner image is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields before continuing.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.contributorName.trim())
      newErrors.contributorName = "Your name is required";
    if (!formData.contributorPhone.trim())
      newErrors.contributorPhone = "Contact number is required";
    if (!formData.relation.trim()) newErrors.relation = "Relation is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please complete all required fields before submitting.");
      return false;
    }
    return true;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const payload = new FormData();
      // Step 1 data
      payload.append("name", formData.name);
      payload.append("honorific", formData.honorific);
      payload.append("associatedTemple", formData.associatedTemple);
      payload.append("ashramRole", formData.ashramRole);
      payload.append("spiritualMaster", formData.spiritualMaster);
      payload.append("location", formData.location);
      payload.append("description", formData.about);
      payload.append("accountType", formData.accountType);
      payload.append("birthDate", formData.birthDate);
      payload.append("deathDate", formData.deathDate);
      payload.append("coreServices", JSON.stringify(formData.coreServices));
      // Step 2 data
      payload.append("contributorName", formData.contributorName);
      payload.append("contributorEmail", formData.contributorEmail);
      payload.append("contributorPhone", formData.contributorPhone);
      payload.append("contributorLocation", formData.contributorLocation);
      payload.append("relation", formData.relation);
      payload.append("initiatedName", formData.initiatedName);
      payload.append("initiatedGuru", formData.initiatedGuru);
      payload.append("temple", formData.temple);
      if (coverFile) payload.append("coverImage", coverFile);
      // ADD after coverImage append:
      if (bannerFile) payload.append("bannerImage", bannerFile);

      await api.post("/profiles", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Memorial created successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          "Failed to create profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Auth loading screen ──────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#5D4037] text-sm">Verifying session...</p>
        </main>
      </div>
    );
  }

  // ── UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-[1040px] bg-white rounded-[32px] p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#5D4037]">
              Create Account
            </h1>
            <p className="text-sm text-gray-500">
              {step === 1 ? "Devotee Details" : "Your Details"}
            </p>
            {/* Step indicator */}
            <div className="flex justify-center gap-2 mt-3">
              <div
                className={`w-2 h-2 rounded-full ${step === 1 ? "bg-[#804B23]" : "bg-gray-300"}`}
              />
              <div
                className={`w-2 h-2 rounded-full ${step === 2 ? "bg-[#804B23]" : "bg-gray-300"}`}
              />
            </div>
          </div>

          {/* ── STEP 1 — Devotee Details ── */}
          {step === 1 && (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                {/* ── Left Column ── */}
                <div className="space-y-6">
                  {/* Devotee Name */}
                  <div>
                    <InputField
                      label="Departed Devotee Name *"
                      placeholder="Enter departed devotee name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    {errors.name ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.name}
                      </p>
                    ) : (
                      <p className="text-[#8D6E63]/50 text-xs mt-1">
                        Enter the full spiritual name of the devotee
                      </p>
                    )}
                  </div>

                  {/* Honorific */}
                  <div>
                    <SelectField
                      label="Spiritual Title / Honorific"
                      placeholder="Choose the title"
                      options={[
                        { label: "His Grace", value: "His Grace" },
                        { label: "Her Grace", value: "Her Grace" },
                        { label: "His Holiness", value: "His Holiness" },
                        { label: "Prabhu", value: "Prabhu" },
                        { label: "Mataji", value: "Mataji" },
                      ]}
                      value={formData.honorific}
                      onChange={(val) => handleChange("honorific", val)}
                    />
                    <p className="text-[#8D6E63]/50 text-xs mt-1">Optional</p>
                  </div>

                  {/* Associated Temple */}
                  <div>
                    <InputField
                      label="Associated Temple"
                      placeholder="Connected temple"
                      value={formData.associatedTemple}
                      onChange={(e) =>
                        handleChange("associatedTemple", e.target.value)
                      }
                    />
                    <p className="text-[#8D6E63]/50 text-xs mt-1">Optional</p>
                  </div>

                  {/* Ashram Role */}
                  <div>
                    <SelectField
                      label="Ashram / Role"
                      placeholder="Choose the role"
                      options={[
                        { label: "Brahmachari", value: "Brahmachari" },
                        { label: "Grihastha", value: "Grihastha" },
                        { label: "Vanaprastha", value: "Vanaprastha" },
                        { label: "Sannyasi", value: "Sannyasi" },
                      ]}
                      value={formData.ashramRole}
                      onChange={(val) => handleChange("ashramRole", val)}
                    />
                    <p className="text-[#8D6E63]/50 text-xs mt-1">Optional</p>
                  </div>

                  {/* Core Services */}
                  <div>
                    <SelectField
                      label="Core Services"
                      placeholder="Choose Core service"
                      options={[
                        { label: "Pujari", value: "pujari" },
                        { label: "Cooking", value: "cooking" },
                        { label: "Management", value: "management" },
                        { label: "Preaching", value: "preaching" },
                        {
                          label: "Book Distribution",
                          value: "book_distribution",
                        },
                      ]}
                      value={formData.coreServices[0] || ""}
                      onChange={(val) => handleChange("coreServices", [val])}
                    />
                    <p className="text-[#8D6E63]/50 text-xs mt-1">Optional</p>
                  </div>

                  {/* About */}
                  <div>
                    <label className="text-sm font-medium text-[#5D4037]">
                      About the Departed Devotee *
                    </label>
                    <Textarea
                      placeholder="Write a short description about the devotee's life and service... (minimum 20 characters)"
                      value={formData.about}
                      onChange={(e) => handleChange("about", e.target.value)}
                      className={`mt-2 min-h-[120px] rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400 resize-none p-4 ${
                        errors.about
                          ? "border-red-400 focus-visible:ring-red-300"
                          : ""
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.about ? (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <span>⚠</span> {errors.about}
                        </p>
                      ) : (
                        <p className="text-[#8D6E63]/50 text-xs">
                          Minimum 20 characters
                        </p>
                      )}
                      <p
                        className={`text-xs ${
                          formData.about.length < 20
                            ? "text-[#8D6E63]/50"
                            : "text-green-600"
                        }`}
                      >
                        {formData.about.length} chars
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Right Column ── */}
                <div className="space-y-6">
                  {/* Initiating Guru */}
                  <div>
                    <InputField
                      label="Initiating Guru *"
                      placeholder="Guru's initiated name"
                      value={formData.spiritualMaster}
                      onChange={(e) =>
                        handleChange("spiritualMaster", e.target.value)
                      }
                    />
                    {errors.spiritualMaster ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.spiritualMaster}
                      </p>
                    ) : (
                      <p className="text-[#8D6E63]/50 text-xs mt-1">
                        The spiritual master who initiated the devotee
                      </p>
                    )}
                  </div>

                  {/* Life Span */}
                  <div>
                    <DateInputGroup
                      label="Life Span *"
                      birthDate={formData.birthDate}
                      deathDate={formData.deathDate}
                      onBirthDateChange={(val) =>
                        handleChange("birthDate", val)
                      }
                      onDeathDateChange={(val) =>
                        handleChange("deathDate", val)
                      }
                    />
                    <div className="mt-1 space-y-0.5">
                      {errors.birthDate && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <span>⚠</span> {errors.birthDate}
                        </p>
                      )}
                      {errors.deathDate && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <span>⚠</span> {errors.deathDate}
                        </p>
                      )}
                      {!errors.birthDate && !errors.deathDate && (
                        <p className="text-[#8D6E63]/50 text-xs">
                          Both birth and death dates are required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <InputField
                      label="Location / City *"
                      placeholder="City where devotee served"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                    {errors.location ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.location}
                      </p>
                    ) : (
                      <p className="text-[#8D6E63]/50 text-xs mt-1">
                        City or temple location where they primarily served
                      </p>
                    )}
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="text-sm font-medium text-[#5D4037]">
                      Profile Photo *
                    </label>
                    <div
                      className={`border-dashed border-2 p-6 rounded-xl text-center mt-2 transition-colors ${
                        errors.coverImage
                          ? "border-red-400 bg-red-50/30"
                          : coverFile
                            ? "border-green-400 bg-green-50/30"
                            : "border-gray-300 hover:border-[#8D6E63]"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCoverFile(file);
                          if (file && errors.coverImage) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.coverImage;
                              return next;
                            });
                          }
                        }}
                        className="w-full text-sm text-gray-500"
                      />
                      {coverFile ? (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ {coverFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-[#8D6E63]/50 mt-2">
                          PNG, JPG up to 10MB
                        </p>
                      )}
                    </div>
                    {errors.coverImage ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.coverImage}
                      </p>
                    ) : (
                      <p className="text-[#8D6E63]/50 text-xs mt-1">
                        A clear photo of the devotee is required
                      </p>
                    )}
                  </div>

                  {/* Banner Image Upload */}
                  <div>
                    <label className="text-sm font-medium text-[#5D4037]">
                      Cover Banner Image *
                    </label>
                    <p className="text-[#8D6E63]/50 text-xs mb-2">
                      This will appear as the wide banner on the profile page.
                      Best size: 1280×300px landscape photo.
                    </p>

                    {/* Preview */}
                    {bannerPreview && (
                      <div className="w-full h-24 rounded-xl overflow-hidden mb-2 border border-gray-200">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`border-dashed border-2 p-5 rounded-xl text-center transition-colors ${
                        errors.bannerImage
                          ? "border-red-400 bg-red-50/30"
                          : bannerFile
                            ? "border-green-400 bg-green-50/30"
                            : "border-gray-300 hover:border-[#8D6E63]"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setBannerFile(file);
                          if (file) {
                            // Show preview
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              setBannerPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                            // Clear error
                            if (errors.bannerImage) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.bannerImage;
                                return next;
                              });
                            }
                          } else {
                            setBannerPreview("");
                          }
                        }}
                        className="w-full text-sm text-gray-500"
                      />
                      {bannerFile ? (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ {bannerFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-[#8D6E63]/50 mt-2">
                          PNG, JPG — landscape photo recommended
                        </p>
                      )}
                    </div>

                    {errors.bannerImage ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.bannerImage}
                      </p>
                    ) : (
                      <p className="text-[#8D6E63]/50 text-xs mt-1">
                        A wide landscape photo looks best
                      </p>
                    )}
                  </div>

                  {/* Account Type */}
                  <div>
                    <SelectField
                      label="Account Type *"
                      placeholder="Choose the type"
                      options={[{ label: "Memorial", value: "Memorial" }]}
                      value={formData.accountType}
                      onChange={(val) => handleChange("accountType", val)}
                    />
                    <p className="text-[#8D6E63]/50 text-xs mt-1">
                      Memorial — for departed devotees
                    </p>
                  </div>
                </div>
              </div>

              {/* Required fields note */}
              <p className="text-xs text-[#8D6E63]/60 mt-8">
                Fields marked with{" "}
                <span className="text-red-500 font-bold">*</span> are required
              </p>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-12"
                >
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 2 — Contributor Details ── */}
          {step === 2 && (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Full Name — auto-filled from user.username */}
                <div>
                  <InputField
                    label="Full Name *"
                    placeholder="Enter name"
                    value={formData.contributorName}
                    onChange={(e) =>
                      handleChange("contributorName", e.target.value)
                    }
                  />
                  {errors.contributorName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contributorName}
                    </p>
                  )}
                </div>

                <InputField
                  label="Initiated Name (Optional)"
                  placeholder="Initiated name"
                  value={formData.initiatedName}
                  onChange={(e) =>
                    handleChange("initiatedName", e.target.value)
                  }
                />

                {/* Email — auto-filled + read only */}
                <InputField
                  label="Email ID"
                  placeholder="Enter email"
                  value={formData.contributorEmail}
                  disabled
                />

                <InputField
                  label="Initiated Guru Name (Optional)"
                  placeholder="Initiated guru name"
                  value={formData.initiatedGuru}
                  onChange={(e) =>
                    handleChange("initiatedGuru", e.target.value)
                  }
                />

                <InputField
                  label="Connected Temple"
                  placeholder="Connected temple"
                  value={formData.temple}
                  onChange={(e) => handleChange("temple", e.target.value)}
                />

                {/* contributorLocation — separate from devotee location */}
                <InputField
                  label="Location / City"
                  placeholder="Location/city"
                  value={formData.contributorLocation}
                  onChange={(e) =>
                    handleChange("contributorLocation", e.target.value)
                  }
                />

                <div>
                  <InputField
                    label="Contact Number *"
                    placeholder="Enter contact number"
                    value={formData.contributorPhone}
                    onChange={(e) =>
                      handleChange("contributorPhone", e.target.value)
                    }
                  />
                  {errors.contributorPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contributorPhone}
                    </p>
                  )}
                </div>

                <SelectField
                  label="Account Type"
                  placeholder="Choose the type"
                  options={[
                    { label: "Memorial", value: "Memorial" },
                    { label: "Tribute", value: "Tribute" },
                  ]}
                  value={formData.accountType}
                  onChange={(val) => handleChange("accountType", val)}
                />

                <div>
                  <InputField
                    label="Relation with the Departed Devotee *"
                    placeholder="Enter relation"
                    value={formData.relation}
                    onChange={(e) => handleChange("relation", e.target.value)}
                  />
                  {errors.relation && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.relation}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setErrors({});
                    setStep(1);
                  }}
                  disabled={loading}
                  className="rounded-full px-8 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-12"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>Submitting...
                    </>
                  ) : (
                    <>
                      Submit <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
