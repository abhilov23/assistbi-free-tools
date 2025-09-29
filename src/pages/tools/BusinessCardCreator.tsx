import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Download, Palette, User, Mail, Phone, Globe, MapPin, Linkedin, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

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

  const handleInputChange = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `business-card-${cardData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Download Complete",
        description: "Your business card has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate business card image",
        variant: "destructive",
      });
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe the type of business card you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setCardData({
        name: "John Anderson",
        title: "Senior Marketing Director",
        company: "Tech Innovations Inc.",
        email: "john.anderson@techinnovations.com",
        phone: "+1 (555) 987-6543",
        website: "www.techinnovations.com",
        address: "456 Innovation Drive, San Francisco, CA 94105",
        linkedin: "linkedin.com/in/johnanderson",
      });
      
      toast({
        title: "Success!",
        description: "Business card generated successfully",
      });
      setIsGenerating(false);
    }, 2000);
  };

  const templates = [
    { 
      id: "modern", 
      name: "Modern",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    { 
      id: "classic", 
      name: "Classic",
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
    },
    { 
      id: "creative", 
      name: "Creative",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    { 
      id: "minimal", 
      name: "Minimal",
      gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      dark: true
    },
    { 
      id: "neon", 
      name: "Neon",
      gradient: "linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)"
    },
    { 
      id: "luxury", 
      name: "Luxury",
      gradient: "linear-gradient(135deg, #d4af37 0%, #aa8e39 100%)"
    },
    { 
      id: "sunset", 
      name: "Sunset",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    { 
      id: "ocean", 
      name: "Ocean",
      gradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)"
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  const textColor = currentTemplate?.dark ? "#1f2937" : "#ffffff";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full mb-6 shadow-lg">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">Business Card Creator</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Create Your Professional Business Card
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Design stunning business cards in minutes. Choose from beautiful templates and customize every detail.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-indigo-600" />
                Card Information
              </CardTitle>
              <CardDescription>
                Enter your professional details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Marketing Manager"
                    value={cardData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Corporation"
                  value={cardData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    <Mail className="h-3.5 w-3.5 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@acme.com"
                    value={cardData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    <Phone className="h-3.5 w-3.5 inline mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={cardData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                  <Globe className="h-3.5 w-3.5 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="www.acme.com"
                  value={cardData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Business St, City, State 12345"
                  value={cardData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700">
                  <Linkedin className="h-3.5 w-3.5 inline mr-1" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={cardData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* AI Generation Section */}
              <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  AI Quick Generate
                </Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="e.g., Marketing manager at a tech startup, luxury real estate agent, creative designer..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Button 
                  onClick={generateWithAI} 
                  disabled={isGenerating || !aiPrompt}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
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
              </div>

              {/* Template Selection */}
              <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Palette className="h-4 w-4 text-indigo-600" />
                  Choose Template
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group p-2 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? "border-indigo-600 shadow-lg"
                          : "border-gray-200 hover:border-indigo-400"
                      }`}
                    >
                      <div 
                        className="w-full h-12 rounded mb-2"
                        style={{ background: template.gradient }}
                      />
                      <span className="text-xs font-medium text-gray-700">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-xl border-0 bg-white lg:sticky lg:top-8 h-fit">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Preview
              </CardTitle>
              <CardDescription>
                See how your card looks
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {cardData.name && cardData.title && cardData.company ? (
                <div className="space-y-6">
                  {/* Business Card Preview */}
                  <div className="bg-gray-100 p-8 rounded-lg">
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
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Business Card
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold text-lg mb-2">No Preview Yet</p>
                    <p className="text-gray-500 text-sm">
                      Fill in the required fields to see your card preview
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BusinessCardCreator;