import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileText, Upload, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist'; // Correct import for the main library
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';

// Set up PDF.js worker with local file from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFConverter = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedText, setConvertedText] = useState("");
  const [outputFormat, setOutputFormat] = useState("word");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Debug worker source
  console.log("PDF.js worker source:", pdfjsLib.GlobalWorkerOptions.workerSrc);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const extractTextFromPDF = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      setProgress({ current: 0, total: pdf.numPages });

      let fullText = "";
      const textByPage: { pageNumber: number; text: string }[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProgress({ current: pageNum, total: pdf.numPages });

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let pageText = "";
        let lastY: number | null = null;

        textContent.items.forEach((item: any, index: number) => {
          if ('str' in item && item.str.trim()) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += '\n';
            }
            if (index > 0 && item.str.trim() && !pageText.endsWith(' ')) {
              pageText += ' ';
            }
            pageText += item.str;
            lastY = item.transform[5];
          }
        });

        const trimmedText = pageText.trim();
        textByPage.push({
          pageNumber: pageNum,
          text: trimmedText
        });

        if (trimmedText) {
          fullText += trimmedText + '\n\n';
        }
      }

      const finalText = fullText.trim();
      if (!finalText) {
        throw new Error("No text could be extracted from the PDF. It may be scanned or image-based.");
      }

      console.log("Extracted text:", finalText); // Debug log
      return { fullText: finalText, textByPage };
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("worker")) {
        throw new Error("Failed to initialize PDF processing. Please ensure the PDF worker is correctly configured.");
      }
      throw new Error(`Failed to extract text from PDF: ${message}`);
    }
  };

  const convertToWord = async (textData: { fullText: string; textByPage: { pageNumber: number; text: string }[] }) => {
    try {
      const { textByPage } = textData;

      const children: Paragraph[] = [];

      children.push(
        new Paragraph({
          text: `Converted from: ${file!.name}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        })
      );

      textByPage.forEach((pageData) => {
        if (pageData.text) {
          children.push(
            new Paragraph({
              text: `Page ${pageData.pageNumber}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            })
          );

          const paragraphs = pageData.text.split('\n').filter(p => p.trim());
          paragraphs.forEach(para => {
            children.push(
              new Paragraph({
                children: [new TextRun(para)],
                spacing: { after: 200 }
              })
            );
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
      throw new Error(`Failed to create Word document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const convertToExcel = (textData: { fullText: string; textByPage: { pageNumber: number; text: string }[] }) => {
    try {
      const { textByPage } = textData;

      const wb = XLSX.utils.book_new();

      if (textByPage.length <= 10) {
        textByPage.forEach(pageData => {
          if (pageData.text) {
            const lines = pageData.text.split('\n').filter(line => line.trim());
            const wsData = [
              [`Page ${pageData.pageNumber}`],
              [''],
              ...lines.map(line => [line])
            ];

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [{ wch: 100 }];

            XLSX.utils.book_append_sheet(wb, ws, `Page ${pageData.pageNumber}`);
          }
        });
      } else {
        const allLines = [['Page', 'Content']];
        textByPage.forEach(pageData => {
          if (pageData.text) {
            const lines = pageData.text.split('\n').filter(line => line.trim());
            lines.forEach((line, index) => {
              allLines.push([
                index === 0 ? `Page ${pageData.pageNumber}` : '',
                line
              ]);
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
      throw new Error(`Failed to create Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
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

      let blob: Blob;
      let filename: string;

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
        description: error instanceof Error ? error.message : "An error occurred during conversion",
        variant: "destructive",
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
            PDF to Word/Excel Converter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert your PDF files to editable Word documents or Excel spreadsheets instantly
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
                      outputFormat === "word" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <span className="text-sm font-medium">Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => setOutputFormat("excel")}
                    disabled={isConverting}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      outputFormat === "excel" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
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
                    <li>Scanned PDFs require OCR (not supported)</li>
                    <li>Complex formatting may not transfer perfectly</li>
                    <li>Large files may take several minutes</li>
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
                    <span>Words: {convertedText.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}</span>
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
                <h3 className="font-semibold text-foreground">Accurate Extraction</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced text extraction preserves content structure and formatting from your PDFs
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
                Convert to Word documents (.docx) or Excel spreadsheets (.xlsx) with one click
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
                Get your converted files immediately - no waiting, no email required
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