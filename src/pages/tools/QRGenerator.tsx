import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { QrCode, Download, Link as LinkIcon, Type, Phone } from "lucide-react";

const QRGenerator = () => {
  const [qrType, setQrType] = useState<"url" | "text" | "phone">("url");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    // Simulate QR generation
    setTimeout(() => {
      setIsGenerating(false);
      alert("QR Code generated! (Demo mode - no actual QR code generated)");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full mb-4">
            <QrCode className="h-4 w-4" />
            <span className="text-sm font-medium">QR Generator</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            QR Code Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create custom QR codes for URLs, text, phone numbers, and more. 
            Generate high-quality QR codes instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Generator */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-success" />
                Generate QR Code
              </CardTitle>
              <CardDescription>
                Choose the type of content and enter your data to generate a QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">QR Code Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={qrType === "url" ? "default" : "outline"}
                    onClick={() => setQrType("url")}
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    URL
                  </Button>
                  <Button
                    variant={qrType === "text" ? "default" : "outline"}
                    onClick={() => setQrType("text")}
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Text
                  </Button>
                  <Button
                    variant={qrType === "phone" ? "default" : "outline"}
                    onClick={() => setQrType("phone")}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone
                  </Button>
                </div>
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium">
                  {qrType === "url" && "Website URL"}
                  {qrType === "text" && "Text Content"}
                  {qrType === "phone" && "Phone Number"}
                </Label>
                {qrType === "text" ? (
                  <Textarea
                    id="content"
                    placeholder="Enter your text content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <Input
                    id="content"
                    placeholder={
                      qrType === "url" 
                        ? "https://example.com" 
                        : qrType === "phone" 
                        ? "+1234567890" 
                        : ""
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!content.trim() || isGenerating}
                className="w-full"
                size="lg"
                variant="success"
              >
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
            </CardContent>
          </Card>

          {/* Preview/Result */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                QR Code Preview
              </CardTitle>
              <CardDescription>
                Your generated QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted/30 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-foreground font-medium">QR Code Preview</p>
                    <p className="text-muted-foreground text-sm">
                      Generate a QR code to see preview
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button variant="outline" disabled className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button variant="outline" disabled className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            QR Code Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">High Quality</h3>
                <p className="text-muted-foreground text-sm">
                  Generate crisp, scalable QR codes perfect for print and digital use
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Multiple Formats</h3>
                <p className="text-muted-foreground text-sm">
                  Download your QR codes as PNG, SVG, or PDF for any use case
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Various Types</h3>
                <p className="text-muted-foreground text-sm">
                  Create QR codes for URLs, text, phone numbers, and more content types
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QRGenerator;