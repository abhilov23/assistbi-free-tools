import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ToolsGrid from "@/components/ToolsGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip Navigation for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Main content">
        <HeroSection />
        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="sr-only">Available Tools</h2>
          <ToolsGrid />
        </section>
        <section aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="sr-only">How It Works</h2>
          <HowItWorks />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
