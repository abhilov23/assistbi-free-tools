// AI API Manager - Fixed version with better error handling

export type AITool = 'business-card' | 'translator' | 'content-generator' | 'grammar-checker';

class AIApiManager {
  private getToolApiKey(tool: AITool): string | null {
    const envKeys = {
      'business-card': import.meta.env.VITE_GEMINI_BUSINESS_CARD_API_KEY,
      'translator': import.meta.env.VITE_GEMINI_TRANSLATOR_API_KEY,
      'content-generator': import.meta.env.VITE_GEMINI_CONTENT_GENERATOR_API_KEY,
      'grammar-checker': import.meta.env.VITE_GEMINI_GRAMMAR_CHECKER_API_KEY
    };

    return envKeys[tool] || null;
  }

  hasKey(tool: AITool): boolean {
    const key = this.getToolApiKey(tool);
    // Check if key exists and has reasonable length (API keys are typically 30+ chars)
    return !!(key && key.length > 20 && !key.includes('your_'));
  }

  async makeRequest(tool: AITool, prompt: string, options: {
    systemMessage?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    const apiKey = this.getToolApiKey(tool);
    
    if (!apiKey) {
      throw new Error(
        `No API key configured for ${tool}. ` +
        `Please add VITE_GEMINI_${tool.toUpperCase().replace('-', '_')}_API_KEY to your .env file. ` +
        `Get your free API key from: https://aistudio.google.com/app/apikey`
      );
    }

    if (apiKey.includes('your_')) {
      throw new Error(
        `Please replace the placeholder API key for ${tool} with your actual Gemini API key. ` +
        `Get one free at: https://aistudio.google.com/app/apikey`
      );
    }

    try {
      const fullPrompt = options.systemMessage 
        ? `${options.systemMessage}\n\n${prompt}` 
        : prompt;
      
      const requestBody = {
        contents: [{ 
          parts: [{ text: fullPrompt }] 
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: options.maxTokens || 2048,
        }
      };

      console.log(`Making API request to ${tool}...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error(
            `Rate limit exceeded for ${tool}. ` +
            `Your Gemini API free tier has reached its limit. ` +
            `Please wait a few minutes or upgrade your API plan at: https://aistudio.google.com/`
          );
        }
        
        if (response.status === 403) {
          throw new Error(
            `Invalid API key for ${tool}. ` +
            `Please check your API key in the .env file. ` +
            `Get a new key from: https://aistudio.google.com/app/apikey`
          );
        }

        if (response.status === 400) {
          throw new Error(
            `Bad request to ${tool} API. ` +
            `This might be due to invalid input or prompt length. ` +
            `Error: ${errorData?.error?.message || 'Unknown error'}`
          );
        }
        
        throw new Error(
          `Gemini API error for ${tool}: ${response.status} - ${response.statusText}. ` +
          `Details: ${errorData?.error?.message || 'No details available'}`
        );
      }

      const result = await response.json();
      
      // Extract text from response
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generatedText = result.candidates[0].content.parts[0].text;
        console.log(`Successfully generated content for ${tool}`);
        return generatedText;
      }
      
      // Handle blocked content
      if (result.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error(
          `Content was blocked by safety filters for ${tool}. ` +
          `Please try rephrasing your request.`
        );
      }
      
      throw new Error(
        `No content generated from Gemini for ${tool}. ` +
        `This might be due to content filters or API issues.`
      );
      
    } catch (error) {
      console.error(`Error calling Gemini API for ${tool}:`, error);
      
      // Re-throw our custom errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Network error when calling ${tool} API. ` +
          `Please check your internet connection and try again.`
        );
      }
      
      // Generic error
      throw new Error(
        `Unexpected error when calling ${tool} API: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Get all tools that have valid API keys
  getAvailableTools(): AITool[] {
    const tools: AITool[] = ['business-card', 'translator', 'content-generator', 'grammar-checker'];
    return tools.filter(tool => this.hasKey(tool));
  }

  // Get setup instructions for a tool
  getSetupInstructions(tool: AITool): string {
    return `
To use the ${tool.replace('-', ' ')} tool:

1. Get a free Gemini API key from: https://aistudio.google.com/app/apikey
2. Create a .env file in your project root (if it doesn't exist)
3. Add this line to your .env file:
   VITE_GEMINI_${tool.toUpperCase().replace('-', '_')}_API_KEY=your_actual_api_key_here
4. Restart your development server
5. Refresh the page

The Gemini API free tier includes:
- 15 requests per minute
- 1 million tokens per month
- No credit card required
    `.trim();
  }

  // Legacy method for backward compatibility
  getGeminiKey(): string | null {
    // Try to get any available key as fallback
    return this.getToolApiKey('business-card') || 
           this.getToolApiKey('translator') || 
           this.getToolApiKey('content-generator') || 
           this.getToolApiKey('grammar-checker');
  }
}

// Export singleton instance
export const aiApiManager = new AIApiManager();

// Export helper function to check if AI features are available
export const hasAnyAIKey = (): boolean => {
  return aiApiManager.getAvailableTools().length > 0;
};

// Export helper to get missing tools
export const getMissingAITools = (): AITool[] => {
  const allTools: AITool[] = ['business-card', 'translator', 'content-generator', 'grammar-checker'];
  const availableTools = aiApiManager.getAvailableTools();
  return allTools.filter(tool => !availableTools.includes(tool));
};