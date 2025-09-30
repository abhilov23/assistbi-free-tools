import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Palette, Copy, RefreshCw, Plus, Trash2, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ColorPaletteTool = () => {
  const { toast } = useToast();
  const [colors, setColors] = useState([
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#43e97b"
  ]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const generatePalette = () => {
    const newColors = Array(5).fill(null).map(() => generateRandomColor());
    setColors(newColors);
    toast({
      title: "Palette Generated",
      description: "5 new colors generated",
    });
  };

  const generateComplementaryPalette = () => {
    const baseColor = generateRandomColor();
    const base = parseInt(baseColor.slice(1), 16);
    const r = (base >> 16) & 255;
    const g = (base >> 8) & 255;
    const b = base & 255;

    const newColors = [
      baseColor,
      '#' + ((255 - r) * 0x10000 + (255 - g) * 0x100 + (255 - b)).toString(16).padStart(6, '0'),
      '#' + ((r * 0.7) * 0x10000 + (g * 0.7) * 0x100 + (b * 0.7)).toString(16).padStart(6, '0'),
      '#' + ((r * 1.3) * 0x10000 + (g * 1.3) * 0x100 + (b * 1.3)).toString(16).padStart(6, '0').slice(0, 6),
      '#' + ((r * 0.5) * 0x10000 + (g * 1.2) * 0x100 + (b * 0.8)).toString(16).padStart(6, '0').slice(0, 6),
    ];
    setColors(newColors);
    toast({
      title: "Complementary Palette",
      description: "Generated based on color theory",
    });
  };

  const generateMonochromaticPalette = () => {
    const baseColor = generateRandomColor();
    const base = parseInt(baseColor.slice(1), 16);
    const r = (base >> 16) & 255;
    const g = (base >> 8) & 255;
    const b = base & 255;

    const newColors = [0.3, 0.5, 0.7, 0.9, 1.1].map(factor => {
      const newR = Math.min(255, Math.floor(r * factor));
      const newG = Math.min(255, Math.floor(g * factor));
      const newB = Math.min(255, Math.floor(b * factor));
      return '#' + (newR * 0x10000 + newG * 0x100 + newB).toString(16).padStart(6, '0');
    });
    setColors(newColors);
    toast({
      title: "Monochromatic Palette",
      description: "Shades of the same color",
    });
  };

  const copyColor = (color, index, format = 'hex') => {
    let textToCopy = color;
    
    if (format === 'rgb') {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      textToCopy = `rgb(${r}, ${g}, ${b})`;
    } else if (format === 'hsl') {
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      textToCopy = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    
    toast({
      title: "Copied!",
      description: `${textToCopy} copied to clipboard`,
    });
  };

  const addColor = () => {
    if (colors.length < 10) {
      setColors([...colors, generateRandomColor()]);
    }
  };

  const removeColor = (index) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const updateColor = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  const exportPalette = () => {
    const cssVars = colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n');
    const css = `:root {\n${cssVars}\n}`;
    
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-palette.css';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "CSS file downloaded",
    });
  };

  const getLuminance = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getTextColor = (bgColor) => {
    return getLuminance(bgColor) > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6 shadow-soft">
            <Palette className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Color Palette Generator</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Color Palette Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate beautiful color palettes for your projects with HEX, RGB, and HSL codes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <Card className="shadow-large border-2 bg-card lg:col-span-1">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <RefreshCw className="h-5 w-5 text-primary" />
                Generate Palette
              </CardTitle>
              <CardDescription>
                Choose a generation method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Button
                onClick={generatePalette}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Random Palette
              </Button>

              <Button
                onClick={generateComplementaryPalette}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Palette className="h-4 w-4 mr-2" />
                Complementary
              </Button>

              <Button
                onClick={generateMonochromaticPalette}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Palette className="h-4 w-4 mr-2" />
                Monochromatic
              </Button>

              <div className="border-t-2 pt-4 mt-4">
                <Button
                  onClick={addColor}
                  variant="outline"
                  className="w-full mb-3"
                  disabled={colors.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color ({colors.length}/10)
                </Button>

                <Button
                  onClick={exportPalette}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSS
                </Button>
              </div>

              <div className="border-t-2 pt-4 mt-4 space-y-3">
                <Label className="text-sm font-semibold">Color Format</Label>
                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Click color box to copy HEX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Click RGB button to copy RGB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    <span>Click HSL button to copy HSL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Large Color Blocks */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colors.map((color, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-large border-2 hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => copyColor(color, index)}
                >
                  <div
                    className="h-32 relative flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    {copiedIndex === index ? (
                      <Check className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: getTextColor(color) }} />
                    ) : (
                      <Copy className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: getTextColor(color) }} />
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={color.toUpperCase()}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColor(index);
                        }}
                        className="ml-2"
                        disabled={colors.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyColor(color, index, 'rgb');
                        }}
                      >
                        RGB
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyColor(color, index, 'hsl');
                        }}
                      >
                        HSL
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Color Codes */}
            <Card className="shadow-large border-2 bg-card">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-foreground">Color Codes</CardTitle>
                <CardDescription>
                  All formats for your palette
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {colors.map((color, index) => {
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    
                    const rNorm = r / 255;
                    const gNorm = g / 255;
                    const bNorm = b / 255;
                    const max = Math.max(rNorm, gNorm, bNorm);
                    const min = Math.min(rNorm, gNorm, bNorm);
                    let h, s, l = (max + min) / 2;

                    if (max === min) {
                      h = s = 0;
                    } else {
                      const d = max - min;
                      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                      switch (max) {
                        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
                        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
                        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
                      }
                    }

                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">HEX:</span>
                            <span className="font-semibold">{color.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">RGB:</span>
                            <span className="font-semibold">{r}, {g}, {b}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">HSL:</span>
                            <span className="font-semibold">
                              {Math.round(h * 360)}°, {Math.round(s * 100)}%, {Math.round(l * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Smart Generation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate random, complementary, or monochromatic color schemes
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Copy className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Multiple Formats</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy colors in HEX, RGB, or HSL format with one click
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Download className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">Export Ready</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Export your palette as CSS variables ready to use
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ColorPaletteTool;