import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditCard, Download, Palette, User, Mail, Phone, Globe, MapPin, Linkedin, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApiManager } from "@/lib/ai-api-manager";

const BusinessCardCreator = () => {
  const { toast } = useToast();
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const cardRef = useRef(null);

  const hasApiKey = aiApiManager.hasKey('business-card');

  const handleInputChange = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const downloadAsImage = () => {
    if (!cardRef.current) return;

    // Create a canvas with the card
    const cardElement = cardRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (standard business card ratio)
    canvas.width = 1050;
    canvas.height = 600;

    // Get the template
    const template = templates.find(t => t.id === selectedTemplate);
    
    // Draw background
    if (ctx) {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const colors = template.gradientColors;
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color
      ctx.fillStyle = template.dark ? '#1f2937' : '#ffffff';
      ctx.textAlign = 'left';

      // Draw name
      ctx.font = 'bold 48px Nunito, sans-serif';
      ctx.fillText(cardData.name, 60, 120);

      // Draw title
      ctx.font = '32px Nunito, sans-serif';
      ctx.globalAlpha = 0.9;
      ctx.fillText(cardData.title, 60, 170);

      // Draw company
      ctx.font = 'bold 36px Nunito, sans-serif';
      ctx.globalAlpha = 1;
      ctx.fillText(cardData.company, 60, 230);

      // Draw contact info
      ctx.font = '24px Nunito, sans-serif';
      ctx.globalAlpha = 0.9;
      let yPos = 400;

      if (cardData.email) {
        ctx.fillText(`✉ ${cardData.email}`, 60, yPos);
        yPos += 40;
      }
      if (cardData.phone) {
        ctx.fillText(`☎ ${cardData.phone}`, 60, yPos);
        yPos += 40;
      }
      if (cardData.website) {
        ctx.fillText(`🌐 ${cardData.website}`, 60, yPos);
        yPos += 40;
      }
      if (cardData.linkedin) {
        ctx.fillText(`🔗 ${cardData.linkedin}`, 60, yPos);
      }
    }

    // Download
    const link = document.createElement('a');
    link.download = `business-card-${cardData.name.replace(/\s+/g, '-').toLowerCase() || 'card'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast({
      title: "Success!",
      description: "Business card downloaded successfully",
    });
  };

  const generateWithAI = async () => {
    if (!hasApiKey) {
      toast({
        title: "API Key Missing",
        description: "Please add VITE_GEMINI_BUSINESS_CARD_API_KEY to your .env file",
        variant: "destructive",
      });
      return;
    }

    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe what type of business card you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Create professional business card information based on this description: "${aiPrompt}"

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "name": "Professional full name",
  "title": "Appropriate job title",
  "company": "Company name",
  "email": "professional.email@company.com",
  "phone": "+1 (555) 123-4567",
  "website": "www.company.com",
  "address": "Professional address",
  "linkedin": "linkedin.com/in/profile"
}`;

      const response = await aiApiManager.makeRequest('business-card', prompt);
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
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
        
        toast({
          title: "Success!",
          description: "Business card generated successfully",
        });
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      console.error("Error generating with AI:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Error generating business card content. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    { 
      id: "modern", 
      name: "Modern",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      gradientColors: ["#667eea", "#764ba2"],
      dark: false
    },
    { 
      id: "classic", 
      name: "Classic",
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      gradientColors: ["#1e3c72", "#2a5298"],
      dark: false
    },
    { 
      id: "creative", 
      name: "Creative",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      gradientColors: ["#f093fb", "#f5576c"],
      dark: false
    },
    { 
      id: "minimal", 
      name: "Minimal",
      gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      gradientColors: ["#fdfbfb", "#ebedee"],
      dark: true
    },
    { 
      id: "neon", 
      name: "Neon",
      gradient: "linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)",
      gradientColors: ["#00d2ff", "#3a47d5"],
      dark: false
    },
    { 
      id: "luxury", 
      name: "Luxury",
      gradient: "linear-gradient(135deg, #d4af37 0%, #aa8e39 100%)",
      gradientColors: ["#d4af37", "#aa8e39"],
      dark: false
    },
    { 
      id: "sunset", 
      name: "Sunset",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      gradientColors: ["#fa709a", "#fee140"],
      dark: false
    },
    { 
      id: "ocean", 
      name: "Ocean",
      gradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
      gradientColors: ["#00c6ff", "#0072ff"],
      dark: false
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  const textColor = currentTemplate?.dark ? "#1f2937" : "#ffffff";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6 shadow-soft">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Business Card Creator</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Create Your Professional Business Card
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design stunning business cards in minutes. Choose from beautiful templates and customize every detail.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-large border-2 bg-card">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Card Information
              </CardTitle>
              <CardDescription>
                Enter your professional details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Marketing Manager"
                    value={cardData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-semibold">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Corporation"
                  value={cardData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    <Mail className="h-3.5 w-3.5 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@acme.com"
                    value={cardData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    <Phone className="h-3.5 w-3.5 inline mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={cardData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold">
                  <Globe className="h-3.5 w-3.5 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="www.acme.com"
                  value={cardData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Business St, City, State 12345"
                  value={cardData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-semibold">
                  <Linkedin className="h-3.5 w-3.5 inline mr-1" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={cardData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                />
              </div>

              {/* AI Generation Section */}
              <div className="space-y-3 pt-6 border-t-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Quick Generate
                </Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="e.g., Marketing manager at a tech startup, luxury real estate agent, creative designer..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                />
                <Button 
                  onClick={generateWithAI} 
                  disabled={isGenerating || !hasApiKey || !aiPrompt}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                {!hasApiKey && (
                  <p className="text-sm text-destructive">
                    ⚠️ API key not configured. Add VITE_GEMINI_BUSINESS_CARD_API_KEY to .env
                  </p>
                )}
              </div>

              {/* Template Selection */}
              <div className="space-y-3 pt-6 border-t-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Palette className="h-4 w-4 text-primary" />
                  Choose Template
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group p-2 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary shadow-lg"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div 
                        className="w-full h-12 rounded mb-2"
                        style={{ background: template.gradient }}
                      />
                      <span className="text-xs font-medium">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-large border-2 bg-card lg:sticky lg:top-8 h-fit">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Preview
              </CardTitle>
              <CardDescription>
                See how your card looks
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {cardData.name && cardData.title && cardData.company ? (
                <div className="space-y-6">
                  <div className="bg-muted/30 p-8 rounded-lg">
                    <div 
                      ref={cardRef}
                      className="w-full aspect-[1.75/1] p-6 rounded-xl shadow-2xl relative overflow-hidden"
                      style={{ background: currentTemplate?.gradient }}
                    >
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                            {cardData.name}
                          </h3>
                          <p className="text-sm mb-3 opacity-90" style={{ color: textColor }}>
                            {cardData.title}
                          </p>
                          <p className="text-lg font-semibold" style={{ color: textColor }}>
                            {cardData.company}
                          </p>
                        </div>
                        
                        <div className="space-y-1.5">
                          {cardData.email && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: textColor }}>
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{cardData.email}</span>
                            </div>
                          )}
                          {cardData.phone && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: textColor }}>
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{cardData.phone}</span>
                            </div>
                          )}
                          {cardData.website && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: textColor }}>
                              <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{cardData.website}</span>
                            </div>
                          )}
                          {cardData.linkedin && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: textColor }}>
                              <Linkedin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{cardData.linkedin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={downloadAsImage}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Business Card
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-semibold text-lg mb-2">No Preview Yet</p>
                    <p className="text-muted-foreground text-sm">
                      Fill in the required fields to see your card preview
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