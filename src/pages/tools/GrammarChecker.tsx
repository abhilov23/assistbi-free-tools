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
import { aiApiManager } from "@/lib/ai-api-manager";

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
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const { toast } = useToast();

  // Check available AI providers
  const availableProviders = aiApiManager.getAvailableProviders();
  const hasPerplexityProvider = aiApiManager.hasKeys('perplexity');
  const hasAnyProvider = availableProviders.length > 0;

  // Simple grammar check using write-good library
  const handleSimpleCheck = () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to check",
        variant: "destructive"
      });
      return;
    }

    const writeGoodSuggestions: WriteGoodIssue[] = writeGood(text);
    const convertedIssues: Issue[] = writeGoodSuggestions.map((suggestion, index) => {
      let type: Issue['type'] = 'style';
      let severity: Issue['severity'] = 'low';
      
      if (suggestion.reason.includes('passive voice')) {
        type = 'passive-voice';
        severity = 'medium';
      } else if (suggestion.reason.includes('weasel word')) {
        type = 'weasel-words';
        severity = 'medium';
      } else if (suggestion.reason.includes('adverb')) {
        type = 'adverbs';
        severity = 'low';
      } else if (suggestion.reason.includes('cliche')) {
        type = 'cliches';
        severity = 'low';
      } else if (suggestion.reason.includes('illusion')) {
        type = 'illusion';
        severity = 'medium';
      }

      return {
        type,
        text: text.substring(suggestion.index, suggestion.index + suggestion.offset),
        suggestion: suggestion.reason,
        explanation: `Consider revising: ${suggestion.reason}`,
        severity,
        offset: suggestion.offset
      };
    });

    setIssues(convertedIssues);
    setCorrectedText("");
    
    // Calculate a simple score
    const score = Math.max(20, 100 - (convertedIssues.length * 5));
    setOverallScore(score);
    
    setImprovements([
      "Consider varying your sentence structure",
      "Look for opportunities to use active voice",
      "Remove unnecessary words and phrases",
      "Check for repeated words or phrases"
    ]);

    toast({
      title: "Simple Check Complete",
      description: `Found ${convertedIssues.length} potential issues`,
    });
  };

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleTextToSpeech = () => {
    if (!speechSynthesis || !text) return;

    if (isSpeaking && !isPaused) {
      speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
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
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    }
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

    if (!hasAnyProvider) {
      toast({
        title: "API Key Required",
        description: "No AI API keys found in environment variables. Please add at least one API key.",
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
      const systemMessage = `You are an expert grammar, spelling, and style checker. Analyze the given text and return a JSON response with the following structure:
{
  "correctedText": "The fully corrected version of the text",
  "overallScore": 85,
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

Focus on accuracy and be specific about issues. Provide constructive feedback.`;

      const prompt = `Please analyze this text for grammar, spelling, style, clarity, and conciseness issues:

"${text}"`;

      const response = await aiApiManager.makeRequest(
        prompt,
        hasPerplexityProvider ? ['perplexity', 'gemini', 'openai', 'anthropic'] : ['gemini', 'openai', 'anthropic'],
        systemMessage
      );

      // Try to parse JSON from response
      let analysisData: GrammarResponse;
      try {
        // Extract JSON from markdown if present
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || response.match(/(\{[\s\S]*\})/);
        const jsonStr = jsonMatch ? jsonMatch[1] : response;
        analysisData = JSON.parse(jsonStr);
      } catch (parseError) {
        // Fallback: create a basic response
        analysisData = {
          correctedText: text,
          overallScore: 75,
          issues: [],
          improvements: ["AI analysis completed but couldn't parse detailed results. Please try again."]
        };
      }

      setCorrectedText(analysisData.correctedText || text);
      setIssues(analysisData.issues || []);
      setOverallScore(analysisData.overallScore || 75);
      setImprovements(analysisData.improvements || []);

      toast({
        title: "Analysis Complete",
        description: `Found ${analysisData.issues?.length || 0} issues. Overall score: ${analysisData.overallScore || 75}/100`,
      });

    } catch (error) {
      console.error('Grammar check error:', error);
      toast({
        title: "Analysis Failed",
        description: "Error analyzing text with available AI providers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'grammar':
        return <AlertCircle className="h-4 w-4" />;
      case 'spelling':
        return <AlertTriangle className="h-4 w-4" />;
      case 'style':
      case 'passive-voice':
      case 'weasel-words':
      case 'adverbs':
      case 'cliches':
        return <Info className="h-4 w-4" />;
      case 'clarity':
      case 'conciseness':
        return <Eye className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Issue['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-destructive border-destructive bg-destructive/10';
      case 'medium':
        return 'text-warning border-warning bg-warning/10';
      case 'low':
        return 'text-info border-info bg-info/10';
      default:
        return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-6 py-3 rounded-full mb-6 shadow-subtle hover-scale transition-all duration-300 animate-scale-in">
            <CheckCircle className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Grammar Checker</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 animate-slide-up">
            AI Grammar & Style Checker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Check your text for grammar, spelling, and style issues using advanced AI analysis or simple offline checking.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Analysis Type Selection */}
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Simple Check (Offline)
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Key className="h-4 w-5" />
                Advanced Check (AI)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simple">
              <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Offline Grammar Check
                  </CardTitle>
                  <CardDescription>
                    Fast offline analysis using the write-good library. No API key required.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    AI-Powered Grammar Check
                  </CardTitle>
                  <CardDescription>
                    Advanced grammar, spelling, and style analysis using multiple AI providers.{" "}
                    {!hasAnyProvider ? (
                      <span className="text-destructive">No API keys found in environment variables.</span>
                    ) : (
                      <span className="text-primary">✓ {availableProviders.length} provider(s) available</span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Text Input Area */}
          <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Text to Analyze</span>
                <div className="flex items-center gap-2">
                  {speechSynthesis && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTextToSpeech}
                        disabled={!text}
                        className="h-8 w-8 p-0"
                      >
                        {isSpeaking && !isPaused ? <Pause className="h-4 w-4" /> : 
                         isSpeaking && isPaused ? <Play className="h-4 w-4" /> : 
                         <Volume2 className="h-4 w-4" />}
                      </Button>
                      {isSpeaking && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopSpeech}
                          className="h-8 w-8 p-0"
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Enter or paste your text below for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here for grammar and style checking..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSimpleCheck}
                  disabled={!text.trim()}
                  className="flex-1"
                  size="lg"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isChecking ? "Checking..." : "Simple Check (Offline)"}
                </Button>
                
                <Button
                  onClick={handleCheck}
                  disabled={!text.trim() || !hasAnyProvider || isChecking}
                  className="flex-1"
                  size="lg"
                  variant="secondary"
                >
                  {isChecking ? "Analyzing..." : "Advanced Check (AI)"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {(issues.length > 0 || overallScore !== null || correctedText || improvements.length > 0) && (
            <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Results</span>
                  {overallScore !== null && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      overallScore >= 80 ? 'bg-success/20 text-success' :
                      overallScore >= 60 ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      Score: {overallScore}/100
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Issues */}
                {issues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Issues Found</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {issues.map((issue, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                          <div className="flex items-start gap-3">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">{issue.type.replace('-', ' ')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-sm">{issue.explanation}</p>
                              {issue.text && (
                                <div className="text-sm">
                                  <strong>Text:</strong> "{issue.text}"
                                  {issue.suggestion && (
                                    <>
                                      <br />
                                      <strong>Suggestion:</strong> {issue.suggestion}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Corrected Text */}
                {correctedText && correctedText !== text && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Corrected Text</h3>
                    <Textarea
                      value={correctedText}
                      readOnly
                      className="min-h-32 bg-success/5 border-success/20"
                    />
                  </div>
                )}

                {/* General Improvements */}
                {improvements.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">General Improvements</h3>
                    <ul className="space-y-2">
                      {improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Card className="shadow-subtle border bg-card/30 backdrop-blur-sm hover-scale transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Offline Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Fast, privacy-focused checking that works without internet connection.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border bg-card/30 backdrop-blur-sm hover-scale transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Volume2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Text-to-Speech</h3>
                <p className="text-sm text-muted-foreground">
                  Listen to your text being read aloud to catch errors by ear.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border bg-card/30 backdrop-blur-sm hover-scale transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Detailed Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Get specific suggestions with explanations for each issue found.
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

export default GrammarChecker;