import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditCard, Download, Palette, User, Mail, Phone, Globe, MapPin, Linkedin } from "lucide-react";
import html2canvas from "html2canvas";

const BusinessCardCreator = () => {
  const [cardData, setCardData] = useState({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    linkedin: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        width: 400,
        height: 240,
      });
      
      const link = document.createElement('a');
      link.download = `business-card-${cardData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error generating business card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const templates = [
    { 
      id: "modern", 
      name: "Modern", 
      color: "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
      textColor: "text-white",
      pattern: "geometric"
    },
    { 
      id: "classic", 
      name: "Classic", 
      color: "bg-gradient-to-br from-slate-800 to-slate-900",
      textColor: "text-white",
      pattern: "elegant"
    },
    { 
      id: "creative", 
      name: "Creative", 
      color: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
      textColor: "text-white",
      pattern: "artistic"
    },
    { 
      id: "minimal", 
      name: "Minimal", 
      color: "bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300",
      textColor: "text-gray-800",
      pattern: "clean"
    },
    { 
      id: "neon", 
      name: "Neon", 
      color: "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600",
      textColor: "text-white",
      pattern: "futuristic"
    },
    { 
      id: "luxury", 
      name: "Luxury", 
      color: "bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800",
      textColor: "text-white",
      pattern: "premium"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-medium">Business Card Creator</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Professional Business Card Creator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design stunning business cards with professional templates. 
            Perfect for networking and making lasting impressions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Business Card Information
              </CardTitle>
              <CardDescription>
                Fill in your details to create your business card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="Marketing Manager"
                    value={cardData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="Acme Corporation"
                  value={cardData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@acme.com"
                    value={cardData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={cardData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="www.acme.com"
                  value={cardData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Business St, City, State 12345"
                  value={cardData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={cardData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Choose Template
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-full h-8 rounded ${template.color} mb-2 relative overflow-hidden`}>
                        {/* Add pattern overlay based on template */}
                        {template.pattern === 'geometric' && (
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-4 h-4 bg-white transform rotate-45" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                        {template.pattern === 'artistic' && (
                          <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Business Card Preview
              </CardTitle>
              <CardDescription>
                Preview your business card design
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cardData.name && cardData.title && cardData.company ? (
                <div className="space-y-6">
                  {/* Business Card Preview */}
                  <div className="bg-muted/50 p-8 rounded-lg">
                    <div 
                      ref={cardRef}
                      className={`w-full h-48 rounded-lg p-6 ${
                        templates.find(t => t.id === selectedTemplate)?.color
                      } ${
                        templates.find(t => t.id === selectedTemplate)?.textColor
                      } relative overflow-hidden shadow-xl`}
                    >
                      {/* Background Patterns */}
                      {selectedTemplate === 'modern' && (
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white transform rotate-45" />
                          <div className="absolute bottom-4 left-4 w-6 h-6 bg-white rounded-full opacity-30" />
                          <div className="absolute top-1/2 right-8 w-1 h-12 bg-white opacity-40 transform -rotate-12" />
                        </div>
                      )}
                      {selectedTemplate === 'classic' && (
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent" />
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent" />
                        </div>
                      )}
                      {selectedTemplate === 'creative' && (
                        <div className="absolute inset-0 opacity-25">
                          <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full" />
                          <div className="absolute top-8 right-8 w-2 h-2 bg-white" />
                          <div className="absolute bottom-6 right-6 w-3 h-3 bg-white transform rotate-45" />
                          <div className="absolute bottom-2 left-2 w-6 h-1 bg-white opacity-60" />
                        </div>
                      )}
                      {selectedTemplate === 'neon' && (
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/20 to-transparent" />
                          <div className="absolute top-4 right-4 w-1 h-8 bg-white opacity-60 animate-pulse" />
                          <div className="absolute bottom-4 left-4 w-8 h-1 bg-white opacity-60 animate-pulse" />
                        </div>
                      )}
                      {selectedTemplate === 'luxury' && (
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-2 left-2 w-8 h-8 border border-white opacity-40" />
                          <div className="absolute bottom-2 right-2 w-6 h-6 border border-white opacity-40 transform rotate-45" />
                        </div>
                      )}

                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1 leading-tight">{cardData.name}</h3>
                          <p className="text-sm opacity-90 mb-2">{cardData.title}</p>
                          <p className="text-lg font-semibold">{cardData.company}</p>
                        </div>
                        
                        <div className="space-y-1">
                          {cardData.email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="h-3 w-3" />
                              <span>{cardData.email}</span>
                            </div>
                          )}
                          {cardData.phone && (
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{cardData.phone}</span>
                            </div>
                          )}
                          {cardData.website && (
                            <div className="flex items-center gap-2 text-xs">
                              <Globe className="h-3 w-3" />
                              <span>{cardData.website}</span>
                            </div>
                          )}
                          {cardData.linkedin && (
                            <div className="flex items-center gap-2 text-xs">
                              <Linkedin className="h-3 w-3" />
                              <span>{cardData.linkedin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Subtle overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20" />
                    </div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? "Generating..." : "Download Business Card"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium">Business Card Preview</p>
                    <p className="text-muted-foreground text-sm">
                      Fill in required fields to see preview
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessCardCreator;