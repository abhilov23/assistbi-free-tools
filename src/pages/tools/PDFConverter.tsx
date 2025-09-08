import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, FileText, Download, AlertCircle, Eye } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as XLSX from 'xlsx';

const PDFConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<{pages: number, size: string} | null>(null);
  const [conversionType, setConversionType] = useState<'word' | 'excel' | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Extract PDF info for preview
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        const fileSizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
        
        setPdfInfo({
          pages: pageCount,
          size: fileSizeMB
        });
      } catch (error) {
        console.error('Error reading PDF:', error);
        setPdfInfo(null);
      }
    }
  };

  const handleConvert = (type: 'word' | 'excel') => {
    console.log('handleConvert called with type:', type);
    if (!file) {
      console.log('No file selected');
      return;
    }
    setIsConverting(true);
    setConversionType(type);
    
    // Simulate conversion process with realistic timing
    setTimeout(() => {
      console.log('Starting conversion for type:', type);
      setIsConverting(false);
      
      const fileName = file.name.replace('.pdf', '');
      console.log('File name for conversion:', fileName);
      
      if (type === 'word') {
        console.log('Creating Word/RTF file');
        // Create RTF content that Word can open
        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 
\\b Demo Word Document\\b0\\par
\\par
Converted from: ${file.name}\\par
\\par
This is a demonstration of PDF to Word conversion.\\par
\\par
In a full implementation, this would contain:\\par
• Extracted text from the PDF\\par
• Preserved formatting and layout\\par
• Tables and images from the original document\\par
• Proper paragraph structure\\par
\\par
\\b Note:\\b0 Connect to Supabase for advanced OCR and real document conversion.
}`;
        
        const blob = new Blob([rtfContent], { type: 'application/rtf' });
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = `${fileName}.rtf`;
        console.log('Downloading RTF file:', `${fileName}.rtf`);
        element.click();
      } else {
        console.log('Creating Excel file using XLSX library');
        // Create Excel file using xlsx library
        const worksheetData = [
          ['PDF Conversion Demo'],
          [''],
          ['Original File:', file.name],
          ['Conversion Date:', new Date().toLocaleDateString()],
          ['Pages:', pdfInfo?.pages || 'Unknown'],
          ['File Size (MB):', pdfInfo?.size || 'Unknown'],
          [''],
          ['Sample Data Table:'],
          ['Column A', 'Column B', 'Column C'],
          ['Data 1', 'Data 2', 'Data 3'],
          ['Row 2', 'Content B2', 'Content C2'],
          ['Row 3', 'Content B3', 'Content C3'],
          [''],
          ['Note:', 'Connect to Supabase for real PDF data extraction']
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PDF Conversion');
        
        // Generate Excel file and download
        console.log('Downloading Excel file:', `${fileName}.xlsx`);
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        console.log('Excel file download completed');
      }
      
      setConversionType(null);
    }, 3000);
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
            PDF to Word/Excel Converter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert your PDF files to editable Word documents or Excel spreadsheets in seconds. 
            No installation required, completely free.
          </p>
        </div>

        {/* Main Tool */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Your PDF
              </CardTitle>
              <CardDescription>
                Select a PDF file to convert to Word or Excel format. Max file size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-smooth">
                <input
                  type="file"
                  accept=".pdf"
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
                      Click to upload PDF file
                    </p>
                    <p className="text-muted-foreground">
                      Or drag and drop your file here
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
                          {pdfInfo ? `${pdfInfo.pages} pages • ${pdfInfo.size} MB` : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setFile(null);
                        setPdfInfo(null);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {pdfInfo && (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-background/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{pdfInfo.pages}</div>
                        <div className="text-xs text-muted-foreground">Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">{pdfInfo.size}</div>
                        <div className="text-xs text-muted-foreground">MB</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent">PDF</div>
                        <div className="text-xs text-muted-foreground">Ready</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Convert Options */}
              {file && (
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
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Backend Integration Required</p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Full PDF conversion requires backend processing with OCR and document analysis. 
                          Connect to Supabase to enable real PDF to Word/Excel conversion with proper formatting, tables, and images.
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
                    Our converter supports standard PDF files and can convert them to Microsoft Word (.docx) 
                    and Excel (.xlsx) formats with high fidelity.
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
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Demo Mode Notice
                      </h3>
                      <p className="text-muted-foreground">
                        This is a demonstration interface. In the full version, actual PDF conversion 
                        would be performed using advanced OCR and document processing algorithms.
                      </p>
                    </div>
                  </div>
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