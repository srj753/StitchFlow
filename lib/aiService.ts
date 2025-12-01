import { Platform } from 'react-native';

export type AiProvider = 'openai' | 'groq' | 'gemini';

interface AiConfig {
  apiKey: string;
  provider: AiProvider;
}

// Storage key for the API key
export const AI_SETTINGS_KEY = 'stitchflow_ai_settings';

/**
 * Detailed system instruction for pattern parsing (adapted from StitchFlow AI Studio)
 * This provides comprehensive guidance for extracting structured pattern data
 */
export const PATTERN_SCHEMA_PROMPT = `
**Role:** You are an expert Technical Editor for Knitting and Crochet patterns. Your goal is to parse unstructured pattern data (text, images, or PDFs) into a clean, standardized JSON structure for an app called StitchFlow.

**Objective:** Analyze the input and extract specific data points. You must be precise, especially with abbreviations and row counts.

**Extraction Rules:**

1. **Description:** Extract the "romance text" or introduction. This is usually at the very top and describes the look, feel, or inspiration of the item. Do NOT include technical notes here.

2. **Difficulty:** Classify strictly as one of: "beginner", "intermediate", "advanced".
   - *Beginner:* Basic stitches (sc, dc, knit, purl), simple shaping.
   - *Intermediate:* Colorwork, cables, lace, complex shaping.
   - *Advanced:* Micro-crochet, complex garments, advanced lace/brioche.

3. **Materials & Tools:**
   - yarnWeight: Standardize to: Lace, Fingering, Sport, DK, Worsted, Bulky, Super Bulky.
   - hookSize: Format as "X.Xmm" (e.g., "4.0mm" or "5.5mm").
   - palette: Extract specific color names if listed.

4. **Stitches:** Extract a list of abbreviations used (e.g., "sc", "k2tog", "tr").

5. **Instructions (Crucial):**
   - Break down the pattern into logical **Sections** (e.g., "Sleeve", "Body", "Neckline").
   - Inside each section, parse **Rows/Rounds**.
   - If a row is written as "Row 1-5:", expand this if possible, or keep it as a single instruction block with row_count: 5.
   - Clean up the text: Remove "End of row" counts from the instruction text and put them in the stitch_count field if possible.

**Output Format (Strict JSON):**
{
  "metadata": {
    "name": "String (Title of pattern)",
    "designer": "String (Author name)",
    "difficulty": "beginner | intermediate | advanced",
    "yarnWeight": "String (e.g. Worsted)",
    "hookSize": "String (e.g. 5.0mm)",
    "estimatedHours": Number
  },
  "description": "String (The marketing/intro description of the item)",
  "materials": {
    "yarn": ["String (Yarn brand/type)"],
    "tools": ["String (Other tools like markers, needles)"]
  },
  "gauge": "String (e.g. 14 sts x 10 rows = 4 inches)",
  "abbreviations": ["String (List of stitches used, e.g. 'sc', 'inc')"],
  "instructions": [
    {
      "section_name": "String (e.g. 'Main Body')",
      "steps": [
        {
          "row_label": "String (e.g. 'Row 1' or 'Rounds 5-10')",
          "instruction": "String (The actual text instruction)",
          "stitch_count": "String (e.g. '24 sts') or null"
        }
      ]
    }
  ]
}

**Response:** Only return the valid JSON object. Do not include markdown formatting like \`\`\`json at the start.
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
   * Returns structured pattern data matching the detailed schema
   */
  async parsePatternFromText(text: string): Promise<any> {
    if (!text || text.length < 50) {
      throw new Error('Text too short for analysis');
    }

    // Truncate to avoid token limits (Groq has limits)
    const maxLength = this.provider === 'groq' ? 12000 : 15000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '\n\n[... text truncated ...]'
      : text;

    const prompt = `${PATTERN_SCHEMA_PROMPT}\n\nHere is the pattern text to parse:\n\n${truncatedText}`;

    return this.callLlm(prompt);
  }

  /**
   * Extract pattern from Image (Base64)
   * Returns structured pattern data matching the detailed schema
   */
  async parsePatternFromImage(base64Image: string): Promise<any> {
    const prompt = `${PATTERN_SCHEMA_PROMPT}\n\nPlease parse the knitting/crochet pattern in this image.`;
    return this.callVisionLlm(base64Image, prompt);
  }

  /**
   * Extract pattern from multiple images/files
   * Useful for multi-page PDFs or multiple pattern images
   */
  async parsePatternFromFiles(files: Array<{ mimeType: string; data: string }>): Promise<any> {
    if (files.length === 0) {
      throw new Error('No files provided');
    }

    // For Groq, we can only send one image at a time in the current API
    // So we'll process the first file and include context about others
    const firstFile = files[0];
    const prompt = `${PATTERN_SCHEMA_PROMPT}\n\nPlease parse the knitting/crochet pattern from this ${files.length > 1 ? `image (part 1 of ${files.length})` : 'image'}.`;

    return this.callVisionLlm(firstFile.data, prompt);
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
      // Use llama-3.1-70b-versatile for better JSON parsing (more accurate than 8b)
      model = 'llama-3.1-70b-versatile';
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
          { 
            role: 'system', 
            content: 'You are an expert knitting and crochet technical editor. You parse patterns into structured JSON. Return ONLY valid JSON, no markdown formatting, no code blocks.' 
          },
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
      
      if (!content) {
        throw new Error('Empty response from AI');
      }
      
      // Clean up content - remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      try {
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('JSON Parse Error. Raw content:', cleanedContent.substring(0, 500));
        throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
      }
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
      // Use llama-3.2-90b-vision-preview for vision, or fallback to text model if vision unavailable
      model = 'llama-3.2-90b-vision-preview';
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
      
      if (!content) {
        throw new Error('Empty response from AI');
      }
      
      if (jsonMode) {
        // Clean up content - remove markdown code blocks if present
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        try {
          return JSON.parse(cleanedContent);
        } catch (e) {
          console.error("JSON Parse Error. Raw content:", cleanedContent.substring(0, 500));
          throw new Error(`Failed to parse AI response as JSON: ${e}`);
        }
      }
      return { content };
    }

    throw new Error('Provider not implemented');
  }
}

