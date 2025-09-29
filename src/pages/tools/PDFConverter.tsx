import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, FileText, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { useToast } from "@/hooks/use-toast";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [fileInfo, setFileInfo] = useState<{pages?: number, size: string, type: string} | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [conversionType, setConversionType] = useState<'word' | 'excel' | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.size);
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      setIsProcessed(false);
      setFileInfo(null);
      setExtractedText("");
      
      try {
        console.log('Processing file...');
        const fileSizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
        let text = '';
        let info: {pages?: number, size: string, type: string};

        if (selectedFile.type === 'application/pdf') {
          // Extract text from PDF
          text = await extractTextFromPDF(selectedFile);
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pageCount = pdfDoc.getPageCount();
          
          info = {
            pages: pageCount,
            size: fileSizeMB,
            type: 'PDF'
          };
        } else if (selectedFile.name.endsWith('.docx') || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Extract text from DOCX
          text = await extractTextFromDOCX(selectedFile);
          info = {
            size: fileSizeMB,
            type: 'Word Document'
          };
        } else {
          throw new Error('Unsupported file type');
        }

        setExtractedText(text);
        setFileInfo(info);
        setIsProcessed(true);

        toast({
          title: "File loaded successfully",
          description: `Extracted ${text.length} characters of text`,
        });
        
        console.log('File processing completed successfully');
        
      } catch (error) {
        console.error('Error processing file:', error);
        setFileInfo(null);
        setExtractedText("");
        setIsProcessed(false);
        toast({
          title: "Error processing file",
          description: "Failed to read the file. Please try a different file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleConvert = async (type: 'word' | 'excel') => {
    if (!file || !fileInfo || !extractedText) return;
    
    setIsConverting(true);
    setConversionType(type);
    
    try {
      const fileName = file.name.replace(/\.(pdf|docx)$/i, '');
      
      if (type === 'word') {
        // Create DOCX with extracted content
        const paragraphs = extractedText.split('\n').map(line => {
          if (line.trim() === '') {
            return new Paragraph({
              children: [new TextRun({ text: "" })],
            });
          }
          
          return new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
          });
        });

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });

        const blob = await Packer.toBlob(doc);
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = `${fileName}.docx`;
        element.click();
        
        toast({
          title: "Word document created",
          description: `${fileName}.docx has been downloaded`,
        });
        
      } else {
        // Create Excel with extracted text
        const lines = extractedText.split('\n').filter(line => line.trim());
        const worksheetData = [
          ['Document Conversion'],
          [''],
          ['File Information'],
          ['Original File:', file.name],
          ['File Size (MB):', fileInfo.size],
          ['File Type:', fileInfo.type],
          ...(fileInfo.pages ? [['Pages:', fileInfo.pages]] : []),
          ['Conversion Date:', new Date().toLocaleDateString()],
          [''],
          ['Extracted Content'],
          ['Line #', 'Text'],
          ...lines.map((line, index) => [index + 1, line]),
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Style headers
        ['A1', 'A3', 'A10'].forEach(cell => {
          if (worksheet[cell]) {
            worksheet[cell].s = {
              font: { bold: true, sz: 14 },
              fill: { fgColor: { rgb: "E3F2FD" } }
            };
          }
        });
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Document Content');
        
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        
        toast({
          title: "Excel spreadsheet created",
          description: `${fileName}.xlsx has been downloaded`,
        });
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: "An error occurred during conversion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
      setConversionType(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">PDF Converter</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            PDF & Word Document Converter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert PDF to Word/Excel or Word to Excel with full text extraction. 
            No installation required, completely free.
          </p>
        </div>

        {/* Main Tool */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Your File
              </CardTitle>
              <CardDescription>
                Select a PDF or Word document to convert. Max file size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-smooth">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Click to upload PDF or Word file
                    </p>
                    <p className="text-muted-foreground">
                      Or drag and drop your file here (.pdf, .docx)
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {fileInfo 
                            ? `${fileInfo.type}${fileInfo.pages ? ` • ${fileInfo.pages} pages` : ''} • ${fileInfo.size} MB`
                            : `${(file.size / 1024 / 1024).toFixed(2)} MB`
                          }
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setFile(null);
                        setFileInfo(null);
                        setExtractedText("");
                        setIsProcessed(false);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {fileInfo && isProcessed && (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-background/50 rounded-lg">
                      {fileInfo.pages && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{fileInfo.pages}</div>
                          <div className="text-xs text-muted-foreground">Pages</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">{extractedText.split(/\s+/).length}</div>
                        <div className="text-xs text-muted-foreground">Words</div>
                      </div>
                      <div className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        <div className="text-xs text-muted-foreground">Ready</div>
                      </div>
                    </div>
                  )}

                  {isProcessed && (
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">File processed - {extractedText.length} characters extracted</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Convert Options */}
              {file && isProcessed && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Choose Output Format</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleConvert('word')}
                      disabled={isConverting}
                      className="flex items-center gap-2 h-12"
                      variant="default"
                    >
                      {isConverting && conversionType === 'word' ? (
                        "Converting to Word..."
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Convert to Word
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleConvert('excel')}
                      disabled={isConverting}
                      className="flex items-center gap-2 h-12"
                      variant="secondary"
                    >
                      {isConverting && conversionType === 'excel' ? (
                        "Converting to Excel..."
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Convert to Excel
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Real Text Extraction</p>
                        <p className="text-amber-700 dark:text-amber-300">
                          This tool extracts actual text content from your documents. For scanned PDFs or images,
                          OCR processing would be required for text recognition.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    What file formats are supported?
                  </h3>
                  <p className="text-muted-foreground">
                    Our converter supports PDF and Word documents (.docx), extracting real text content
                    and converting to Microsoft Word (.docx) and Excel (.xlsx) formats.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Is my data secure?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes! All file processing happens locally in your browser. Your files never leave your device, 
                    ensuring complete privacy and security.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    What about scanned PDFs or images?
                  </h3>
                  <p className="text-muted-foreground">
                    This converter works best with text-based PDFs. For scanned documents or image-based PDFs, 
                    you may need OCR (Optical Character Recognition) capabilities which require server-side processing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PDFConverter;