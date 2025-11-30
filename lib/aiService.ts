import { Platform } from 'react-native';

export type AiProvider = 'openai' | 'groq' | 'gemini';

interface AiConfig {
  apiKey: string;
  provider: AiProvider;
}

// Storage key for the API key
export const AI_SETTINGS_KEY = 'stitchflow_ai_settings';

/**
 * Schema for the structured pattern data we want back from the AI
 */
export const PATTERN_SCHEMA_PROMPT = `
Extract the knitting/crochet pattern into this JSON structure:
{
  "name": "string",
  "designer": "string",
  "description": "string",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "yarnWeight": "string",
  "hookSize": "string",
  "gauge": "string",
  "materials": ["string"],
  "notes": "string",
  "stitches": [{"name": "string", "abbreviation": "string", "description": "string"}],
  "sections": [
    {
      "name": "string (e.g. 'Body', 'Sleeve')",
      "rows": [
        {
          "id": "string (unique)",
          "label": "string (e.g. 'Row 1', 'Rnd 5')",
          "instruction": "string",
          "stitchCount": "string"
        }
      ]
    }
  ]
}
Return ONLY valid JSON. No markdown formatting.
`;

/**
 * Service to handle AI interactions for pattern extraction
 */
export class AiService {
  private apiKey: string;
  private provider: AiProvider;

  constructor(config: AiConfig) {
    this.apiKey = config.apiKey;
    // Map legacy 'grok' to 'groq' if it persists in state
    this.provider = (config.provider as string) === 'grok' ? 'groq' : config.provider;
  }

  /**
   * Extract pattern from text content
   */
  async parsePatternFromText(text: string): Promise<any> {
    if (!text || text.length < 50) {
      throw new Error('Text too short for analysis');
    }

    const prompt = `
      ${PATTERN_SCHEMA_PROMPT}
      
      Here is the pattern text to parse:
      ${text.substring(0, 15000)} // Truncate to avoid token limits if necessary
    `;

    return this.callLlm(prompt);
  }

  /**
   * Extract pattern from Image (Base64)
   */
  async parsePatternFromImage(base64Image: string): Promise<any> {
    return this.callVisionLlm(base64Image, PATTERN_SCHEMA_PROMPT);
  }

  /**
   * Extract raw text from an image (Transcription)
   */
  async transcribeImage(base64Image: string): Promise<string> {
    const prompt = "Transcribe all the text in this knitting/crochet pattern image exactly as it appears. Do not summarize. Return only the text.";
    const response = await this.callVisionLlm(base64Image, prompt, false);
    return response.content || response; // Handle cases where response might be just content string
  }

  /**
   * Internal method to call the LLM provider (OpenAI/Grok implementation)
   */
  private async callLlm(prompt: string): Promise<any> {
    let apiUrl = 'https://api.openai.com/v1/chat/completions';
    let model = 'gpt-4o-mini'; // Default for OpenAI

    if (this.provider === 'groq') {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      model = 'llama-3.1-8b-instant'; // Cheapest text model
    }

    if (this.provider === 'openai' || this.provider === 'groq') {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert knitting and crochet technical editor. Return ONLY valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`${this.provider.toUpperCase()} API Error: ${err}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      return JSON.parse(content);
    }
    
    throw new Error('Provider not implemented');
  }

  /**
   * Internal method for Vision capabilities
   */
  private async callVisionLlm(base64Image: string, prompt: string, jsonMode: boolean = true): Promise<any> {
    let apiUrl = 'https://api.openai.com/v1/chat/completions';
    let model = 'gpt-4o'; // Default for OpenAI vision

    if (this.provider === 'groq') {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      model = 'llama-3.2-90b-vision-preview'; // Retry 90b as 11b is decommissioned
    }

    if (this.provider === 'openai' || this.provider === 'groq') {
      console.log(`[AiService] Using provider: ${this.provider}, model: ${model}`);
      
      // Ensure base64 has header
      const dataUrl = base64Image.startsWith('data:') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;

      const body: any = {
        model,
        messages: [
          { role: 'user', content: [
              { type: "text", text: "You are an expert knitting/crochet editor. " + prompt },
              {
                type: "image_url",
                image_url: { url: dataUrl }
              }
            ] 
          },
        ],
        max_tokens: 4096,
        temperature: 0.1,
      };

      if (jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey.trim()}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`${this.provider.toUpperCase()} API Error: ${err}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (jsonMode) {
        try {
          return JSON.parse(content);
        } catch (e) {
          console.error("JSON Parse Error", content);
          throw new Error("Failed to parse AI response as JSON");
        }
      }
      return { content };
    }

    throw new Error('Provider not implemented');
  }
}

