import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Wrench } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-soft group-hover:shadow-glow transition-smooth">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">AssistBi</span>
              <span className="text-sm text-muted-foreground ml-1">Tools</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Home
            </Link>
            <Link
              to="/tools"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              All Tools
            </Link>
            <Link
              to="/support"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Support
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              About
            </Link>
            <Button variant="default" size="sm" className="btn-hero">
              Start Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-smooth font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/tools"
                className="text-foreground hover:text-primary transition-smooth font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                All Tools
              </Link>
              <Link
                to="/support"
                className="text-foreground hover:text-primary transition-smooth font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                to="/about"
                className="text-foreground hover:text-primary transition-smooth font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Button variant="default" size="sm" className="btn-hero w-fit">
                Start Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;