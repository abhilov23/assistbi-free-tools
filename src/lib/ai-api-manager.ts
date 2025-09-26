// AI API Manager - Handles multiple API keys and providers with fallback support

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'perplexity';

interface APIConfig {
  provider: AIProvider;
  key: string;
  endpoint: string;
  model: string;
}

class AIApiManager {
  private geminiKeys: string[] = [];
  private openaiKeys: string[] = [];
  private anthropicKeys: string[] = [];
  private perplexityKeys: string[] = [];
  
  private currentGeminiIndex = 0;
  private currentOpenaiIndex = 0;
  private currentAnthropicIndex = 0;
  private currentPerplexityIndex = 0;

  constructor() {
    this.loadApiKeys();
  }

  private loadApiKeys() {
    // Load Gemini API keys
    for (let i = 1; i <= 10; i++) {
      const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`];
      if (key && key !== `your_gemini_api_key_${i}_here`) {
        this.geminiKeys.push(key);
      }
    }

    // Load OpenAI API keys
    for (let i = 1; i <= 10; i++) {
      const key = import.meta.env[`VITE_OPENAI_API_KEY_${i}`];
      if (key && key !== `your_openai_api_key_${i}_here`) {
        this.openaiKeys.push(key);
      }
    }

    // Load Anthropic API keys
    for (let i = 1; i <= 10; i++) {
      const key = import.meta.env[`VITE_ANTHROPIC_API_KEY_${i}`];
      if (key && key !== `your_anthropic_api_key_${i}_here`) {
        this.anthropicKeys.push(key);
      }
    }

    // Load Perplexity API keys
    for (let i = 1; i <= 10; i++) {
      const key = import.meta.env[`VITE_PERPLEXITY_API_KEY_${i}`];
      if (key && key !== `your_perplexity_api_key_${i}_here`) {
        this.perplexityKeys.push(key);
      }
    }

    // Backward compatibility with old single keys
    const oldGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (oldGeminiKey && !this.geminiKeys.includes(oldGeminiKey)) {
      this.geminiKeys.unshift(oldGeminiKey);
    }

    const oldPerplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (oldPerplexityKey && !this.perplexityKeys.includes(oldPerplexityKey)) {
      this.perplexityKeys.unshift(oldPerplexityKey);
    }
  }

  private getNextKey(provider: AIProvider): string | null {
    switch (provider) {
      case 'gemini':
        if (this.geminiKeys.length === 0) return null;
        const geminiKey = this.geminiKeys[this.currentGeminiIndex];
        this.currentGeminiIndex = (this.currentGeminiIndex + 1) % this.geminiKeys.length;
        return geminiKey;

      case 'openai':
        if (this.openaiKeys.length === 0) return null;
        const openaiKey = this.openaiKeys[this.currentOpenaiIndex];
        this.currentOpenaiIndex = (this.currentOpenaiIndex + 1) % this.openaiKeys.length;
        return openaiKey;

      case 'anthropic':
        if (this.anthropicKeys.length === 0) return null;
        const anthropicKey = this.anthropicKeys[this.currentAnthropicIndex];
        this.currentAnthropicIndex = (this.currentAnthropicIndex + 1) % this.anthropicKeys.length;
        return anthropicKey;

      case 'perplexity':
        if (this.perplexityKeys.length === 0) return null;
        const perplexityKey = this.perplexityKeys[this.currentPerplexityIndex];
        this.currentPerplexityIndex = (this.currentPerplexityIndex + 1) % this.perplexityKeys.length;
        return perplexityKey;

      default:
        return null;
    }
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.geminiKeys.length > 0) providers.push('gemini');
    if (this.openaiKeys.length > 0) providers.push('openai');
    if (this.anthropicKeys.length > 0) providers.push('anthropic');
    if (this.perplexityKeys.length > 0) providers.push('perplexity');
    return providers;
  }

  hasKeys(provider: AIProvider): boolean {
    switch (provider) {
      case 'gemini': return this.geminiKeys.length > 0;
      case 'openai': return this.openaiKeys.length > 0;
      case 'anthropic': return this.anthropicKeys.length > 0;
      case 'perplexity': return this.perplexityKeys.length > 0;
      default: return false;
    }
  }

  async makeRequest(
    prompt: string, 
    preferredProviders: AIProvider[] = ['gemini', 'openai', 'anthropic'],
    systemMessage?: string
  ): Promise<string> {
    const availableProviders = preferredProviders.filter(p => this.hasKeys(p));
    
    if (availableProviders.length === 0) {
      throw new Error('No API keys available for any preferred providers');
    }

    let lastError: Error | null = null;

    for (const provider of availableProviders) {
      const key = this.getNextKey(provider);
      if (!key) continue;

      try {
        const response = await this.callProvider(provider, key, prompt, systemMessage);
        return response;
      } catch (error) {
        console.warn(`${provider} API call failed:`, error);
        lastError = error as Error;
        // Continue to next provider
      }
    }

    throw lastError || new Error('All API providers failed');
  }

  private async callProvider(
    provider: AIProvider, 
    apiKey: string, 
    prompt: string, 
    systemMessage?: string
  ): Promise<string> {
    switch (provider) {
      case 'gemini':
        return this.callGemini(apiKey, prompt, systemMessage);
      case 'openai':
        return this.callOpenAI(apiKey, prompt, systemMessage);
      case 'anthropic':
        return this.callAnthropic(apiKey, prompt, systemMessage);
      case 'perplexity':
        return this.callPerplexity(apiKey, prompt, systemMessage);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async callGemini(apiKey: string, prompt: string, systemMessage?: string): Promise<string> {
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      return result.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No content generated from Gemini');
  }

  private async callOpenAI(apiKey: string, prompt: string, systemMessage?: string): Promise<string> {
    const messages = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    }
    
    throw new Error('No content generated from OpenAI');
  }

  private async callAnthropic(apiKey: string, prompt: string, systemMessage?: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048,
        system: systemMessage,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.content && result.content[0]?.text) {
      return result.content[0].text;
    }
    
    throw new Error('No content generated from Anthropic');
  }

  private async callPerplexity(apiKey: string, prompt: string, systemMessage?: string): Promise<string> {
    const messages = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    }
    
    throw new Error('No content generated from Perplexity');
  }

  // Legacy methods for backward compatibility
  getGeminiKey(): string | null {
    return this.getNextKey('gemini');
  }

  getPerplexityKey(): string | null {
    return this.getNextKey('perplexity');
  }
}

// Export singleton instance
export const aiApiManager = new AIApiManager();