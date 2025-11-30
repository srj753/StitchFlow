import { Platform } from 'react-native';

/**
 * Extracts text from an image using OCR
 * Works on web using Tesseract.js
 */
export async function extractTextFromImage(
  imageUri: string,
  imageData?: Blob | ArrayBuffer | Uint8Array,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    // Dynamically import Tesseract.js
    const Tesseract = await import('tesseract.js');
    
    let imageSource: string | Blob | Buffer;
    
    // Prepare image source
    if (imageData) {
      if (imageData instanceof Blob) {
        imageSource = imageData;
      } else if (imageData instanceof ArrayBuffer) {
        imageSource = new Blob([imageData]);
      } else {
        imageSource = new Blob([imageData.buffer]);
      }
    } else {
      imageSource = imageUri;
    }
    
    // Run OCR with optimized settings for pattern text
    const { data: { text } } = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        // Report progress if callback provided
        if (onProgress && m.status === 'recognizing text' && m.progress !== undefined) {
          onProgress(m.progress);
        }
        // Also log for debugging
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
      // Optimize for text-heavy documents (like patterns)
      tessedit_pageseg_mode: '6', // Assume uniform block of text
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()[]{}/-+=*&%$#@ \n\r\t',
    });
    
    if (onProgress) {
      onProgress(1); // Complete
    }
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image. The image may be too blurry or contain no text.');
  }
}

/**
 * Checks if an image file is supported for OCR
 */
export function isImageFileSupported(mimeType?: string, fileName?: string): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
  ];
  
  if (mimeType && supportedTypes.includes(mimeType.toLowerCase())) {
    return true;
  }
  
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '');
  }
  
  return false;
}

/**
 * Extracts text from an image file (handles file reading)
 */
export async function extractTextFromImageFile(
  fileUri: string,
  mimeType?: string,
  fileName?: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (!isImageFileSupported(mimeType, fileName)) {
    throw new Error('Unsupported image format. Supported: JPG, PNG, GIF, BMP, WEBP');
  }
  
  if (Platform.OS === 'web') {
    // On web, fetch the image and convert to blob
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      return await extractTextFromImage(fileUri, blob, onProgress);
    } catch (error) {
      console.error('Error reading image file:', error);
      throw new Error('Failed to read image file');
    }
  } else {
    // On native, we can use the URI directly or convert to base64/blob
    // Tesseract.js can work with file URIs on some platforms
    try {
      // Try to read as base64 and convert to blob
      // @ts-ignore
      const { readAsStringAsync } = await import('expo-file-system/legacy');
      const base64 = await readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      
      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      
      return await extractTextFromImage(fileUri, blob, onProgress);
    } catch (error) {
      console.error('Error processing image file:', error);
      // Fallback: try direct URI
      return await extractTextFromImage(fileUri, undefined, onProgress);
    }
  }
}

