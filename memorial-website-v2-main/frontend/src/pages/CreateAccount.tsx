import Navbar from "@/components/Navbar";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import DateInputGroup from "@/components/DateInputGroup";
import UploadBox from "@/components/UploadBox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function CreateAccount() {
  // Local state for form (as per instructions)
  const [formData, setFormData] = useState({});

  const handleNext = () => {
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

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              <InputField 
                label="Departed devotee Name" 
                placeholder="Enter departed devotee name" 
              />
              <SelectField 
                label="Spiritual Title / Honorific" 
                placeholder="Choose the title" 
                options={["His Grace", "Her Grace", "His Holiness"]}
              />
              <InputField 
                label="Associated Temple" 
                placeholder="Connected temple" 
              />
              <SelectField 
                label="Ashram / Role" 
                placeholder="Choose the role" 
                options={["Brahmachari", "Grihastha", "Vanaprastha", "Sannyasi"]}
              />
              <SelectField 
                label="Core Services" 
                placeholder="Choose Core service" 
                options={["Pujari", "Cooking", "Management", "Preaching", "Book Distribution"]}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <InputField 
                label="Initiating Guru" 
                placeholder="Initiated name" 
              />
              <DateInputGroup label="Life Span" />
              <InputField 
                label="Location/City" 
                placeholder="Location/city" 
              />
              <UploadBox />
              <SelectField 
                label="Account Type" 
                placeholder="Choose the type of" 
                options={["Memorial", "Tribute"]}
              />
            </div>

            {/* Full Width - About */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[#5D4037] font-medium text-sm">About the departed devotee</label>
              <Textarea 
                placeholder="Details" 
                className="min-h-[120px] rounded-xl border-gray-200 bg-white text-[#5D4037] placeholder:text-gray-400 focus-visible:ring-[#8D6E63] shadow-none resize-none p-4"
              />
            </div>

          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-12">
            <Button 
              onClick={handleNext}
              className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-12 text-base font-medium flex items-center gap-2 shadow-none"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
