import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditCard, Download, Palette, User, Mail, Phone, Globe, MapPin, Linkedin, Sparkles, Wand2 } from "lucide-react";
import html2canvas from "html2canvas";
import { aiApiManager } from "@/lib/ai-api-manager";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  // Check if Business Card Creator has API key
  const hasApiKey = aiApiManager.hasKey('business-card');
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

  const generateWithAI = async () => {
    if (!hasApiKey) {
      alert("Business Card Creator API key not found. Please add VITE_GEMINI_BUSINESS_CARD_API_KEY to your environment variables.");
      return;
    }

    if (!aiPrompt.trim()) {
      alert("Please describe what type of business card you want to create");
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Create professional business card information based on this description: "${aiPrompt}"

Please provide a JSON response with the following structure:
{
  "name": "Professional full name",
  "title": "Appropriate job title",
  "company": "Company name",
  "email": "professional.email@company.com",
  "phone": "+1 (555) 123-4567",
  "website": "www.company.com",
  "address": "Professional address",
  "linkedin": "linkedin.com/in/profile"
}

Make it realistic and professional. Generate appropriate contact information that fits the business description.`;

      const aiText = await aiApiManager.makeRequest('business-card', prompt);
      
      // Extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        setCardData({
          name: aiData.name || "",
          title: aiData.title || "",
          company: aiData.company || "",
          email: aiData.email || "",
          phone: aiData.phone || "",
          website: aiData.website || "",
          address: aiData.address || "",
          linkedin: aiData.linkedin || "",
        });
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      console.error("Error generating with AI:", error);
      alert("Error generating business card content. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    { 
      id: "modern", 
      name: "Modern", 
      color: "bg-gradient-to-br from-primary via-primary-glow to-accent",
      textColor: "text-white",
      pattern: "geometric",
      glow: "shadow-elegant"
    },
    { 
      id: "classic", 
      name: "Classic", 
      color: "bg-gradient-to-br from-card via-muted to-card-foreground",
      textColor: "text-card-foreground",
      pattern: "elegant",
      glow: "shadow-subtle"
    },
    { 
      id: "creative", 
      name: "Creative", 
      color: "bg-gradient-to-br from-destructive via-primary to-accent",
      textColor: "text-white",
      pattern: "artistic",
      glow: "shadow-glow"
    },
    { 
      id: "minimal", 
      name: "Minimal", 
      color: "bg-gradient-to-br from-background to-muted border-2 border-border",
      textColor: "text-foreground",
      pattern: "clean",
      glow: "shadow-sm"
    },
    { 
      id: "neon", 
      name: "Neon", 
      color: "bg-gradient-to-br from-accent via-primary to-primary-glow",
      textColor: "text-white",
      pattern: "futuristic",
      glow: "shadow-glow animate-pulse"
    },
    { 
      id: "luxury", 
      name: "Luxury", 
      color: "bg-gradient-to-br from-warning via-warning-foreground to-warning",
      textColor: "text-white",
      pattern: "premium",
      glow: "shadow-elegant"
    },
    { 
      id: "holographic", 
      name: "Holographic", 
      color: "bg-gradient-to-br from-primary/80 via-accent/90 to-primary-glow/80 backdrop-blur-sm",
      textColor: "text-white",
      pattern: "hologram",
      glow: "shadow-glow animate-pulse"
    },
    { 
      id: "glass", 
      name: "Glass", 
      color: "bg-white/10 backdrop-blur-md border border-white/20",
      textColor: "text-foreground",
      pattern: "glass",
      glow: "shadow-large"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-6 py-3 rounded-full mb-6 shadow-subtle hover-scale transition-all duration-300 animate-scale-in">
            <CreditCard className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Business Card Creator</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 animate-slide-up">
            Professional Business Card Creator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Design stunning business cards with professional templates. 
            Perfect for networking and making lasting impressions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in hover-scale transition-all duration-300">
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

              {/* AI Generation Section */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Describe your business card</Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder="e.g., Marketing manager at a tech startup, creative industry, luxury real estate agent, etc."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={generateWithAI} 
                    disabled={isGenerating || !hasApiKey || !aiPrompt}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Business Card
                      </>
                    )}
                  </Button>
                  {!hasApiKey && (
                    <p className="text-sm text-destructive">
                      ⚠️ Business Card Creator API key not found (VITE_GEMINI_BUSINESS_CARD_API_KEY)
                    </p>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Choose Template
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {templates.map((template, index) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group p-3 rounded-xl border-2 transition-all duration-300 hover-scale animate-fade-in ${
                        selectedTemplate === template.id
                          ? "border-primary ring-2 ring-primary/20 shadow-glow"
                          : "border-border hover:border-primary/50 hover:shadow-subtle"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`w-full h-10 rounded-lg ${template.color} ${template.glow} mb-2 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                        {/* Enhanced pattern overlays */}
                        {template.pattern === 'geometric' && (
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-4 h-4 bg-white transform rotate-45 animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-white rounded-full animate-bounce" />
                          </div>
                        )}
                        {template.pattern === 'artistic' && (
                          <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-ping" />
                            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white animate-pulse" />
                            <div className="absolute top-1/2 left-1/2 w-1 h-4 bg-white/40 transform -translate-x-1/2 -translate-y-1/2 rotate-12" />
                          </div>
                        )}
                        {template.pattern === 'hologram' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        )}
                        {template.pattern === 'glass' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10" />
                        )}
                        {template.pattern === 'futuristic' && (
                          <div className="absolute inset-0 opacity-40">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-white animate-pulse" />
                            <div className="absolute bottom-0 right-0 w-0.5 h-full bg-white animate-pulse" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium group-hover:text-primary transition-colors">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in hover-scale transition-all duration-300" style={{ animationDelay: '0.2s' }}>
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
                  <div className="bg-gradient-to-br from-muted/30 to-muted/60 p-8 rounded-xl backdrop-blur-sm">
                    <div 
                      ref={cardRef}
                      className={`w-full h-48 rounded-xl p-6 ${
                        templates.find(t => t.id === selectedTemplate)?.color
                      } ${
                        templates.find(t => t.id === selectedTemplate)?.textColor
                      } ${
                        templates.find(t => t.id === selectedTemplate)?.glow
                      } relative overflow-hidden transform hover:scale-105 transition-all duration-500 animate-scale-in`}
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
                          <div className="absolute top-2 left-2 w-8 h-8 border border-white opacity-40 animate-pulse" />
                          <div className="absolute bottom-2 right-2 w-6 h-6 border border-white opacity-40 transform rotate-45 animate-pulse" />
                        </div>
                      )}
                      {selectedTemplate === 'holographic' && (
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
                        </div>
                      )}
                      {selectedTemplate === 'glass' && (
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" />
                          <div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full blur-sm" />
                          <div className="absolute bottom-4 left-4 w-2 h-8 bg-white/20 blur-sm" />
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
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-glow hover:shadow-xl transition-all duration-300 hover-scale"
                    size="lg"
                  >
                    <Download className={`h-4 w-4 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} />
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