import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MemorialBoard from "@/components/MemorialBoard";
import WisdomSection from "@/components/WisdomSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-[#FFF0DD]">
      <Navbar />
      <main className="w-full">
        <Hero />
        <MemorialBoard />
        <WisdomSection />
      </main>
      <Footer />
    </div>
  );
}