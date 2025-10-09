import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Use the build meant for browsers
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// ✅ Configure global worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

console.log("PDF.js worker configured:", pdfjsLib.GlobalWorkerOptions.workerSrc);

createRoot(document.getElementById("root")!).render(<App />);
