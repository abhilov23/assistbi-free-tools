import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Languages, ArrowRightLeft, Copy, Volume2, VolumeX } from "lucide-react";
import { aiApiManager } from "@/lib/ai-api-manager";

const LanguageTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check if Language Translator has API key
  const hasApiKey = aiApiManager.hasKey('translator');

  const languages = [
    { code: "auto", name: "Auto-detect" },
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },
    { code: "nl", name: "Dutch" },
    { code: "sv", name: "Swedish" },
    { code: "no", name: "Norwegian" },
    { code: "da", name: "Danish" },
    { code: "fi", name: "Finnish" },
    { code: "pl", name: "Polish" },
    { code: "cs", name: "Czech" },
    { code: "sk", name: "Slovak" },
    { code: "hu", name: "Hungarian" },
    { code: "ro", name: "Romanian" },
    { code: "bg", name: "Bulgarian" },
    { code: "hr", name: "Croatian" },
    { code: "sr", name: "Serbian" },
    { code: "sl", name: "Slovenian" },
    { code: "et", name: "Estonian" },
    { code: "lv", name: "Latvian" },
    { code: "lt", name: "Lithuanian" },
    { code: "tr", name: "Turkish" },
    { code: "he", name: "Hebrew" },
    { code: "fa", name: "Persian" },
    { code: "ur", name: "Urdu" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "gu", name: "Gujarati" },
    { code: "mr", name: "Marathi" },
    { code: "ne", name: "Nepali" },
    { code: "si", name: "Sinhala" },
    { code: "my", name: "Myanmar" },
    { code: "km", name: "Khmer" },
    { code: "lo", name: "Lao" },
    { code: "ka", name: "Georgian" },
    { code: "am", name: "Amharic" },
    { code: "sw", name: "Swahili" },
    { code: "zu", name: "Zulu" },
    { code: "af", name: "Afrikaans" },
    { code: "sq", name: "Albanian" },
    { code: "az", name: "Azerbaijani" },
    { code: "be", name: "Belarusian" },
    { code: "bs", name: "Bosnian" },
    { code: "eu", name: "Basque" },
    { code: "ca", name: "Catalan" },
    { code: "cy", name: "Welsh" },
    { code: "eo", name: "Esperanto" },
    { code: "gl", name: "Galician" },
    { code: "is", name: "Icelandic" },
    { code: "ga", name: "Irish" },
    { code: "mk", name: "Macedonian" },
    { code: "mt", name: "Maltese" },
    { code: "mn", name: "Mongolian" },
    { code: "uk", name: "Ukrainian" },
    { code: "uz", name: "Uzbek" },
    { code: "yi", name: "Yiddish" }
  ];

  const handleTranslate = async () => {
    if (!hasApiKey) {
      alert("Language Translator API key not found. Please add VITE_GEMINI_TRANSLATOR_API_KEY to your environment variables.");
      return;
    }

    if (!inputText.trim()) {
      alert("Please enter text to translate");
      return;
    }

    setIsTranslating(true);
    
    try {
      const sourceLangName = languages.find(lang => lang.code === sourceLang)?.name || "auto-detect";
      const targetLangName = languages.find(lang => lang.code === targetLang)?.name || "English";

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Only provide the translation, no additional text or explanations:

"${inputText}"`;

      const translation = await aiApiManager.makeRequest('translator', prompt);
      
      setTranslatedText(translation.trim());
    } catch (error) {
      console.error("Translation error:", error);
      alert("Error translating text. Please check your API key and try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang !== "auto") {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleTextToSpeech = (text: string, lang: string) => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-6 py-3 rounded-full mb-6 shadow-subtle hover-scale transition-all duration-300 animate-scale-in">
            <Languages className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Language Translator</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 animate-slide-up">
            AI-Powered Language Translator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Translate text between 60+ languages with high accuracy using Google's Gemini AI.
            Perfect for communication, learning, and global business.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Translation Interface */}
          <Card className="shadow-elegant border-2 bg-card/50 backdrop-blur-sm animate-fade-in">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Translation</span>
                  {!hasApiKey ? (
                    <span className="text-sm text-destructive">⚠️ Translator API Key Missing</span>
                  ) : (
                    <span className="text-sm text-primary">✓ Translator Ready</span>
                  )}
                </CardTitle>
              <CardDescription>
                Select languages and enter text to translate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapLanguages}
                    disabled={sourceLang === "auto"}
                    className="rounded-full p-2 h-10 w-10"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {languages.filter(lang => lang.code !== "auto").map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Text Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Original Text</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTextToSpeech(inputText, sourceLang)}
                        disabled={!inputText || sourceLang === "auto"}
                        className="h-8 w-8 p-0"
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Enter text to translate..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-32"
                  />
                  <div className="text-sm text-muted-foreground">
                    {inputText.length} characters
                  </div>
                </div>

                {/* Translated Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Translation</Label>
                    {translatedText && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTextToSpeech(translatedText, targetLang)}
                          className="h-8 w-8 p-0"
                        >
                          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translatedText)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Textarea
                    placeholder="Translation will appear here..."
                    value={translatedText}
                    readOnly
                    className="min-h-32 bg-muted/50"
                  />
                  <div className="text-sm text-muted-foreground">
                    {translatedText.length} characters
                  </div>
                </div>
              </div>

              {/* Translate Button */}
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !hasApiKey || !inputText}
                className="w-full"
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    Translate Text
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LanguageTranslator;