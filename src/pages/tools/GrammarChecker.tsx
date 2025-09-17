import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, AlertTriangle, Info, AlertCircle, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Issue {
  type: "grammar" | "spelling" | "style";
  text: string;
  suggestion: string;
  position: number;
}

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

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

  const handleCheck = () => {
    if (!text.trim()) return;
    setIsChecking(true);
    // Simulate grammar checking
    setTimeout(() => {
      setIsChecking(false);
      // Demo issues
      setIssues([
        {
          type: "grammar",
          text: "Example grammar issue",
          suggestion: "Suggested correction",
          position: 0
        },
        {
          type: "spelling",
          text: "Example spelling mistake",
          suggestion: "Correct spelling",
          position: 20
        },
        {
          type: "style",
          text: "Style improvement suggestion",
          suggestion: "Better phrasing",
          position: 45
        }
      ]);
    }, 2000);
  };

  const getIssueIcon = (type: Issue["type"]) => {
    switch (type) {
      case "grammar":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "spelling":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "style":
        return <Info className="h-4 w-4 text-primary" />;
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Text Input */}
          <Card className="shadow-large border-2">
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
                  rows={15}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{text.length} characters</span>
                  <span>{text.split(/\s+/).filter(word => word.length > 0).length} words</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCheck}
                  disabled={!text.trim() || isChecking}
                  className="flex-1"
                  size="lg"
                  variant="secondary"
                >
                  {isChecking ? "Checking..." : "Check Grammar & Style"}
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
                Issues & Suggestions
              </CardTitle>
              <CardDescription>
                Grammar, spelling, and style issues will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <div className="text-lg font-bold text-destructive">
                        {issues.filter(i => i.type === "grammar").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Grammar</div>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <div className="text-lg font-bold text-warning">
                        {issues.filter(i => i.type === "spelling").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Spelling</div>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {issues.filter(i => i.type === "style").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Style</div>
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {issues.map((issue, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          {getIssueIcon(issue.type)}
                          <span className="font-medium capitalize">{issue.type}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Issue:</strong> {issue.text}</p>
                          <p><strong>Suggestion:</strong> {issue.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium">Grammar Check Results</p>
                    <p className="text-muted-foreground text-sm">
                      Enter text above to check for issues
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Demo Notice */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Demo Mode Notice
                  </h3>
                  <p className="text-muted-foreground">
                    This tool requires AI integration to check grammar and provide writing suggestions. 
                    To enable full grammar checking functionality, connect your project to 
                    Supabase using the green button in the top right corner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GrammarChecker;