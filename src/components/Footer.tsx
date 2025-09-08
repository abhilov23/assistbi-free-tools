import { Link } from "react-router-dom";
import { Wrench, Heart, Shield } from "lucide-react";

const Footer = () => {
  const toolLinks = [
    { name: "PDF Converter", href: "/tools/pdf-converter" },
    { name: "PDF Exporter", href: "/tools/pdf-exporter" },
    { name: "Invoice Generator", href: "/tools/invoice-generator" },
    { name: "QR Generator", href: "/tools/qr-generator" },
    { name: "URL Shortener", href: "/tools/url-shortener" },
    { name: "Document Summarizer", href: "/tools/document-summarizer" },
    { name: "Grammar Checker", href: "/tools/grammar-checker" },
    { name: "Invoice OCR", href: "/tools/invoice-ocr" },
  ];

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-soft">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">AssistBi</span>
                <span className="text-sm text-muted-foreground ml-1">Tools</span>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Free productivity tools to help you convert, create, and simplify your workflow. No sign-up required.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Made with care for productivity</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Tools</h3>
            <ul className="space-y-3">
              {toolLinks.slice(0, 4).map((tool) => (
                <li key={tool.name}>
                  <Link
                    to={tool.href}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Tools */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">More Tools</h3>
            <ul className="space-y-3">
              {toolLinks.slice(4, 8).map((tool) => (
                <li key={tool.name}>
                  <Link
                    to={tool.href}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 AssistBi Tools. All rights reserved.</span>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Your data stays private</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <span>Powered by </span>
            <span className="text-primary font-medium">AssistBi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;