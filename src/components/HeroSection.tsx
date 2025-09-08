import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary-light))_0%,transparent_50%)] opacity-20" />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 mb-8 shadow-soft animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Free Tools • No Sign-Up Required
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            Free Productivity Tools
            <span className="block text-primary">by AssistBi</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 animate-slide-up animate-stagger-1 leading-relaxed">
            Convert. Summarize. Create.{" "}
            <span className="text-foreground font-semibold">
              No Sign-Up Required!
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animate-stagger-2">
            <Button
              size="lg"
              className="btn-hero text-lg px-8 py-4 shadow-glow hover:shadow-large group"
            >
              Start Using Free Tools
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 btn-ghost"
            >
              Browse All Tools
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-muted-foreground animate-fade-in animate-stagger-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">8+</div>
              <div className="text-sm">Free Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm">Free Forever</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">0</div>
              <div className="text-sm">Sign-Up Required</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;