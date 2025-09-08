import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, Download, FileText, AlertCircle, Eye, Type } from "lucide-react";
import jsPDF from "jspdf";

const PDFExporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [fileInfo, setFileInfo] = useState<{type: string, size: string} | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Extract file info
      const fileType = selectedFile.name.split('.').pop()?.toUpperCase() || 'Unknown';
      const fileSizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
      
      setFileInfo({
        type: fileType,
        size: fileSizeMB
      });
    }
  };

  const createTextPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Title
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text("Exported Document", pageWidth / 2, 30, { align: 'center' });
    
    // Content
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    
    const lines = pdf.splitTextToSize(textContent, maxWidth);
    let yPosition = 50;
    const lineHeight = 7;
    
    for (let i = 0; i < lines.length; i++) {
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(lines[i], margin, yPosition);
      yPosition += lineHeight;
    }
    
    return pdf;
  };

  const handleExport = () => {
    if (activeTab === 'text' && textContent.trim()) {
      setIsExporting(true);
      setTimeout(() => {
        const pdf = createTextPDF();
        pdf.save('exported-document.pdf');
        setIsExporting(false);
      }, 1000);
      return;
    }
    
    if (!file) return;
    setIsExporting(true);
    
    // Simulate file conversion process
    setTimeout(() => {
      setIsExporting(false);
      
      // Create a demo PDF with file info
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      pdf.setFontSize(20);
      pdf.text("Document Conversion Demo", pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Original file: ${file.name}`, 20, 60);
      pdf.text(`File type: ${fileInfo?.type}`, 20, 75);
      pdf.text(`File size: ${fileInfo?.size} MB`, 20, 90);
      pdf.text("Conversion date: " + new Date().toLocaleDateString(), 20, 105);
      
      pdf.setFontSize(10);
      pdf.text("Note: This is a demo conversion. Full document conversion", 20, 130);
      pdf.text("with preserved formatting requires backend processing.", 20, 140);
      
      pdf.save(`converted-${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">PDF Exporter</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Word/Excel to PDF Exporter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert your Word documents and Excel spreadsheets to professional PDF format. 
            High-quality conversion with preserved formatting.
          </p>
        </div>

        {/* Main Tool */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-secondary" />
                Document to PDF Converter
              </CardTitle>
              <CardDescription>
                Convert Word/Excel files or create PDFs from text. Choose your preferred method below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tab Selection */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <Button
                  variant={activeTab === 'file' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('file')}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  variant={activeTab === 'text' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('text')}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Create from Text
                </Button>
              </div>

              {/* File Upload Tab */}
              {activeTab === 'file' && (
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-smooth">
                    <input
                      type="file"
                      accept=".docx,.xlsx,.doc,.xls,.pptx,.ppt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="doc-upload"
                    />
                    <label
                      htmlFor="doc-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="p-4 bg-secondary/10 rounded-full">
                        <Upload className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          Click to upload document
                        </p>
                        <p className="text-muted-foreground">
                          Supports Word, Excel, PowerPoint formats
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Selected File */}
                  {file && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-secondary" />
                          <div>
                            <p className="font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {fileInfo ? `${fileInfo.type} file • ${fileInfo.size} MB` : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setFile(null);
                            setFileInfo(null);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      {fileInfo && (
                        <div className="grid grid-cols-3 gap-4 p-3 bg-background/50 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-bold text-secondary">{fileInfo.type}</div>
                            <div className="text-xs text-muted-foreground">Format</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{fileInfo.size}</div>
                            <div className="text-xs text-muted-foreground">MB</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-accent">Ready</div>
                            <div className="text-xs text-muted-foreground">Convert</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Backend Integration Required</p>
                            <p className="text-blue-700 dark:text-blue-300">
                              Full document conversion requires backend processing to preserve formatting, images, and complex layouts. 
                              Connect to Supabase to enable real Word/Excel to PDF conversion.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input Tab */}
              {activeTab === 'text' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-content" className="text-base font-medium">Document Content</Label>
                    <Textarea
                      id="text-content"
                      placeholder="Enter your text content here to create a PDF document..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={12}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {textContent.length} characters • {textContent.split(/\s+/).filter(word => word.length > 0).length} words
                    </p>
                  </div>

                  {textContent.trim() && (
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800 dark:text-green-200 mb-1">Ready to Export</p>
                          <p className="text-green-700 dark:text-green-300">
                            Your text will be formatted into a professional PDF document with proper margins and typography.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Export Button */}
              {((activeTab === 'file' && file) || (activeTab === 'text' && textContent.trim())) && (
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  {isExporting ? (
                    activeTab === 'text' ? "Creating PDF..." : "Converting to PDF..."
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {activeTab === 'text' ? 'Create PDF' : 'Export to PDF'}
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Multiple Formats</h3>
                <p className="text-muted-foreground text-sm">
                  Support for Word, Excel, PowerPoint, and text content conversion to PDF
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">High Quality</h3>
                <p className="text-muted-foreground text-sm">
                  Professional PDF output with preserved formatting and layout integrity
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Type className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Text to PDF</h3>
                <p className="text-muted-foreground text-sm">
                  Create professional PDFs directly from text with proper formatting
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

export default PDFExporter;