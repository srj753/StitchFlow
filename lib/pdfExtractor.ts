import { Platform } from 'react-native';

/**
 * Extracts text from a PDF file
 * Works on both web (using pdf.js) and native platforms
 */
export async function extractTextFromPDF(fileUri: string, fileData?: ArrayBuffer | Uint8Array): Promise<string> {
  if (Platform.OS === 'web') {
    // Dynamically import pdfjs-dist only on web to avoid import.meta issues on native
    const { extractTextFromPDFWeb } = await import('./pdfExtractor.web');
    return extractTextFromPDFWeb(fileUri, fileData);
  } else {
    // For native, native PDF text extraction would require additional libraries
    console.warn('PDF text extraction is currently only supported on web.');
    return '';
  }
}

/**
 * Reads a file as Base64 string (useful for sending to AI/OCR APIs)
 */
export async function readFileAsBase64(fileUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g. "data:application/pdf;base64,")
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // @ts-ignore
    const { readAsStringAsync } = await import('expo-file-system/legacy');
    return await readAsStringAsync(fileUri, {
      encoding: 'base64',
    });
  }
}

/**
 * Attempts to extract text from a file, handling PDFs, images, and text files
 */
export async function extractTextFromFile(fileUri: string, mimeType?: string, fileData?: ArrayBuffer | Uint8Array): Promise<string> {
  // Handle PDFs
  if (mimeType === 'application/pdf' || fileUri.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPDF(fileUri, fileData);
  }
  
  // Handle images (use OCR)
  const { isImageFileSupported, extractTextFromImageFile } = await import('./imageOCR');
  if (mimeType && isImageFileSupported(mimeType)) {
    return extractTextFromImageFile(fileUri, mimeType);
  }
  
  // For text files, just read them directly
  if (Platform.OS === 'web') {
    try {
      if (fileData) {
        // If we have file data, convert it to text
        if (fileData instanceof ArrayBuffer) {
          return new TextDecoder().decode(fileData);
        } else {
          return new TextDecoder().decode(fileData.buffer);
        }
      }
      const response = await fetch(fileUri);
      return await response.text();
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read text file');
    }
  } else {
    // For native, use FileSystem
    // @ts-ignore - expo-file-system/legacy is available in SDK 52+ but typescript might complain
    const { readAsStringAsync } = await import('expo-file-system/legacy');
    try {
      return await readAsStringAsync(fileUri);
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read text file');
    }
  }
}
