import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditCard, Download, Palette, User } from "lucide-react";

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

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownload = () => {
    // Mock download functionality
    console.log("Downloading business card...", cardData);
  };

  const templates = [
    { id: "modern", name: "Modern", color: "bg-gradient-to-br from-primary to-primary/80" },
    { id: "classic", name: "Classic", color: "bg-gradient-to-br from-slate-700 to-slate-900" },
    { id: "creative", name: "Creative", color: "bg-gradient-to-br from-purple-600 to-pink-600" },
    { id: "minimal", name: "Minimal", color: "bg-gradient-to-br from-gray-100 to-gray-200" },
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
                <div className="grid grid-cols-2 gap-2">
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
                      <div className={`w-full h-8 rounded ${template.color} mb-2`} />
                      <span className="text-sm font-medium">{template.name}</span>
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
                      className={`w-full h-48 rounded-lg p-6 text-white ${
                        templates.find(t => t.id === selectedTemplate)?.color
                      } relative overflow-hidden`}
                    >
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">{cardData.name}</h3>
                        <p className="text-sm opacity-90 mb-3">{cardData.title}</p>
                        <p className="text-lg font-semibold mb-4">{cardData.company}</p>
                        
                        <div className="space-y-1 text-xs">
                          {cardData.email && <p>{cardData.email}</p>}
                          {cardData.phone && <p>{cardData.phone}</p>}
                          {cardData.website && <p>{cardData.website}</p>}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Business Card
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