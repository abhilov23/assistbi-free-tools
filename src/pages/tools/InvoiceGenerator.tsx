import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import jsPDF from "jspdf";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const InvoiceGenerator = () => {
  // Basic Invoice Info
  const [invoiceNumber, setInvoiceNumber] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [poNumber, setPoNumber] = useState("");

  // Company Info (From)
  const [fromCompany, setFromCompany] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromCityState, setFromCityState] = useState("");
  const [fromZip, setFromZip] = useState("");

  // Bill To
  const [billToCompany, setBillToCompany] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [billToCityState, setBillToCityState] = useState("");
  const [billToZip, setBillToZip] = useState("");

  // Ship To
  const [shipToCompany, setShipToCompany] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [shipToCityState, setShipToCityState] = useState("");
  const [shipToZip, setShipToZip] = useState("");

  // Items and Calculations
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 }
  ]);
  const [notes, setNotes] = useState("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  // Settings
  const [theme, setTheme] = useState("classic");
  const [currency, setCurrency] = useState("USD ($)");
  const [logo, setLogo] = useState<string | null>(null);

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

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * tax) / 100;
    return subtotal + taxAmount - discount + shipping;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const currencySymbol = currency.charAt(currency.length - 2) === '(' ? currency.slice(-2, -1) : '$';
    
    // Colors
    const primaryColor = [54, 73, 93] as const; // Dark blue-gray
    const secondaryColor = [240, 242, 245] as const; // Light gray
    const textColor = [44, 62, 80] as const; // Dark gray
    
    let yPosition = 30;
    
    // Header Section
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // Logo space (left side)
    if (logo) {
      try {
        pdf.addImage(logo, 'JPEG', margin, 15, 40, 30);
      } catch (error) {
        console.log('Logo could not be added to PDF');
      }
    }
    
    // Invoice Title (right side)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont(undefined, 'bold');
    pdf.text("TAX INVOICE", pageWidth - margin, 35, { align: 'right' });
    
    yPosition = 80;
    
    // Invoice Number and Details Box
    pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.rect(pageWidth - 80, yPosition - 10, 60, 40, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(pageWidth - 80, yPosition - 10, 60, 40, 'S');
    
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("Invoice#", pageWidth - 75, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(invoiceNumber, pageWidth - 75, yPosition + 8);
    
    pdf.setFont(undefined, 'bold');
    pdf.text("Invoice Date", pageWidth - 75, yPosition + 18);
    pdf.setFont(undefined, 'normal');
    pdf.text(date, pageWidth - 75, yPosition + 26);
    
    if (dueDate) {
      pdf.setFont(undefined, 'bold');
      pdf.text("Due Date", pageWidth - 75, yPosition + 36);
      pdf.setFont(undefined, 'normal');
      // Adjust text size if due date is long
      pdf.text(dueDate.length > 10 ? dueDate.substring(0, 10) : dueDate, pageWidth - 75, yPosition + 44);
    }
    
    // Company Information (From)
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    if (fromCompany) {
      pdf.text(fromCompany, margin, yPosition);
      yPosition += 8;
    }
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    if (fromAddress) {
      pdf.text(fromAddress, margin, yPosition);
      yPosition += 6;
    }
    if (fromCityState) {
      pdf.text(fromCityState, margin, yPosition);
      yPosition += 6;
    }
    if (fromZip) {
      pdf.text(fromZip, margin, yPosition);
    }
    
    yPosition = 140;
    
    // Bill To and Ship To Section
    const billToX = margin;
    const shipToX = pageWidth / 2 + 10;
    
    // Bill To
    pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.rect(billToX, yPosition, (pageWidth / 2) - 10, 8, 'F');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("BILL TO:", billToX + 5, yPosition + 6);
    
    yPosition += 15;
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    
    if (billToCompany) {
      pdf.setFont(undefined, 'bold');
      pdf.text(billToCompany, billToX, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 6;
    }
    if (billToAddress) {
      pdf.text(billToAddress, billToX, yPosition);
      yPosition += 6;
    }
    if (billToCityState) {
      pdf.text(billToCityState, billToX, yPosition);
      yPosition += 6;
    }
    if (billToZip) {
      pdf.text(billToZip, billToX, yPosition);
    }
    
    // Ship To (if different)
    if (shipToCompany || shipToAddress) {
      let shipYPosition = 148;
      pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.rect(shipToX, 140, (pageWidth / 2) - 30, 8, 'F');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text("SHIP TO:", shipToX + 5, 146);
      
      shipYPosition += 7;
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      
      if (shipToCompany) {
        pdf.setFont(undefined, 'bold');
        pdf.text(shipToCompany, shipToX, shipYPosition);
        pdf.setFont(undefined, 'normal');
        shipYPosition += 6;
      }
      if (shipToAddress) {
        pdf.text(shipToAddress, shipToX, shipYPosition);
        shipYPosition += 6;
      }
      if (shipToCityState) {
        pdf.text(shipToCityState, shipToX, shipYPosition);
        shipYPosition += 6;
      }
      if (shipToZip) {
        pdf.text(shipToZip, shipToX, shipYPosition);
      }
    }
    
    yPosition = 200;
    
    // Items Table
    const tableStartY = yPosition;
    const colWidths = [80, 25, 30, 35]; // Description, Qty, Rate, Amount
    const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
    
    // Table Header
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(margin, tableStartY, pageWidth - (margin * 2), 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("DESCRIPTION", colPositions[0] + 3, tableStartY + 8);
    pdf.text("QTY", colPositions[1] + 3, tableStartY + 8);
    pdf.text("RATE", colPositions[2] + 3, tableStartY + 8);
    pdf.text("AMOUNT", colPositions[3] + 3, tableStartY + 8);
    
    yPosition = tableStartY + 12;
    
    // Table Rows
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    
    const validItems = items.filter(item => item.description.trim());
    
    validItems.forEach((item, index) => {
      const rowHeight = 12;
      const isEvenRow = index % 2 === 0;
      
      // Alternate row background
      if (isEvenRow) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition, pageWidth - (margin * 2), rowHeight, 'F');
      }
      
      // Row borders
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      // Cell content
      const descLines = pdf.splitTextToSize(item.description, colWidths[0] - 6);
      pdf.text(descLines[0], colPositions[0] + 3, yPosition + 8);
      pdf.text(item.quantity.toString(), colPositions[1] + 3, yPosition + 8);
      pdf.text(`${currencySymbol}${item.rate.toFixed(2)}`, colPositions[2] + 3, yPosition + 8);
      pdf.text(`${currencySymbol}${(item.quantity * item.rate).toFixed(2)}`, colPositions[3] + 3, yPosition + 8);
      
      yPosition += rowHeight;
    });
    
    // Bottom border of table
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 20;
    
    // Totals Section
    const totalsX = pageWidth - 80;
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * tax) / 100;
    const total = calculateTotal();
    
    pdf.setFontSize(10);
    
    // Subtotal
    pdf.setFont(undefined, 'normal');
    pdf.text("Subtotal:", totalsX - 30, yPosition);
    pdf.text(`${currencySymbol}${subtotal.toFixed(2)}`, totalsX, yPosition, { align: 'right' });
    yPosition += 8;
    
    // Tax
    if (tax > 0) {
      pdf.text(`Tax (${tax}%):`, totalsX - 30, yPosition);
      pdf.text(`${currencySymbol}${taxAmount.toFixed(2)}`, totalsX, yPosition, { align: 'right' });
      yPosition += 8;
    }
    
    // Discount
    if (discount > 0) {
      pdf.setTextColor(220, 53, 69); // Red color for discount
      pdf.text("Discount:", totalsX - 30, yPosition);
      pdf.text(`-${currencySymbol}${discount.toFixed(2)}`, totalsX, yPosition, { align: 'right' });
      yPosition += 8;
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]); // Reset color
    }
    
    // Shipping
    if (shipping > 0) {
      pdf.text("Shipping:", totalsX - 30, yPosition);
      pdf.text(`${currencySymbol}${shipping.toFixed(2)}`, totalsX, yPosition, { align: 'right' });
      yPosition += 8;
    }
    
    // Total
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.line(totalsX - 35, yPosition, totalsX + 5, yPosition);
    yPosition += 5;
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text("TOTAL:", totalsX - 30, yPosition);
    pdf.text(`${currencySymbol}${total.toFixed(2)}`, totalsX, yPosition, { align: 'right' });
    
    // Notes Section
    if (notes) {
      yPosition += 25;
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text("NOTES:", margin, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      const noteLines = pdf.splitTextToSize(notes, pageWidth - (margin * 2));
      pdf.text(noteLines, margin, yPosition);
    }
    
    // Payment Terms
    if (paymentTerms) {
      yPosition += (notes ? 20 : 30);
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text("Payment Terms: ", margin, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(paymentTerms, margin + 30, yPosition);
    }
    
    return pdf;
  };

  const handleDownload = () => {
    try {
      console.log("Starting PDF generation...");
      const pdf = generatePDF();
      console.log("PDF generated successfully, attempting to save...");
      pdf.save(`invoice-${invoiceNumber}.pdf`);
      console.log("PDF save completed");
    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Free Invoice Template
          </h1>
          <p className="text-muted-foreground">
            Make beautiful invoices with one click!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Logo Upload */}
            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  {logo ? (
                    <div className="space-y-4">
                      <img src={logo} alt="Company Logo" className="h-16 mx-auto" />
                      <Button variant="outline" onClick={() => setLogo(null)}>
                        Remove Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <span className="text-primary hover:underline">+ Add Your Logo</span>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company and Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Who is this from?</h3>
                  <Input
                    placeholder="Company Name"
                    value={fromCompany}
                    onChange={(e) => setFromCompany(e.target.value)}
                  />
                  <Input
                    placeholder="Street Address"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                  />
                  <Input
                    placeholder="City, State"
                    value={fromCityState}
                    onChange={(e) => setFromCityState(e.target.value)}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={fromZip}
                    onChange={(e) => setFromZip(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Invoice Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Payment Terms</Label>
                      <Input
                        placeholder="Net 30"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>PO Number</Label>
                      <Input
                        placeholder="Optional"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bill To and Ship To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bill To */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Bill To</h3>
                  <Input
                    placeholder="Who is this to?"
                    value={billToCompany}
                    onChange={(e) => setBillToCompany(e.target.value)}
                  />
                  <Input
                    placeholder="Street Address"
                    value={billToAddress}
                    onChange={(e) => setBillToAddress(e.target.value)}
                  />
                  <Input
                    placeholder="City, State"
                    value={billToCityState}
                    onChange={(e) => setBillToCityState(e.target.value)}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={billToZip}
                    onChange={(e) => setBillToZip(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Ship To */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Ship To</h3>
                  <Input
                    placeholder="(optional)"
                    value={shipToCompany}
                    onChange={(e) => setShipToCompany(e.target.value)}
                  />
                  <Input
                    placeholder="Street Address"
                    value={shipToAddress}
                    onChange={(e) => setShipToAddress(e.target.value)}
                  />
                  <Input
                    placeholder="City, State"
                    value={shipToCityState}
                    onChange={(e) => setShipToCityState(e.target.value)}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={shipToZip}
                    onChange={(e) => setShipToZip(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Items Table */}
            <Card>
              <CardContent className="p-6">
                <div className="bg-slate-700 text-white p-3 rounded-t-lg">
                  <div className="grid grid-cols-12 gap-4 font-medium">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">Amount</div>
                  </div>
                </div>
                
                <div className="space-y-2 border border-t-0 rounded-b-lg p-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <Input
                          placeholder="Description of item/service..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex">
                          <span className="bg-muted px-2 py-2 rounded-l border">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                            className="rounded-l-none border-l-0"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 text-right font-medium">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </div>
                      <div className="col-span-1">
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
                
                <div className="mt-4">
                  <Button onClick={addItem} variant="outline" size="sm" className="text-teal-600 border-teal-600 hover:bg-teal-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Line Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="p-6">
                <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes - any relevant information not already covered"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Settings and Preview */}
          <div className="space-y-6">
            {/* Download Button */}
            <Button onClick={handleDownload} className="w-full bg-teal-600 hover:bg-teal-700">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {/* Settings */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="slate">Slate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD ($)">USD ($)</SelectItem>
                      <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                      <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                      <SelectItem value="CAD ($)">CAD ($)</SelectItem>
                      <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Preview */}
            <Card>
              <CardContent className="p-6">
                <div className="bg-white text-black p-6 rounded-lg shadow-inner min-h-[400px] text-xs">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      {logo && <img src={logo} alt="Logo" className="h-12 mb-4" />}
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold mb-2">INVOICE</h1>
                      <div># {invoiceNumber}</div>
                    </div>
                  </div>

                  {/* Company and Date Info */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      {fromCompany && <div className="font-bold">{fromCompany}</div>}
                      {fromAddress && <div>{fromAddress}</div>}
                      {fromCityState && <div>{fromCityState}</div>}
                      {fromZip && <div>{fromZip}</div>}
                    </div>
                    <div className="text-right space-y-1">
                      <div>Date: {date}</div>
                      {paymentTerms && <div>Payment Terms: {paymentTerms}</div>}
                      {dueDate && <div>Due Date: {dueDate}</div>}
                      {poNumber && <div>PO Number: {poNumber}</div>}
                    </div>
                  </div>

                  {/* Bill To / Ship To */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="font-bold mb-2">Bill To</div>
                      {billToCompany && <div>{billToCompany}</div>}
                      {billToAddress && <div>{billToAddress}</div>}
                      {billToCityState && <div>{billToCityState}</div>}
                      {billToZip && <div>{billToZip}</div>}
                    </div>
                    {(shipToCompany || shipToAddress) && (
                      <div>
                        <div className="font-bold mb-2">Ship To</div>
                        {shipToCompany && <div>{shipToCompany}</div>}
                        {shipToAddress && <div>{shipToAddress}</div>}
                        {shipToCityState && <div>{shipToCityState}</div>}
                        {shipToZip && <div>{shipToZip}</div>}
                      </div>
                    )}
                  </div>

                  {/* Items Table */}
                  <div className="mb-8">
                    <div className="bg-slate-700 text-white p-2 grid grid-cols-4 gap-2 text-xs font-medium">
                      <div>Item</div>
                      <div>Quantity</div>
                      <div>Rate</div>
                      <div>Amount</div>
                    </div>
                    {items.filter(item => item.description).map((item) => (
                      <div key={item.id} className="border-b p-2 grid grid-cols-4 gap-2">
                        <div>{item.description}</div>
                        <div>{item.quantity}</div>
                        <div>${item.rate.toFixed(2)}</div>
                        <div>${(item.quantity * item.rate).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-48 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      {tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax ({tax}%)</span>
                          <span>${((calculateSubtotal() * tax) / 100).toFixed(2)}</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      {shipping > 0 && (
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>${shipping.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {notes && (
                    <div className="mt-8 pt-4 border-t">
                      <div className="font-bold mb-2">Notes</div>
                      <div>{notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Tax (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={tax}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>
                  <div className="text-right text-xs text-muted-foreground pt-5">
                    ${tax > 0 ? ((calculateSubtotal() * tax) / 100).toFixed(2) : '0.00'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="text-teal-600 border-teal-600 text-xs">
                    + Discount
                  </Button>
                  <Button variant="outline" size="sm" className="text-teal-600 border-teal-600 text-xs">
                    + Shipping
                  </Button>
                </div>

                {/* Discount Input (shown when clicked) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Discount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>
                  <div className="text-right text-xs text-red-600 pt-5">
                    ${discount > 0 ? discount.toFixed(2) : '0.00'}
                  </div>
                </div>

                {/* Shipping Input (shown when clicked) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Shipping ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shipping}
                      onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>
                  <div className="text-right text-xs text-muted-foreground pt-5">
                    ${shipping > 0 ? shipping.toFixed(2) : '0.00'}
                  </div>
                </div>
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