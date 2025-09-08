import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, Scan, FileText, AlertCircle } from "lucide-react";

interface ExtractedData {
  invoiceNumber: string;
  date: string;
  vendor: string;
  total: string;
  items: Array<{
    description: string;
    quantity: string;
    price: string;
  }>;
}

const InvoiceOCR = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExtractedData(null);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    // Simulate OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData({
        invoiceNumber: "INV-2024-001",
        date: "2024-01-15",
        vendor: "Demo Supplier Inc.",
        total: "$1,250.00",
        items: [
          { description: "Professional Services", quantity: "10", price: "$100.00" },
          { description: "Software License", quantity: "1", price: "$250.00" }
        ]
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Scan className="h-4 w-4" />
            <span className="text-sm font-medium">Invoice OCR</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Invoice OCR Data Extraction
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Extract data from scanned invoices and receipts automatically using advanced OCR technology. 
            Convert paper documents to structured data instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-accent" />
                Upload Invoice
              </CardTitle>
              <CardDescription>
                Upload a scanned invoice, receipt, or bill for data extraction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-smooth">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="invoice-upload"
                />
                <label
                  htmlFor="invoice-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="p-4 bg-accent/10 rounded-full">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Click to upload invoice image
                    </p>
                    <p className="text-muted-foreground">
                      Supports JPG, PNG, PDF formats
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-accent" />
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

              {/* Process Button */}
              {file && (
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  {isProcessing ? (
                    "Processing Invoice..."
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Extract Data
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Extracted Data
              </CardTitle>
              <CardDescription>
                Structured data extracted from your invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extractedData ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Invoice Number</p>
                      <p className="font-medium">{extractedData.invoiceNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{extractedData.date}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Vendor</p>
                      <p className="font-medium">{extractedData.vendor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg text-accent">{extractedData.total}</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Line Items</h4>
                    <div className="space-y-2">
                      {extractedData.items.map((item, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Description</p>
                              <p className="font-medium">{item.description}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium">{item.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      Export to CSV
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Copy Data
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium">Extracted Data</p>
                    <p className="text-muted-foreground text-sm">
                      Upload an invoice to extract data
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
                    This tool requires OCR (Optical Character Recognition) integration to extract data from scanned invoices. 
                    To enable full invoice data extraction functionality, connect your project to 
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

export default InvoiceOCR;