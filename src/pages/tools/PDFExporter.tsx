import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, Download, FileText } from "lucide-react";

const PDFExporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleExport = () => {
    if (!file) return;
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert("PDF export complete! (Demo mode - no actual export performed)");
    }, 2000);
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
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-secondary" />
                Upload Your Document
              </CardTitle>
              <CardDescription>
                Select a Word (.docx) or Excel (.xlsx) file to convert to PDF format. Max file size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-smooth">
                <input
                  type="file"
                  accept=".docx,.xlsx,.doc,.xls"
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
                      Click to upload Word or Excel file
                    </p>
                    <p className="text-muted-foreground">
                      Supports .docx, .xlsx, .doc, .xls formats
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-secondary" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setFile(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {/* Export Button */}
              {file && (
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  {isExporting ? (
                    "Exporting to PDF..."
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export to PDF
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PDFExporter;