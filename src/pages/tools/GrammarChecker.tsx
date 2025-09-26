import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, AlertTriangle, Info, AlertCircle, Volume2, VolumeX, Pause, Play, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApiManager } from "@/lib/ai-api-manager";

interface Issue {
  type: "grammar" | "spelling" | "style" | "clarity" | "conciseness";
  text: string;
  suggestion: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface GrammarResponse {
  correctedText: string;
  issues: Issue[];
  overallScore: number;
  improvements: string[];
}

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const { toast } = useToast();

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
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
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

      const response = await aiApiManager.makeRequest('grammar-checker', prompt, systemMessage);

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
        description: "Error analyzing text. Please try again.",
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
        return 'text-red-600 border-red-200 bg-red-50';
      case 'medium':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full mb-6">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">AI Grammar Checker</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
            AI Grammar & Style Checker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Advanced grammar, spelling, and style analysis powered by Gemini AI technology.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Text Input Area */}
          <Card className="shadow-lg border-2">
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
                Enter or paste your text below for AI-powered analysis
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

              {/* Action Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleCheck}
                  disabled={!text.trim() || isChecking}
                  className="w-full max-w-md"
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isChecking ? "Analyzing with AI..." : "Check Grammar with AI"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {(issues.length > 0 || overallScore !== null || correctedText || improvements.length > 0) && (
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Results</span>
                  {overallScore !== null && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      overallScore >= 80 ? 'bg-green-100 text-green-800' :
                      overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
                                  <span className="font-medium">Found: </span>
                                  <span className="bg-red-100 px-1 rounded">{issue.text}</span>
                                </div>
                              )}
                              {issue.suggestion && (
                                <div className="text-sm">
                                  <span className="font-medium">Suggestion: </span>
                                  <span className="bg-green-100 px-1 rounded">{issue.suggestion}</span>
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
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{correctedText}</p>
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {improvements.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Improvement Suggestions</h3>
                    <ul className="space-y-2">
                      {improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced grammar, spelling, and style checking using Gemini AI technology.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
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

            <Card className="shadow-sm border">
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