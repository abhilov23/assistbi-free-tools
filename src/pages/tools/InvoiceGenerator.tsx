import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Receipt, Plus, Trash2, Download, Eye } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const InvoiceGenerator = () => {
  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 }
  ]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  };

  const handlePreview = () => {
    alert("Invoice preview would open here (Demo mode)");
  };

  const handleDownload = () => {
    alert("Invoice PDF download would start here (Demo mode)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Receipt className="h-4 w-4" />
            <span className="text-sm font-medium">Invoice Generator</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Professional Invoice Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional invoices with custom branding and automatic calculations. 
            Perfect for freelancers and small businesses.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-accent" />
                Invoice Details
              </CardTitle>
              <CardDescription>
                Fill in your business and client information to generate a professional invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Business & Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Business</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        placeholder="Your Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-address">Business Address</Label>
                      <Textarea
                        id="business-address"
                        placeholder="123 Business St, City, State 12345"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Bill To</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="client">Client Name</Label>
                      <Input
                        id="client"
                        placeholder="Client Company Name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-address">Client Address</Label>
                      <Textarea
                        id="client-address"
                        placeholder="123 Client St, City, State 12345"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    placeholder="INV-001"
                    defaultValue="INV-001"
                  />
                </div>
                <div>
                  <Label htmlFor="issue-date">Issue Date</Label>
                  <Input
                    id="issue-date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Line Items</h3>
                  <Button onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-6">
                        {index === 0 && <Label className="text-sm">Description</Label>}
                        <Input
                          placeholder="Service or product description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-sm">Qty</Label>}
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-sm">Rate</Label>}
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        {index === 0 && <Label className="text-sm">Total</Label>}
                        <div className="h-10 flex items-center text-sm font-medium">
                          ${(item.quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {index === 0 && <div className="h-5"></div>}
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                      <div className="text-2xl font-bold text-foreground">
                        ${calculateTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button onClick={handlePreview} variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Invoice
                </Button>
                <Button onClick={handleDownload} className="flex-1" variant="success">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Professional Design</h3>
                <p className="text-muted-foreground text-sm">
                  Clean, professional invoice templates that make a great impression
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Auto Calculations</h3>
                <p className="text-muted-foreground text-sm">
                  Automatic totals, tax calculations, and currency formatting
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">PDF Export</h3>
                <p className="text-muted-foreground text-sm">
                  Download professional PDF invoices ready to send to clients
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

export default InvoiceGenerator;