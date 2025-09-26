// AI API Manager - Handles dedicated API keys for each tool

export type AITool = 'business-card' | 'translator' | 'content-generator' | 'grammar-checker';

class AIApiManager {
  private getToolApiKey(tool: AITool): string | null {
    // Debug logging
    console.log('Getting API key for tool:', tool);
    console.log('Environment variables:', {
      business: import.meta.env.VITE_GEMINI_BUSINESS_CARD_API_KEY,
      translator: import.meta.env.VITE_GEMINI_TRANSLATOR_API_KEY,
      content: import.meta.env.VITE_GEMINI_CONTENT_GENERATOR_API_KEY,
      grammar: import.meta.env.VITE_GEMINI_GRAMMAR_CHECKER_API_KEY
    });

    // Temporary hardcoded keys as fallback
    const fallbackKeys = {
      'business-card': 'AIzaSyCh24UK7ZRCbGKiqmSNdbTkCaubs2dFugY',
      'translator': 'AIzaSyCRypuulmrza_jqhzYcRGpMhh3Qpec1Vr4',
      'content-generator': 'AIzaSyBPuj3nzXLmu2rgwao2NHNy1waglQPLprY',
      'grammar-checker': 'AIzaSyB6ZUGx78hFbXQiMxTjyu_jeGri9p1BLiw'
    };

    switch (tool) {
      case 'business-card':
        return import.meta.env.VITE_GEMINI_BUSINESS_CARD_API_KEY || fallbackKeys['business-card'];
      case 'translator':
        return import.meta.env.VITE_GEMINI_TRANSLATOR_API_KEY || fallbackKeys['translator'];
      case 'content-generator':
        return import.meta.env.VITE_GEMINI_CONTENT_GENERATOR_API_KEY || fallbackKeys['content-generator'];
      case 'grammar-checker':
        return import.meta.env.VITE_GEMINI_GRAMMAR_CHECKER_API_KEY || fallbackKeys['grammar-checker'];
      default:
        return null;
    }
  }

  hasKey(tool: AITool): boolean {
    const key = this.getToolApiKey(tool);
    console.log('HasKey check for', tool, ':', key ? 'FOUND' : 'NOT FOUND');
    return !!(key && key !== `your_gemini_${tool.replace('-', '_')}_api_key_here`);
  }

  async makeRequest(tool: AITool, prompt: string, systemMessage?: string): Promise<string> {
    const apiKey = this.getToolApiKey(tool);
    
    if (!apiKey || apiKey.includes('your_gemini_')) {
      throw new Error(`No API key found for ${tool}. Please add VITE_GEMINI_${tool.toUpperCase().replace('-', '_')}_API_KEY to your environment variables.`);
    }

    try {
      const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 429) {
          // Handle quota exceeded specifically
          throw new Error(`Quota exceeded for ${tool}. Your Gemini API free tier limit has been reached. Please wait or upgrade your API plan.`);
        }
        
        throw new Error(`Gemini API error for ${tool}: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      }
      
      throw new Error(`No content generated from Gemini for ${tool}`);
    } catch (error) {
      console.error(`Error calling Gemini API for ${tool}:`, error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  getGeminiKey(): string | null {
    // Try to get any available key as fallback
    return this.getToolApiKey('business-card') || 
           this.getToolApiKey('translator') || 
           this.getToolApiKey('content-generator') || 
           this.getToolApiKey('grammar-checker');
  }

  // Method to get available tools
  getAvailableTools(): AITool[] {
    const tools: AITool[] = ['business-card', 'translator', 'content-generator', 'grammar-checker'];
    return tools.filter(tool => this.hasKey(tool));
  }
}

// Export singleton instance
export const aiApiManager = new AIApiManager();