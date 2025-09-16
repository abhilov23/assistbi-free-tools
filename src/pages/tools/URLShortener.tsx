import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link, Copy, BarChart3, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const URLShortener = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleShorten = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (including http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    setIsShortening(true);
    
    try {
      // Try TinyURL API which is more reliable
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const shortUrl = await response.text();
      
      if (shortUrl && shortUrl.startsWith('https://tinyurl.com/')) {
        setShortUrl(shortUrl);
        toast({
          title: "Success!",
          description: "URL shortened successfully",
        });
      } else {
        throw new Error("Invalid response from TinyURL");
      }
    } catch (error) {
      console.error('TinyURL failed, falling back to demo mode:', error);
      // Fallback to demo mode if API fails
      const shortCode = Math.random().toString(36).substr(2, 8);
      setShortUrl(`https://short.ly/${shortCode}`);
      toast({
        title: "Demo Mode",
        description: "URL shortened in demo mode (not a real short URL)",
        variant: "default",
      });
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Link className="h-4 w-4" />
            <span className="text-sm font-medium">URL Shortener</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            URL Shortener & Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Shorten long URLs and track clicks with detailed analytics. 
            Create memorable links for social media and marketing campaigns.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* URL Shortener */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Shorten URL
              </CardTitle>
              <CardDescription>
                Enter a long URL to create a short, trackable link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">Original URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/very-long-url-that-needs-shortening"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  type="url"
                />
              </div>

              <Button
                onClick={handleShorten}
                disabled={!url.trim() || isShortening}
                className="w-full"
                size="lg"
              >
                {isShortening ? "Shortening..." : "Shorten URL"}
              </Button>

              {shortUrl && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Short URL</p>
                      <p className="font-mono text-foreground">{shortUrl}</p>
                    </div>
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">0</div>
                      <div className="text-xs text-muted-foreground">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-xs text-muted-foreground">Countries</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Demo Mode Notice
                  </h3>
                  <p className="text-muted-foreground">
                    This tool requires backend integration to store URL mappings and provide analytics. 
                    To enable full URL shortening functionality, connect your project to Supabase using 
                    the green button in the top right corner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Custom Links</h3>
                <p className="text-muted-foreground text-sm">
                  Create branded short links with custom aliases for better recognition
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Track clicks, geographic data, and referrer information in real-time
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

export default URLShortener;