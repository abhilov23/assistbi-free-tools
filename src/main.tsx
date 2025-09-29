import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// CRITICAL FIX: Configure PDF.js worker globally
// This fixes all PDF-related tools (converter, exporter, etc.)
import * as pdfjsLib from 'pdfjs-dist';

// Use CDN worker to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Log confirmation (remove in production)
console.log('PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);

createRoot(document.getElementById("root")!).render(<App />);