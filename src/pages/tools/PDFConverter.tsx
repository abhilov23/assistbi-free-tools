import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileText, Upload, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';

const PDFConverter = () => {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedText, setConvertedText] = useState("");
  const [outputFormat, setOutputFormat] = useState("word");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a PDF smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setConvertedText("");
      setProgress({ current: 0, total: 0 });
      toast({
        title: "File Loaded",
        description: `${selectedFile.name} is ready to convert`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to string for parsing
      let pdfText = '';
      for (let i = 0; i < uint8Array.length; i++) {
        pdfText += String.fromCharCode(uint8Array[i]);
      }
      
      // Extract text between stream markers (actual content)
      const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
      const textPattern = /\[(<[0-9a-f]+>)*\s*\((.*?)\)\s*(<[0-9a-f]+>)*\]/g;
      const simpleTextPattern = /\(((?:[^()\\]|\\[^()])*)\)/g;
      
      let extractedText = '';
      let match;
      
      // Method 1: Extract text from arrays [(...)]
      while ((match = textPattern.exec(pdfText)) !== null) {
        if (match[2]) {
          const text = match[2]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\(.)/g, '$1')
            .trim();
          if (text && text.length > 0 && !text.match(/^[\/\[\]<>{}]+$/)) {
            extractedText += text + ' ';
          }
        }
      }
      
      // Method 2: Extract simple parentheses text if method 1 didn't work well
      if (extractedText.length < 50) {
        extractedText = '';
        pdfText.replace(simpleTextPattern, (match, text) => {
          const cleaned = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\(.)/g, '$1')
            .trim();
          
          // Filter out metadata and PDF commands
          if (cleaned && 
              cleaned.length > 1 && 
              !cleaned.match(/^[\/\[\]<>{}]+$/) &&
              !cleaned.match(/^(obj|endobj|stream|endstream|xref|trailer|startxref)$/i) &&
              !cleaned.match(/^[0-9\s]+[0-9]+\s+[0-9]+\s+R$/i) &&
              !cleaned.match(/^\d{4}[-\s]\d{2}[-\s]\d{2}/i) && // dates
              !cleaned.match(/^D:\d{14}/i) && // PDF dates
              !cleaned.match(/^(PDF|WTF|jsPDF)/i) && // PDF metadata
              !cleaned.match(/^[A-Z]{2,}\s+\d+\.\d+\.\d+/i)) { // Software versions
            extractedText += cleaned + ' ';
          }
          return match;
        });
      }
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ') // normalize whitespace
        .replace(/\s([.,!?;:])/g, '$1') // fix punctuation spacing
        .trim();
      
      if (!extractedText || extractedText.length < 20) {
        throw new Error(
          "Unable to extract readable text from this PDF.\n\n" +
          "This could be because:\n" +
          "• The PDF contains scanned images (needs OCR)\n" +
          "• The PDF is password protected\n" +
          "• The PDF uses complex encoding\n" +
          "• The PDF is corrupted\n\n" +
          "Please try:\n" +
          "• Using a different PDF with selectable text\n" +
          "• Converting scanned PDFs using OCR software first\n" +
          "• Checking if the PDF is password protected"
        );
      }
      
      // Split into pages (estimate based on content length)
      const words = extractedText.split(' ').filter(w => w.length > 0);
      const wordsPerPage = 300; // Approximate words per page
      const estimatedPages = Math.max(1, Math.ceil(words.length / wordsPerPage));
      
      setProgress({ current: 0, total: estimatedPages });
      
      const textByPage = [];
      for (let i = 0; i < estimatedPages; i++) {
        const start = i * wordsPerPage;
        const end = Math.min((i + 1) * wordsPerPage, words.length);
        const pageWords = words.slice(start, end);
        
        if (pageWords.length > 0) {
          textByPage.push({
            pageNumber: i + 1,
            text: pageWords.join(' ')
          });
        }
        
        setProgress({ current: i + 1, total: estimatedPages });
      }
      
      return { fullText: extractedText, textByPage };
      
    } catch (error) {
      console.error("Error extracting text:", error);
      throw error;
    }
  };

  const convertToWord = async (textData) => {
    try {
      const { textByPage } = textData;
      const children = [];

      children.push(
        new Paragraph({
          text: `Converted from: ${file.name}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        })
      );

      textByPage.forEach((pageData) => {
        if (pageData.text && pageData.text.trim()) {
          children.push(
            new Paragraph({
              text: `Page ${pageData.pageNumber}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            })
          );

          // Split into sentences for better formatting
          const sentences = pageData.text.match(/[^.!?]+[.!?]+/g) || [pageData.text];
          sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed) {
              children.push(
                new Paragraph({
                  children: [new TextRun(trimmed)],
                  spacing: { after: 200 }
                })
              );
            }
          });
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children
        }]
      });

      const blob = await Packer.toBlob(doc);
      return blob;
    } catch (error) {
      console.error("Error creating Word document:", error);
      throw new Error(`Failed to create Word document: ${error.message}`);
    }
  };

  const convertToExcel = (textData) => {
    try {
      const { textByPage } = textData;
      const wb = XLSX.utils.book_new();

      if (textByPage.length <= 10) {
        textByPage.forEach(pageData => {
          if (pageData.text && pageData.text.trim()) {
            const sentences = pageData.text.match(/[^.!?]+[.!?]+/g) || [pageData.text];
            const wsData = [
              [`Page ${pageData.pageNumber}`],
              [''],
              ...sentences.map(s => [s.trim()]).filter(s => s[0])
            ];

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [{ wch: 100 }];

            XLSX.utils.book_append_sheet(wb, ws, `Page ${pageData.pageNumber}`);
          }
        });
      } else {
        const allLines = [['Page', 'Content']];
        textByPage.forEach(pageData => {
          if (pageData.text && pageData.text.trim()) {
            const sentences = pageData.text.match(/[^.!?]+[.!?]+/g) || [pageData.text];
            sentences.forEach((sentence, index) => {
              const trimmed = sentence.trim();
              if (trimmed) {
                allLines.push([
                  index === 0 ? `Page ${pageData.pageNumber}` : '',
                  trimmed
                ]);
              }
            });
            allLines.push(['', '']);
          }
        });

        const ws = XLSX.utils.aoa_to_sheet(allLines);
        ws['!cols'] = [{ wch: 15 }, { wch: 100 }];

        XLSX.utils.book_append_sheet(wb, ws, "All Pages");
      }

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error("Error creating Excel file:", error);
      throw new Error(`Failed to create Excel file: ${error.message}`);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setProgress({ current: 0, total: 0 });

    try {
      const textData = await extractTextFromPDF(file);
      setConvertedText(textData.fullText);

      let blob;
      let filename;

      if (outputFormat === "word") {
        blob = await convertToWord(textData);
        filename = file.name.replace('.pdf', '.docx');
      } else {
        blob = convertToExcel(textData);
        filename = file.name.replace('.pdf', '.xlsx');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion Successful!",
        description: `Your PDF has been converted to ${outputFormat === 'word' ? 'Word' : 'Excel'}`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "An error occurred during conversion",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsConverting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6 shadow-soft">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">PDF Converter</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Color Palette selector Tool
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
           Choose and create beautiful color palettes for your designs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-large border-2 bg-card">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Upload className="h-5 w-5 text-primary" />
                Upload PDF File
              </CardTitle>
              <CardDescription>
                Select a PDF file to convert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="pdf-file" className="text-sm font-semibold">
                  Select PDF File
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all cursor-pointer bg-muted/20">
                  <input
                    type="file"
                    id="pdf-file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isConverting}
                  />
                  <label htmlFor="pdf-file" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">
                      Click to upload PDF
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </label>
                </div>
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Output Format
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOutputFormat("word")}
                    disabled={isConverting}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      outputFormat === "word"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <span className="text-sm font-medium">Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => setOutputFormat("excel")}
                    disabled={isConverting}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      outputFormat === "excel"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-success" />
                    <span className="text-sm font-medium">Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {isConverting && progress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing...</span>
                    <span className="text-foreground font-medium">
                      Page {progress.current} of {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Convert to {outputFormat === "word" ? "Word" : "Excel"}
                  </>
                )}
              </Button>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Works best with text-based PDFs</li>
                    <li>Scanned images require OCR (not included)</li>
                    <li>Filters out PDF metadata automatically</li>
                    <li>Complex formatting may vary</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-large border-2 bg-card lg:sticky lg:top-8 h-fit">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Extracted Text Preview
              </CardTitle>
              <CardDescription>
                Preview of the extracted content
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {convertedText ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {convertedText.substring(0, 2000)}
                      {convertedText.length > 2000 && "\n\n... (showing first 2000 characters)"}
                    </pre>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Total characters: {convertedText.length.toLocaleString()}</span>
                    <span>Words: {convertedText.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-semibold text-lg mb-2">
                      No Content Yet
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Upload and convert a PDF to see the extracted text
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Smart Extraction</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Extracts content while filtering out metadata and PDF commands
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Multiple Formats</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Convert to Word documents (.docx) or Excel spreadsheets (.xlsx)
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Download className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">Instant Download</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your converted files immediately - no waiting required
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PDFConverter;