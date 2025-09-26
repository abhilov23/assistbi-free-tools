import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PenTool, Copy, Wand2, FileText, Mail, MessageSquare, Lightbulb } from "lucide-react";

const ContentGenerator = () => {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Blog Post States
  const [blogTopic, setBlogTopic] = useState("");
  const [blogTone, setBlogTone] = useState("professional");
  const [blogLength, setBlogLength] = useState("medium");
  
  // Email States
  const [emailType, setEmailType] = useState("marketing");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContext, setEmailContext] = useState("");
  
  // Social Media States
  const [socialPlatform, setSocialPlatform] = useState("twitter");
  const [socialTopic, setSocialTopic] = useState("");
  const [socialStyle, setSocialStyle] = useState("engaging");

  const contentTypes = {
    blog: {
      tones: [
        { value: "professional", label: "Professional" },
        { value: "casual", label: "Casual" },
        { value: "friendly", label: "Friendly" },
        { value: "formal", label: "Formal" },
        { value: "humorous", label: "Humorous" },
        { value: "inspiring", label: "Inspiring" },
        { value: "educational", label: "Educational" }
      ],
      lengths: [
        { value: "short", label: "Short (300-500 words)" },
        { value: "medium", label: "Medium (500-800 words)" },
        { value: "long", label: "Long (800-1200 words)" },
        { value: "extensive", label: "Extensive (1200+ words)" }
      ]
    },
    email: {
      types: [
        { value: "marketing", label: "Marketing Email" },
        { value: "newsletter", label: "Newsletter" },
        { value: "welcome", label: "Welcome Email" },
        { value: "follow-up", label: "Follow-up Email" },
        { value: "announcement", label: "Announcement" },
        { value: "apology", label: "Apology Email" },
        { value: "thank-you", label: "Thank You Email" }
      ]
    },
    social: {
      platforms: [
        { value: "twitter", label: "Twitter/X" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "facebook", label: "Facebook" },
        { value: "instagram", label: "Instagram" },
        { value: "tiktok", label: "TikTok" },
        { value: "youtube", label: "YouTube" }
      ],
      styles: [
        { value: "engaging", label: "Engaging" },
        { value: "professional", label: "Professional" },
        { value: "casual", label: "Casual" },
        { value: "trendy", label: "Trendy" },
        { value: "informative", label: "Informative" },
        { value: "entertaining", label: "entertaining" }
      ]
    }
  };

  const generateBlogPost = async () => {
    const prompt = `Write a ${blogLength} ${blogTone} blog post about "${blogTopic}". 
    
    Structure the blog post with:
    - Compelling title
    - Introduction that hooks the reader
    - Main content with clear sections/headings
    - Practical insights or actionable advice
    - Engaging conclusion
    
    Tone: ${blogTone}
    Length: ${contentTypes.blog.lengths.find(l => l.value === blogLength)?.label}
    
    Make it engaging, well-structured, and valuable to readers.`;
    
    return prompt;
  };

  const generateEmail = async () => {
    const emailTypeLabel = contentTypes.email.types.find(t => t.value === emailType)?.label;
    const prompt = `Write a ${emailTypeLabel.toLowerCase()} with the subject line "${emailSubject}".
    
    Context: ${emailContext}
    
    The email should:
    - Have a compelling subject line (if not provided, suggest one)
    - Professional yet engaging tone
    - Clear call-to-action where appropriate
    - Proper email structure (greeting, body, closing)
    - Be concise but effective
    
    Format it as a complete email ready to send.`;
    
    return prompt;
  };

  const generateSocialPost = async () => {
    const platformLabel = contentTypes.social.platforms.find(p => p.value === socialPlatform)?.label;
    const styleLabel = contentTypes.social.styles.find(s => s.value === socialStyle)?.label;
    
    let characterLimit = "";
    switch (socialPlatform) {
      case "twitter":
        characterLimit = "Keep it under 280 characters.";
        break;
      case "linkedin":
        characterLimit = "Aim for 150-300 words for optimal engagement.";
        break;
      case "instagram":
        characterLimit = "Include relevant hashtags and emojis.";
        break;
      case "tiktok":
        characterLimit = "Write a catchy caption with trending hashtags.";
        break;
      default:
        characterLimit = "Optimize for the platform's best practices.";
    }

    const prompt = `Create a ${styleLabel.toLowerCase()} ${platformLabel} post about "${socialTopic}".
    
    Requirements:
    - ${characterLimit}
    - ${styleLabel} tone and style
    - Platform-appropriate format
    - Include relevant hashtags where appropriate
    - Make it engaging and shareable
    - Call-to-action when relevant
    
    Make it perfect for ${platformLabel} audience and engagement.`;
    
    return prompt;
  };

  const handleGenerate = async (type: string) => {
    if (!geminiApiKey.trim()) {
      alert("Please enter your Gemini API key first");
      return;
    }

    let prompt = "";
    switch (type) {
      case "blog":
        if (!blogTopic.trim()) {
          alert("Please enter a blog topic");
          return;
        }
        prompt = await generateBlogPost();
        break;
      case "email":
        if (!emailSubject.trim() || !emailContext.trim()) {
          alert("Please enter email subject and context");
          return;
        }
        prompt = await generateEmail();
        break;
      case "social":
        if (!socialTopic.trim()) {
          alert("Please enter a social media topic");
          return;
        }
        prompt = await generateSocialPost();
        break;
      default:
        return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const content = result.candidates[0].content.parts[0].text;
        setGeneratedContent(content);
      } else {
        throw new Error("No content generated");
      }
    } catch (error) {
      console.error("Content generation error:", error);
      alert("Error generating content. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-6 py-3 rounded-full mb-6 shadow-subtle hover-scale transition-all duration-300 animate-scale-in">
            <PenTool className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Content Generator</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 animate-slide-up">
            AI Content Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Generate high-quality content for blogs, emails, and social media using Google's Gemini AI.
            Perfect for marketers, writers, and content creators.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* API Key Input */}
          <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Enter your Gemini API key to enable content generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="gemini-api">Gemini API Key</Label>
                <Input
                  id="gemini-api"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Generation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Choose content type and customize your requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="blog" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="blog" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Blog
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Social
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="blog" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="blog-topic">Blog Topic *</Label>
                      <Input
                        id="blog-topic"
                        placeholder="e.g., The Future of AI in Marketing"
                        value={blogTopic}
                        onChange={(e) => setBlogTopic(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select value={blogTone} onValueChange={setBlogTone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.blog.tones.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                {tone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Length</Label>
                        <Select value={blogLength} onValueChange={setBlogLength}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.blog.lengths.map((length) => (
                              <SelectItem key={length.value} value={length.value}>
                                {length.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleGenerate("blog")} 
                      disabled={isGenerating || !geminiApiKey || !blogTopic}
                      className="w-full"
                    >
                      {isGenerating ? "Generating..." : "Generate Blog Post"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Type</Label>
                      <Select value={emailType} onValueChange={setEmailType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.email.types.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject Line *</Label>
                      <Input
                        id="email-subject"
                        placeholder="e.g., Welcome to our community!"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-context">Context & Details *</Label>
                      <Textarea
                        id="email-context"
                        placeholder="Describe the purpose, audience, and key points for this email..."
                        value={emailContext}
                        onChange={(e) => setEmailContext(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={() => handleGenerate("email")} 
                      disabled={isGenerating || !geminiApiKey || !emailSubject || !emailContext}
                      className="w-full"
                    >
                      {isGenerating ? "Generating..." : "Generate Email"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="social-topic">Topic/Message *</Label>
                      <Input
                        id="social-topic"
                        placeholder="e.g., Announcing our new product launch"
                        value={socialTopic}
                        onChange={(e) => setSocialTopic(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={socialPlatform} onValueChange={setSocialPlatform}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.social.platforms.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                {platform.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Style</Label>
                        <Select value={socialStyle} onValueChange={setSocialStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.social.styles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleGenerate("social")} 
                      disabled={isGenerating || !geminiApiKey || !socialTopic}
                      className="w-full"
                    >
                      {isGenerating ? "Generating..." : "Generate Social Post"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Generated Content
                  </span>
                  {generatedContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your AI-generated content will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <Textarea
                      value={generatedContent}
                      readOnly
                      className="min-h-96 bg-muted/50 font-mono text-sm"
                    />
                    <div className="text-sm text-muted-foreground">
                      {generatedContent.length} characters • {generatedContent.split(' ').length} words
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-96 text-muted-foreground">
                    <div className="text-center space-y-3">
                      <PenTool className="h-12 w-12 mx-auto opacity-50" />
                      <p>Generated content will appear here</p>
                      <p className="text-sm">Configure your settings and click generate to start</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContentGenerator;