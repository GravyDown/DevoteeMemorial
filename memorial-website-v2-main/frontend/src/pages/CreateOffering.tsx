import Navbar from "@/components/Navbar";
import SelectField from "@/components/SelectField";
import TextAreaField from "@/components/TextAreaField";
import UploadBox from "@/components/UploadBox";
import FormButton from "@/components/FormButton";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type DevoteeOption = {
  label: string;
  value: string;
};

export default function CreateOffering() {
  const location = useLocation();

  const [devotees, setDevotees] = useState<DevoteeOption[]>([]);
  const [selectedDevotee, setSelectedDevotee] = useState("");
  const [message, setMessage] = useState("");
  const [relation, setRelation] = useState("");

  // uploads
  const [images, setImages] = useState<File[]>([]);
  const [audios, setAudios] = useState<File[]>([]);
  const [videoLink, setVideoLink] = useState("");

  // progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /* ---------------- Fetch devotees ---------------- */
  useEffect(() => {
    const fetchDevotees = async () => {
      try {
        const res = await fetch(`${API_URL}/profiles`);
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();

        if (data.success) {
          const options = data.profiles.map((p: any) => ({
            label: p.name,
            value: p._id,
          }));
          setDevotees(options);

          if (location.state?.devoteeId) {
            setSelectedDevotee(location.state.devoteeId);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDevotees();
  }, [location.state]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = () => {
    if (!selectedDevotee || !message) {
      alert("Please select a devotee and write a message");
      return;
    }

    const formData = new FormData();
    formData.append("devoteeId", selectedDevotee);
    formData.append("message", message);
    formData.append("relation", relation);

    images.forEach((img) => formData.append("images", img));
    audios.forEach((aud) => formData.append("audios", aud));
    if (videoLink) formData.append("videoLink", videoLink);

    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/offerings`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);

      if (xhr.status >= 200 && xhr.status < 300) {
        alert("Offering submitted successfully 🙏");

        // reset
        setMessage("");
        setRelation("");
        setImages([]);
        setAudios([]);
        setVideoLink("");
        setUploadProgress(0);
      } else {
        alert("Upload failed");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      alert("Network error");
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] flex flex-col">
      <Navbar />

      <main className="flex-1 flex justify-center px-4 py-12">
        <div className="w-full max-w-[1040px] bg-white rounded-[32px] p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#5D4037]">
              Give Offering
            </h1>
            <p className="text-sm text-[#8D6E63]/70">
              Profile details
            </p>
          </div>

          <div className="space-y-8">
            {/* Devotee */}
            <SelectField
              label="Select the Devotee"
              placeholder="Choose the devotee"
              options={devotees}
              value={selectedDevotee}
              onChange={setSelectedDevotee}
            />

            {/* Message */}
            <TextAreaField
              label="Message / Description"
              placeholder="Share your Offering"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* Uploads */}
            <div className="grid md:grid-cols-2 gap-8">
              <UploadBox
                label="Upload Media (optional)"
                instruction="Share Images"
                accept="image/*"
                multiple
                files={images}
                onFilesSelect={(files) =>
                  setImages((prev) => [...prev, ...files])
                }
                onRemove={(index) =>
                  setImages((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />

              <UploadBox
                label="Upload Audio (optional)"
                instruction="Share Audio"
                accept="audio/*"
                multiple
                files={audios}
                onFilesSelect={(files) =>
                  setAudios((prev) => [...prev, ...files])
                }
                onRemove={(index) =>
                  setAudios((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />
            </div>

            {/* Video Link */}
            <div className="flex flex-col gap-2">
              <label className="text-[#5D4037] font-medium text-sm">
                Video Link (optional)
              </label>
              <input
                type="url"
                placeholder="YouTube / Google Drive / Vimeo link"
                className="h-12 rounded-xl border px-4 text-sm"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
            </div>

            {/* Relation */}
            <SelectField
              label="Relation with the devotee (optional)"
              placeholder="Choose the role"
              options={[
                { label: "Disciple", value: "Disciple" },
                { label: "Well-wisher", value: "Well-wisher" },
                { label: "Family", value: "Family" },
                { label: "Other", value: "Other" },
              ]}
              value={relation}
              onChange={setRelation}
            />

            {/* Progress bar */}
            {isUploading && (
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#8D6E63] h-3 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#5D4037] mt-1 text-right">
                  Uploading… {uploadProgress}%
                </p>
              </div>
            )}

            {/* Submit */}
            <FormButton onClick={handleSubmit} />
          </div>
        </div>
      </main>
    </div>
  );
}
