// AI API Manager - Handles dedicated API keys for each tool

export type AITool = 'business-card' | 'translator' | 'content-generator' | 'grammar-checker';

class AIApiManager {
  private getToolApiKey(tool: AITool): string | null {
    switch (tool) {
      case 'business-card':
        return import.meta.env.VITE_GEMINI_BUSINESS_CARD_API_KEY || null;
      case 'translator':
        return import.meta.env.VITE_GEMINI_TRANSLATOR_API_KEY || null;
      case 'content-generator':
        return import.meta.env.VITE_GEMINI_CONTENT_GENERATOR_API_KEY || null;
      case 'grammar-checker':
        return import.meta.env.VITE_GEMINI_GRAMMAR_CHECKER_API_KEY || null;
      default:
        return null;
    }
  }

  hasKey(tool: AITool): boolean {
    const key = this.getToolApiKey(tool);
    return !!(key && key !== `your_gemini_${tool.replace('-', '_')}_api_key_here`);
  }

  async makeRequest(tool: AITool, prompt: string, systemMessage?: string): Promise<string> {
    const apiKey = this.getToolApiKey(tool);
    
    if (!apiKey || apiKey.includes('your_gemini_')) {
      throw new Error(`No API key found for ${tool}. Please add VITE_GEMINI_${tool.toUpperCase().replace('-', '_')}_API_KEY to your environment variables.`);
    }

    try {
      const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
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