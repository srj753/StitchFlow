import { Platform } from 'react-native';
import { extractTextFromFile } from './pdfExtractor';
import { extractTextFromImage } from './imageOCR';

/**
 * Scrapes content from a URL
 * Handles HTML pages, PDF files, and Image files
 */
export async function scrapeUrl(
  url: string, 
  onProgress?: (status: string) => void
): Promise<{ text: string; title?: string; images?: string[] }> {
  try {
    onProgress?.('Fetching content...');
    
    // Check if it's a direct file URL
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) {
      onProgress?.('Downloading PDF...');
      // For PDFs, we need to fetch as blob/buffer
      if (Platform.OS === 'web') {
        return { text: await extractTextFromFile(url, 'application/pdf') };
      } else {
        // Native: Download to temp file or buffer
        const response = await fetch(url);
        const blob = await response.blob();
        // Convert blob to array buffer for PDF extractor
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
        return { text: await extractTextFromFile(url, 'application/pdf', buffer) };
      }
    }
    
    if (lowerUrl.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/)) {
      onProgress?.('Processing image with OCR...');
      const text = await extractTextFromImage(url, undefined, (p) => {
        onProgress?.(`Scanning image... ${Math.round(p * 100)}%`);
      });
      return { text, images: [url] };
    }

    // Assume HTML webpage
    onProgress?.('Reading webpage...');
    const response = await fetch(url);
    const html = await response.text();
    
    onProgress?.('Parsing content...');
    return parseHtml(html);

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to fetch URL. If this is a website, it might block automated access.');
  }
}

/**
 * Simple HTML parser to extract main content
 * Implements basic "Readability" heuristics
 */
function parseHtml(html: string): { text: string; title?: string; images?: string[] } {
  // 1. Extract Title
  let title: string | undefined;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) title = decodeEntities(titleMatch[1].trim());
  
  // 2. Clean HTML
  let cleanHtml = html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '') // Remove scripts
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')   // Remove styles
    .replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gim, '')       // Remove navs
    .replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gim, '') // Remove footers
    .replace(/<!--[\s\S]*?-->/g, '');                      // Remove comments

  // 3. Extract Images (simplified)
  const images: string[] = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(cleanHtml)) !== null) {
    if (imgMatch[1] && !imgMatch[1].includes('icon') && !imgMatch[1].includes('logo')) {
      images.push(imgMatch[1]);
    }
  }

  // 4. Extract Main Content (Heuristic: look for article or main tags, or assume body)
  const articleMatch = cleanHtml.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = cleanHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  
  let contentHtml = articleMatch ? articleMatch[1] : (mainMatch ? mainMatch[1] : cleanHtml);

  // 5. Convert to Text
  // Replace block tags with double newlines
  let text = contentHtml
    .replace(/<\/(h[1-6]|p|div|section|article|li|tr)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ') // Strip remaining tags
    .replace(/\s+/g, ' ')     // Collapse whitespace
    .replace(/\n\s*\n/g, '\n\n') // Max 2 newlines
    .trim();

  return { 
    text: decodeEntities(text), 
    title, 
    images: images.slice(0, 5) // Return top 5 images
  };
}

/**
 * Decodes HTML entities
 */
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&copy;/g, '(c)');
}










