import { Upload, Settings, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Choose Your Tool",
    description: "Select from our collection of 8+ productivity tools. Each one is specifically designed for ease of use.",
    color: "primary",
  },
  {
    icon: Settings,
    title: "Upload & Process",
    description: "Upload your files or input your data. Our tools handle the heavy lifting with advanced algorithms.",
    color: "secondary",
  },
  {
    icon: Download,
    title: "Download & Share",
    description: "Get your results instantly. Download files, copy links, or share directly with others.",
    color: "accent",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-stagger-1">
            Get productive in just three simple steps. No accounts, no complex setups, no hassle.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorClasses = {
              primary: "bg-primary text-primary-foreground",
              secondary: "bg-secondary text-secondary-foreground",
              accent: "bg-accent text-accent-foreground",
            };

            return (
              <div key={index} className="text-center group animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                {/* Step Number */}
                <div className="relative mb-8">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${colorClasses[step.color as keyof typeof colorClasses]} flex items-center justify-center shadow-large group-hover:shadow-glow transition-smooth group-hover:scale-110`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold shadow-medium">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-smooth">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-border via-border to-transparent transform translate-x-8" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to boost your productivity?
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl shadow-glow animate-pulse">
            <span className="font-medium">✨ All tools are 100% free forever</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;