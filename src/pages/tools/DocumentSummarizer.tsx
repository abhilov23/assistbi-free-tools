import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileCheck, Sparkles, Upload, AlertCircle } from "lucide-react";

const DocumentSummarizer = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // In a real implementation, you'd extract text from the file
      setText("Sample text extracted from uploaded file...");
    }
  };

  const handleSummarize = () => {
    if (!text.trim()) return;
    setIsSummarizing(true);
    // Simulate AI summarization
    setTimeout(() => {
      setIsSummarizing(false);
      setSummary("This is a demo summary. In the full version, advanced AI would analyze your document and provide a comprehensive summary highlighting key points, main arguments, and important conclusions.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <FileCheck className="h-4 w-4" />
            <span className="text-sm font-medium">Document Summarizer</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Document Summarizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get concise summaries of long documents using advanced AI technology. 
            Perfect for research papers, articles, and reports.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Document Input
              </CardTitle>
              <CardDescription>
                Upload a document or paste text to generate a summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload Document (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload PDF, DOCX, or TXT
                    </p>
                  </label>
                </div>
                {file && (
                  <p className="text-sm text-primary">Uploaded: {file.name}</p>
                )}
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="text">Or Paste Text Here</Label>
                <Textarea
                  id="text"
                  placeholder="Paste your document text here for summarization..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {text.length} characters
                </p>
              </div>

              <Button
                onClick={handleSummarize}
                disabled={!text.trim() || isSummarizing}
                className="w-full"
                size="lg"
              >
                {isSummarizing ? (
                  "Analyzing Document..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                AI Summary
              </CardTitle>
              <CardDescription>
                Your document summary will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-foreground leading-relaxed">{summary}</p>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Original: {text.length} characters</span>
                    <span>Summary: {summary.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium">AI Summary</p>
                    <p className="text-muted-foreground text-sm">
                      Enter text above to generate summary
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
                    This is a demonstration interface. To enable full AI-powered document 
                    summarization with advanced natural language processing, you'll need 
                    to connect AI services through a backend integration.
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

export default DocumentSummarizer;