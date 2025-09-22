import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, AlertTriangle, Info, AlertCircle, Volume2, VolumeX, Pause, Play, Key, Eye, EyeOff, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import writeGood from 'write-good';

interface Issue {
  type: "grammar" | "spelling" | "style" | "clarity" | "conciseness" | "passive-voice" | "weasel-words" | "adverbs" | "cliches" | "illusion";
  text: string;
  suggestion: string;
  explanation: string;
  severity: "low" | "medium" | "high";
  offset?: number;
}

interface GrammarResponse {
  correctedText: string;
  issues: Issue[];
  overallScore: number;
  improvements: string[];
}

interface WriteGoodIssue {
  index: number;
  offset: number;
  reason: string;
}

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const { toast } = useToast();

  // Simple offline grammar check using write-good
  const handleSimpleCheck = () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to check",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    setIssues([]);
    setCorrectedText("");
    setOverallScore(null);
    setImprovements([]);

    // Use write-good for simple grammar checking
    try {
      const suggestions: WriteGoodIssue[] = writeGood(text);
      
      const processedIssues: Issue[] = suggestions.map((suggestion) => {
        const issueText = text.substring(suggestion.index, suggestion.index + suggestion.offset);
        
        // Categorize issues based on reason
        let type: Issue["type"] = "style";
        let severity: Issue["severity"] = "medium";
        let explanation = suggestion.reason;
        let suggestionText = "";

        if (suggestion.reason.includes("passive voice")) {
          type = "passive-voice";
          explanation = "Consider using active voice for clearer, more direct writing";
          suggestionText = "Rewrite in active voice";
          severity = "low";
        } else if (suggestion.reason.includes("weasel word")) {
          type = "weasel-words";
          explanation = "This word is vague and weakens your writing";
          suggestionText = "Use a more specific word";
          severity = "medium";
        } else if (suggestion.reason.includes("adverb")) {
          type = "adverbs";
          explanation = "Adverbs can often be removed for stronger writing";
          suggestionText = "Consider removing or replacing with a stronger verb";
          severity = "low";
        } else if (suggestion.reason.includes("cliché")) {
          type = "cliches";
          explanation = "This phrase is overused and may reduce impact";
          suggestionText = "Use a more original expression";
          severity = "medium";
        } else if (suggestion.reason.includes("lexical illusion")) {
          type = "illusion";
          explanation = "Repeated word that may be unintentional";
          suggestionText = "Check if word repetition is intentional";
          severity = "high";
        }

        return {
          type,
          text: issueText,
          suggestion: suggestionText,
          explanation,
          severity,
          offset: suggestion.index
        };
      });

      // Calculate a simple score based on issues found
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const issueRatio = processedIssues.length / Math.max(wordCount / 10, 1); // Issues per 10 words
      const score = Math.max(50, Math.min(100, 100 - (issueRatio * 15)));

      setIssues(processedIssues);
      setOverallScore(Math.round(score));
      
      // Generate improvements based on found issues
      const foundTypes = [...new Set(processedIssues.map(i => i.type))];
      const improvementSuggestions = [];
      
      if (foundTypes.includes("passive-voice")) {
        improvementSuggestions.push("Use more active voice to make your writing direct and engaging");
      }
      if (foundTypes.includes("weasel-words")) {
        improvementSuggestions.push("Replace vague words with specific, concrete terms");
      }
      if (foundTypes.includes("adverbs")) {
        improvementSuggestions.push("Strengthen your verbs instead of relying on adverbs");
      }
      if (foundTypes.includes("cliches")) {
        improvementSuggestions.push("Use original expressions instead of common clichés");
      }

      setImprovements(improvementSuggestions);

      toast({
        title: "Analysis Complete!",
        description: `Found ${processedIssues.length} writing improvements`,
      });

    } catch (error) {
      console.error('Simple grammar check error:', error);
      toast({
        title: "Analysis Failed",
        description: "Error analyzing text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleTextToSpeech = () => {
    if (!speechSynthesis) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to read aloud.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking && !isPaused) {
      // Pause speech
      speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      // Resume speech
      speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Start new speech
    speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      toast({
        title: "Speech Error",
        description: "An error occurred during text-to-speech.",
        variant: "destructive",
      });
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    }
  };

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to check",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to use grammar checking",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    setIssues([]);
    setCorrectedText("");
    setOverallScore(null);
    setImprovements([]);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are an expert grammar, spelling, and style checker. Analyze the given text and return a JSON response with the following structure:
{
  "correctedText": "The fully corrected version of the text",
  "overallScore": 85, // Score from 0-100 based on writing quality
  "issues": [
    {
      "type": "grammar|spelling|style|clarity|conciseness",
      "text": "The problematic text segment",
      "suggestion": "Suggested correction",
      "explanation": "Brief explanation of why this is an issue",
      "severity": "low|medium|high"
    }
  ],
  "improvements": ["General improvement suggestion 1", "General improvement suggestion 2"]
}

Be thorough but concise. Focus on the most important issues first.`
            },
            {
              role: 'user',
              content: `Please check this text for grammar, spelling, and style issues:\n\n${text}`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      const content = data.choices[0].message.content;
      
      try {
        // Extract JSON from the response (in case it's wrapped in markdown)
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
        const jsonContent = jsonMatch[1] || content;
        
        const result: GrammarResponse = JSON.parse(jsonContent);
        
        setCorrectedText(result.correctedText || "");
        setIssues(result.issues || []);
        setOverallScore(result.overallScore || null);
        setImprovements(result.improvements || []);

        toast({
          title: "Analysis Complete!",
          description: `Found ${result.issues?.length || 0} issues to review`,
        });

      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        toast({
          title: "Analysis Error",
          description: "Could not parse the grammar analysis results. Please try again.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Grammar check error:', error);
      toast({
        title: "Grammar Check Failed",
        description: error instanceof Error ? error.message : "Please check your API key and try again",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getIssueIcon = (type: Issue["type"]) => {
    switch (type) {
      case "grammar":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "spelling":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "style":
        return <Info className="h-4 w-4 text-primary" />;
      case "passive-voice":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "weasel-words":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "adverbs":
        return <Info className="h-4 w-4 text-purple-500" />;
      case "cliches":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "illusion":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: Issue["severity"]) => {
    switch (severity) {
      case "high":
        return "border-destructive bg-destructive/10";
      case "medium":
        return "border-warning bg-warning/10";
      case "low":
        return "border-muted bg-muted/10";
      default:
        return "border-muted bg-muted/10";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Grammar Checker</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Grammar & Style Checker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your writing with advanced grammar and style suggestions. 
            Get instant feedback on grammar, spelling, and writing style.
          </p>
        </div>

        {/* API Configuration */}
        <div className="max-w-4xl mx-auto mb-8">
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Simple Check (Offline)
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Advanced Check (AI)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Offline Grammar Check
                  </CardTitle>
                  <CardDescription>
                    Quick grammar and style checking that works entirely in your browser. 
                    Detects passive voice, weasel words, adverbs, clichés, and word repetitions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ No API key required • ✅ Works offline • ✅ Privacy-friendly
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    AI-Powered Grammar Check
                  </CardTitle>
                  <CardDescription>
                    Advanced grammar, spelling, and style analysis using Perplexity AI. 
                    Get your API key from{" "}
                    <a 
                      href="https://www.perplexity.ai/settings/api" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Perplexity AI Settings
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Perplexity API Key</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="pplx-..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Text Input */}
          <Card className="shadow-large border-2 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                Text to Check
              </CardTitle>
              <CardDescription>
                Enter or paste your text to check for grammar, spelling, and style issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste your text here to check for grammar, spelling, and style issues..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{text.length} characters</span>
                  <span>{text.split(/\s+/).filter(word => word.length > 0).length} words</span>
                </div>
              </div>

              {correctedText && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Corrected Version</Label>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {correctedText}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSimpleCheck}
                  disabled={!text.trim() || isChecking}
                  className="flex-1"
                  size="lg"
                  variant="default"
                >
                  {isChecking ? "Analyzing..." : "Quick Check (Offline)"}
                </Button>
                
                <Button
                  onClick={handleCheck}
                  disabled={!text.trim() || !apiKey.trim() || isChecking}
                  className="flex-1"
                  size="lg"
                  variant="secondary"
                >
                  {isChecking ? "Analyzing..." : "Advanced Check (AI)"}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleTextToSpeech}
                    disabled={!text.trim()}
                    size="lg"
                    variant="outline"
                    className="px-3"
                  >
                    {isSpeaking && !isPaused ? <Pause className="h-4 w-4" /> : 
                     isPaused ? <Play className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  {isSpeaking && (
                    <Button
                      onClick={stopSpeech}
                      size="lg"
                      variant="outline"
                      className="px-3"
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Grammar, spelling, and style analysis will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overallScore !== null && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Writing Quality Score</span>
                    <span className="text-2xl font-bold text-primary">{overallScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${overallScore}%` }}
                    />
                  </div>
                </div>
              )}

              {issues.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-6">
                    <div className="text-center p-2 bg-destructive/10 rounded-lg">
                      <div className="text-sm font-bold text-destructive">
                        {issues.filter(i => i.type === "grammar").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Grammar</div>
                    </div>
                    <div className="text-center p-2 bg-destructive/10 rounded-lg">
                      <div className="text-sm font-bold text-destructive">
                        {issues.filter(i => i.type === "spelling").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Spelling</div>
                    </div>
                    <div className="text-center p-2 bg-primary/10 rounded-lg">
                      <div className="text-sm font-bold text-primary">
                        {issues.filter(i => i.type === "style").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Style</div>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                      <div className="text-sm font-bold text-blue-500">
                        {issues.filter(i => i.type === "passive-voice").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Passive</div>
                    </div>
                    <div className="text-center p-2 bg-orange-500/10 rounded-lg">
                      <div className="text-sm font-bold text-orange-500">
                        {issues.filter(i => i.type === "weasel-words").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Vague</div>
                    </div>
                    <div className="text-center p-2 bg-purple-500/10 rounded-lg">
                      <div className="text-sm font-bold text-purple-500">
                        {issues.filter(i => i.type === "adverbs").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Adverbs</div>
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {issues.map((issue, index) => (
                      <div key={index} className={`rounded-lg p-4 space-y-3 border-2 ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getIssueIcon(issue.type)}
                            <span className="font-medium capitalize">{issue.type}</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-background/50 rounded capitalize">
                            {issue.severity}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Issue:</span>
                            <span className="ml-2 font-mono bg-background/50 px-2 py-1 rounded">
                              {issue.text}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Suggestion:</span>
                            <span className="ml-2 font-mono bg-green-100 dark:bg-green-950/50 px-2 py-1 rounded">
                              {issue.suggestion}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic">{issue.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* General Improvements */}
                  {improvements.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">General Improvements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        {improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-center">
                  <div>
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium">Ready to Analyze</p>
                    <p className="text-muted-foreground text-sm">
                      Enter your API key and text above to get started
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features & Tips */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Offline Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  No internet required - instant grammar and style checking in your browser
                </p>
              </CardContent>
            </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Volume2 className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Text-to-Speech</h3>
              <p className="text-sm text-muted-foreground">
                Listen to your text to catch issues that might not be visible when reading
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Info className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Get specific explanations for each issue with severity levels and improvement suggestions
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GrammarChecker;