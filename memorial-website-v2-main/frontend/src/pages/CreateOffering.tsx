import Navbar from "@/components/Navbar";
import SelectField from "@/components/SelectField";
import TextAreaField from "@/components/TextAreaField";
import UploadBox from "@/components/UploadBox";
import FormButton from "@/components/FormButton";
import { useState } from "react";

export default function CreateOffering() {
  const [formData, setFormData] = useState({});

  const handleSubmit = () => {
    console.log("Form State:", formData);
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-12">
        
        {/* Main Card */}
        <div className="w-full max-w-[1040px] bg-white rounded-[32px] shadow-sm p-12 md:p-16 flex flex-col">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-[#5D4037] font-bold text-3xl mb-2">Create Account</h1>
            <p className="text-[#8D6E63]/70 text-sm">Profile details</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            
            {/* Select Devotee */}
            <SelectField 
              label="Select the Devotee" 
              placeholder="Choose the devotee" 
              options={["Devotee 1", "Devotee 2", "Devotee 3"]}
            />

            {/* Message */}
            <TextAreaField 
              label="Message / Description" 
              placeholder="Share your Offering" 
            />

            {/* Uploads Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UploadBox 
                label="Upload Media (optional)" 
                instruction="Share Images" 
              />
              <UploadBox 
                label="Upload Audio (optional)" 
                instruction="Share Images" 
              />
            </div>

            {/* Relation */}
            <SelectField 
              label="Relation with the devotee (optional)" 
              placeholder="Choose the role" 
              options={["Disciple", "Well-wisher", "Family", "Other"]}
            />

            {/* Submit Button */}
            <div className="flex justify-start pt-4">
              <FormButton onClick={handleSubmit} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
