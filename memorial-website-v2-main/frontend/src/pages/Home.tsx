import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MemorialBoard from "@/components/MemorialBoard";
import WisdomSection from "@/components/WisdomSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-[#FFF0DD] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero usually needs full width, but inner content should be constrained */}
        <section className="page-container">
          <Hero />
        </section>

        <section className="page-container mt-12">
          <MemorialBoard />
        </section>

        <section className="page-container mt-16">
          <WisdomSection />
        </section>
      </main>

      <Footer />
    </div>
  );
}
