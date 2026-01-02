import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscipleHeader from "@/components/DiscipleHeader";
import DiscipleInfo from "@/components/DiscipleInfo";
import DiscipleAbout from "@/components/DiscipleAbout";
import FilterBar from "@/components/FilterBar";
import { useParams, useLocation } from "react-router";

// Mock Data
const MOCK_DISCIPLES: Record<string, { name: string; image: string; ageRange: string; services: string }> = {
  "1": {
    name: "HH Gopal Krishna Goswami",
    image: "https://i.pravatar.cc/300?img=12",
    ageRange: "1944 - 2024",
    services: "GBC, Trustee, Initiating Guru"
  },
  "default": {
    name: "Disciple Name",
    image: "https://i.pravatar.cc/300?img=12",
    ageRange: "1950 - 2020",
    services: "Kirtan, Book Distribution"
  }
};

export default function DiscipleDetail() {
  const { id } = useParams();
  const location = useLocation();
  
  // Use state passed from card if available, otherwise fallback to mock lookup
  const stateData = location.state as { image?: string; name?: string; years?: string } | null;
  
  const mockData = MOCK_DISCIPLES[id || "default"] || MOCK_DISCIPLES["default"];
  
  const disciple = {
    name: stateData?.name || mockData.name,
    image: stateData?.image || mockData.image,
    ageRange: stateData?.years || mockData.ageRange,
    services: mockData.services // Services not passed in card, keep mock
  };

  return (
    <div className="min-h-screen bg-[#FFF1DF] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1280px] mx-auto">
        <DiscipleHeader image={disciple.image} />
        <DiscipleInfo 
          name={disciple.name} 
          ageRange={disciple.ageRange} 
          services={disciple.services} 
        />
        <DiscipleAbout />
        <FilterBar />
        
        {/* Empty section below filters as requested */}
        <div className="min-h-[200px]"></div>
      </main>

      <Footer />
    </div>
  );
}