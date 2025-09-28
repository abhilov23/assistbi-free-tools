import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, RefreshCw, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (chars === "") {
      toast.error("Please select at least one character type");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
    toast.success("Password generated successfully!");
  };

  const copyToClipboard = async () => {
    if (!password) {
      toast.error("Generate a password first");
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy password");
    }
  };

  const getStrengthColor = () => {
    if (length < 8) return "text-red-500";
    if (length < 12) return "text-yellow-500";
    return "text-green-500";
  };

  const getStrengthText = () => {
    if (length < 8) return "Weak";
    if (length < 12) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-foreground">
                Password Generator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate secure, random passwords to protect your accounts and data.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Generate Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generated Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Generated Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      value={password}
                      readOnly
                      placeholder="Click 'Generate' to create a password"
                      className="font-mono"
                    />
                    <Button
                      onClick={copyToClipboard}
                      size="icon"
                      variant="outline"
                      disabled={!password}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {password && (
                    <p className={`text-sm ${getStrengthColor()}`}>
                      Strength: {getStrengthText()}
                    </p>
                  )}
                </div>

                {/* Length Slider */}
                <div className="space-y-2">
                  <Label htmlFor="length">Password Length: {length}</Label>
                  <Input
                    id="length"
                    type="range"
                    min="4"
                    max="128"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* Character Options */}
                <div className="space-y-3">
                  <Label>Include Characters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uppercase"
                        checked={includeUppercase}
                        onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
                      />
                      <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lowercase"
                        checked={includeLowercase}
                        onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
                      />
                      <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="numbers"
                        checked={includeNumbers}
                        onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
                      />
                      <Label htmlFor="numbers">Numbers (0-9)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="symbols"
                        checked={includeSymbols}
                        onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
                      />
                      <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generatePassword} className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Password
                </Button>

                {/* Security Tips */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Password Security Tips:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use unique passwords for each account</li>
                    <li>• Use a password manager to store passwords securely</li>
                    <li>• Enable two-factor authentication when available</li>
                    <li>• Avoid using personal information in passwords</li>
                  </ul>
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

export default PasswordGenerator;