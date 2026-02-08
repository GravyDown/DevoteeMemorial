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
  const [formData, setFormData] = useState<any>({
    name: "",
    honorific: "",
    associatedTemple: "",
    ashramRole: "",
    coreServices: [], // array of strings
    spiritualMaster: "",
    birthDate: "", // yyyy-MM-dd
    deathDate: "", // yyyy-MM-dd
    location: "",
    about: "",
    accountType: "Memorial",
    contributorName: "",
    contributorPhone: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleChange = (key: string, value: any) =>
    setFormData((p: any) => ({ ...p, [key]: value }));

  const handleNext = async () => {
    try{
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("honorific", formData.honorific);
      fd.append("associatedTemple", formData.associatedTemple);
      fd.append("ashramRole", formData.ashramRole);
      fd.append("spiritualMaster", formData.spiritualMaster);
      fd.append("location", formData.location);
      fd.append("description", formData.about || "");
      fd.append("accountType", formData.accountType);
      fd.append("contributorName", formData.contributorName);
      fd.append("contributorPhone", formData.contributorPhone);

      // dates as yyyy-MM-dd strings
      fd.append("birthDate", formData.birthDate);
      fd.append("deathDate", formData.deathDate);

      // arrays - stringify so backend can parse
      fd.append("coreServices", JSON.stringify(formData.coreServices || []));

      // file - ensure the backend multer field name is 'coverImage'
      if (coverFile) fd.append("coverImage", coverFile);

      const res = await fetch("/api/profiles", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();
      if (res.ok) {
        console.log("Profile created", result);
        // navigate to next page / show success
      } else {
        console.error("Create failed", result);
      }
    } catch (error) {
      console.error("Error during profile creation", error);
    }

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
                options={[
                  {label: "His Grace", value: "His Grace"}, 
                  {label: "Her Grace", value: "Her Grace"}, 
                  {label: "His Holiness", value: "His Holiness"}
                ]}
                
              />
              <InputField 
                label="Associated Temple" 
                placeholder="Connected temple" 
              />
              <SelectField 
                label="Ashram / Role" 
                placeholder="Choose the role" 
                options={[
                  {label: "Brahmachari", value: "Brahmachari"}, 
                  {label: "Grihastha", value: "Grihastha"}, 
                  {label: "Vanaprastha", value: "Vanaprastha"}, 
                  {label: "Sannyasi", value: "Sannyasi"}
                ]}
                
              />
              <SelectField 
                label="Core Services" 
                placeholder="Choose Core service" 
                options={[{ label: "Pujari", value: "pujari" },
    { label: "Cooking", value: "cooking" },
    { label: "Management", value: "management" },
    { label: "Preaching", value: "preaching" },
    { label: "BookDistribution", value: "book_distribution" }]}
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
              {/* <UploadBox /> */}
              <SelectField 
                label="Account Type" 
                placeholder="Choose the type of" 
                options={[
                  {label: "Memorial", value: "Memorial"},
                  {label: "Tribute", value: "Tribute"}]}
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
