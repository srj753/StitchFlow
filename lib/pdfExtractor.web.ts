import { extractTextFromImage } from './imageOCR';

/**
 * Extracts text from PDF on web using pdf.js
 */
export async function extractTextFromPDFWeb(fileUri: string, fileData?: ArrayBuffer | Uint8Array): Promise<string> {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source for pdf.js
    if (typeof window !== 'undefined') {
      // Use a CDN for the worker, or bundle it if needed
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    let arrayBuffer: ArrayBuffer;
    
    // Use provided file data if available, otherwise fetch
    if (fileData) {
      if (fileData instanceof ArrayBuffer) {
        arrayBuffer = fileData;
      } else {
        arrayBuffer = fileData.buffer;
      }
    } else {
      // Fetch the PDF file
      const response = await fetch(fileUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      arrayBuffer = await response.arrayBuffer();
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Check if this is an image-based PDF (no text content)
      const hasText = textContent.items.some((item: any) => 'str' in item && item.str.trim().length > 0);
      
      if (hasText) {
        // Regular text-based PDF - extract text directly
        const pageText = textContent.items
          .map((item: any, index: number, items: any[]) => {
            if ('str' in item) {
              const text = item.str;
              // Check if we should add a line break
              const nextItem = items[index + 1];
              if (nextItem && 'transform' in item && 'transform' in nextItem) {
                const currentY = item.transform[5];
                const nextY = nextItem.transform[5];
                // If Y position changed significantly, it's a new line
                if (Math.abs(currentY - nextY) > 5) {
                  return text + '\n';
                }
              }
              return text;
            }
            return '';
          })
          .join(' ');
        
        fullText += pageText + '\n\n';
      } else {
        // Image-based PDF - extract image and run OCR
        try {
          // Only do OCR on web (where we have canvas API)
          if (typeof document !== 'undefined') {
            const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            
            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              
              // Convert canvas to blob
              const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error('Failed to convert canvas to blob'));
                }, 'image/png');
              });
              
              // Run OCR on the image (no progress callback for PDF pages)
              const ocrText = await extractTextFromImage('', blob);
              fullText += ocrText + '\n\n';
            }
          } else {
            console.warn('Image-based PDF OCR not available on native platform');
          }
        } catch (ocrError) {
          console.warn(`Failed to OCR page ${pageNum}:`, ocrError);
          // Continue with other pages
        }
      }
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. The PDF may be corrupted or password-protected.');
  }
}










