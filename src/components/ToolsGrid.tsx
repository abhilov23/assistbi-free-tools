import ToolCard from "./ToolCard";
import { 
  FileText, 
  Download, 
  Receipt, 
  QrCode, 
  Link, 
  CreditCard, 
  CheckCircle, 
  User,
  Scissors
} from "lucide-react";

const toolsData = [
  {
    title: "PDF to Word/Excel Converter",
    description: "Convert PDF files to editable Word documents or Excel spreadsheets instantly.",
    icon: FileText,
    href: "/tools/pdf-converter",
    color: "primary",
  },
  {
    title: "Word/Excel to PDF Exporter",
    description: "Export your Word documents and Excel files to professional PDF format.",
    icon: Download,
    href: "/tools/pdf-exporter",
    color: "secondary",
  },
  {
    title: "Invoice Generator",
    description: "Create professional invoices with custom branding and automatic calculations.",
    icon: Receipt,
    href: "/tools/invoice-generator",
    color: "accent",
  },
  {
    title: "QR Code Generator",
    description: "Generate custom QR codes for URLs, text, contact info, and more.",
    icon: QrCode,
    href: "/tools/qr-generator",
    color: "success",
  },
  {
    title: "URL Shortener",
    description: "Shorten long URLs and track clicks with detailed analytics.",
    icon: Link,
    href: "/tools/url-shortener",
    color: "warning",
  },
  {
    title: "Business Card Creator",
    description: "Design professional business cards with customizable templates.",
    icon: CreditCard,
    href: "/tools/business-card-creator",
    color: "primary",
  },
  {
    title: "Grammar & Style Checker",
    description: "Improve your writing with advanced grammar and style suggestions.",
    icon: CheckCircle,
    href: "/tools/grammar-checker",
    color: "secondary",
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with customizable templates and download as PDF.",
    icon: User,
    href: "/tools/resume-builder",
    color: "accent",
  },
  {
    title: "Image Background Remover",
    description: "Remove image backgrounds instantly using advanced AI. Perfect for product photos.",
    icon: Scissors,
    href: "/tools/image-background-remover",
    color: "success",
  },
];

const ToolsGrid = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            Featured Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-stagger-1">
            Access our complete suite of productivity tools. All free, all powerful, all ready to use.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolsData.map((tool, index) => (
            <ToolCard
              key={tool.title}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
              color={tool.color}
              delay={index * 100}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Looking for more tools? We're constantly adding new features.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;