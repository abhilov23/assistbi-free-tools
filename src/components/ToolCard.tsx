import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  delay?: number;
}

const ToolCard = ({ title, description, icon: Icon, href, color = "primary", delay = 0 }: ToolCardProps) => {
  const colorClasses = {
    primary: "from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40",
    secondary: "from-secondary/10 to-secondary/5 border-secondary/20 hover:border-secondary/40",
    accent: "from-accent/10 to-accent/5 border-accent/20 hover:border-accent/40",
    success: "from-success/10 to-success/5 border-success/20 hover:border-success/40",
    warning: "from-warning/10 to-warning/5 border-warning/20 hover:border-warning/40",
  };

  const iconColorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <div 
      className={`group relative bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border-2 rounded-xl p-6 transition-smooth hover:shadow-large hover:-translate-y-2 animate-scale-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-smooth" />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${iconColorClasses[color as keyof typeof iconColorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <Link to={href}>
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-smooth">
            Use Now
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ToolCard;