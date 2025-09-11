import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PDFConverter from "./pages/tools/PDFConverter";
import QRGenerator from "./pages/tools/QRGenerator";
import InvoiceGenerator from "./pages/tools/InvoiceGenerator";
import PDFExporter from "./pages/tools/PDFExporter";
import URLShortener from "./pages/tools/URLShortener";
import DocumentSummarizer from "./pages/tools/DocumentSummarizer";
import GrammarChecker from "./pages/tools/GrammarChecker";
import ResumeBuilder from "./pages/tools/ResumeBuilder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/pdf-converter" element={<PDFConverter />} />
          <Route path="/tools/qr-generator" element={<QRGenerator />} />
          <Route path="/tools/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/tools/pdf-exporter" element={<PDFExporter />} />
          <Route path="/tools/url-shortener" element={<URLShortener />} />
          <Route path="/tools/document-summarizer" element={<DocumentSummarizer />} />
          <Route path="/tools/grammar-checker" element={<GrammarChecker />} />
          <Route path="/tools/resume-builder" element={<ResumeBuilder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
