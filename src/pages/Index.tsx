import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ToolsGrid from "@/components/ToolsGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ToolsGrid />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
