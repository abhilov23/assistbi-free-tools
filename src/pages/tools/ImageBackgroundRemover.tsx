import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Upload, Download, Image as ImageIcon, Scissors, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Use a model specifically designed for background removal/salient object detection
    const segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with background removal model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply mask to alpha channel - RMBG model outputs foreground mask directly
    const maskData = result[0].mask.data;
    for (let i = 0; i < maskData.length; i++) {
      // Use mask value directly as alpha (normalized to 0-255)
      const alpha = Math.round(maskData[i] * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    
    // Fallback to a different approach if the primary model fails
    try {
      console.log('Trying fallback segmentation approach...');
      
      const segmenter = await pipeline('image-segmentation', 'Xenova/detr-resnet-50-panoptic', {
        device: 'webgpu',
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      resizeImageIfNeeded(canvas, ctx, imageElement);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      const result = await segmenter(imageData);
      console.log('Fallback segmentation result:', result);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Fallback segmentation failed');
      }
      
      // Find person or main object segments
      const personSegments = result.filter(segment => 
        segment.label && (
          segment.label.toLowerCase().includes('person') ||
          segment.label.toLowerCase().includes('people') ||
          segment.label.toLowerCase().includes('human')
        )
      );
      
      const targetSegment = personSegments.length > 0 ? personSegments[0] : result[0];
      
      if (!targetSegment.mask) {
        throw new Error('No valid mask in fallback result');
      }
      
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) throw new Error('Could not get output canvas context');
      
      outputCtx.drawImage(canvas, 0, 0);
      
      const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const data = outputImageData.data;
      
      // Apply mask
      const maskData = targetSegment.mask.data;
      for (let i = 0; i < maskData.length; i++) {
        const alpha = Math.round(maskData[i] * 255);
        data[i * 4 + 3] = alpha;
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      
      return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Fallback processing successful');
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from fallback'));
            }
          },
          'image/png',
          1.0
        );
      });
      
    } catch (fallbackError) {
      console.error('Fallback processing also failed:', fallbackError);
      throw new Error('Background removal failed with both primary and fallback methods');
    }
  }
};

const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const ImageBackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, WEBP, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setOriginalImage(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setOriginalImageUrl(imageUrl);
    setProcessedImageUrl(null);

    toast({
      title: "Image uploaded",
      description: "Ready for background removal",
    });
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    try {
      if (!modelLoaded) {
        toast({
          title: "Loading AI model",
          description: "This may take a moment on first use...",
        });
        setModelLoaded(true);
      }

      // Load the image
      const imageElement = await loadImage(originalImage);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImageUrl(processedUrl);

      toast({
        title: "Background removed successfully!",
        description: "Your image is ready for download",
      });

    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "Unable to remove background. Try a different image or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImageUrl || !originalImage) return;

    const link = document.createElement('a');
    link.href = processedImageUrl;
    const fileName = originalImage.name.replace(/\.[^/.]+$/, '') + '_no_bg.png';
    link.download = fileName;
    link.click();

    toast({
      title: "Download started",
      description: `Saving as ${fileName}`,
    });
  };

  const resetAll = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Scissors className="h-4 w-4" />
            <span className="text-sm font-medium">Background Remover</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Image Background Remover
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Remove image backgrounds instantly using advanced AI. Perfect for product photos, 
            profile pictures, and design projects.
          </p>
        </div>

        {/* Main Tool */}
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-large border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-accent" />
                Upload Your Image
              </CardTitle>
              <CardDescription>
                Select an image to remove its background. Supports JPG, PNG, WEBP formats up to 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-smooth">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="p-4 bg-accent/10 rounded-full">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Click to upload image
                    </p>
                    <p className="text-muted-foreground">
                      Or drag and drop your image here
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Preview & Processing */}
              {originalImage && (
                <div className="space-y-6">
                  {/* Image Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Original Image</h3>
                      <div className="relative bg-muted/50 rounded-lg overflow-hidden">
                        {originalImageUrl && (
                          <img
                            src={originalImageUrl}
                            alt="Original"
                            className="w-full h-auto max-h-96 object-contain"
                          />
                        )}
                      </div>
                    </div>

                    {/* Processed Image */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Background Removed</h3>
                      <div className="relative bg-muted/50 rounded-lg overflow-hidden min-h-48 flex items-center justify-center">
                        {isProcessing ? (
                          <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Processing image...</p>
                            <p className="text-sm text-muted-foreground mt-2">This may take 30-60 seconds</p>
                          </div>
                        ) : processedImageUrl ? (
                          <img
                            src={processedImageUrl}
                            alt="Background removed"
                            className="w-full h-auto max-h-96 object-contain"
                            style={{
                              background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px'
                            }}
                          />
                        ) : (
                          <div className="text-center p-8">
                            <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Processed image will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      onClick={handleRemoveBackground}
                      disabled={isProcessing}
                      size="lg"
                      className="min-w-32"
                    >
                      {isProcessing ? "Processing..." : "Remove Background"}
                    </Button>
                    
                    {processedImageUrl && (
                      <Button
                        onClick={handleDownload}
                        variant="secondary"
                        size="lg"
                        className="min-w-32"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PNG
                      </Button>
                    )}
                    
                    <Button
                      onClick={resetAll}
                      variant="outline"
                      size="lg"
                    >
                      Try Another Image
                    </Button>
                  </div>

                  {/* Success Message */}
                  {processedImageUrl && (
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800 dark:text-green-200 mb-1">Background Removed Successfully!</p>
                          <p className="text-green-700 dark:text-green-300">
                            Your image is ready for download as a PNG file with transparent background.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Processing Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">AI-Powered Processing</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      This tool uses advanced machine learning models that run entirely in your browser. 
                      The first use may take longer as the AI model downloads (~50MB).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Precise AI Removal</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced machine learning algorithms detect and remove backgrounds with high accuracy
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Privacy Focused</h3>
                <p className="text-muted-foreground text-sm">
                  All processing happens in your browser - your images never leave your device
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">PNG Output</h3>
                <p className="text-muted-foreground text-sm">
                  Download your image as a high-quality PNG with transparent background
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

export default ImageBackgroundRemover;
