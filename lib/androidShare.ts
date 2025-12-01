/**
 * Android Share Integration
 * 
 * Provides enhanced sharing functionality for Android, including
 * native share sheet integration and Material Design 3 share patterns.
 */

import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface ShareOptions {
  message?: string;
  url?: string;
  title?: string;
  mimeType?: string;
  dialogTitle?: string;
}

/**
 * Share content using the native Android share sheet
 * 
 * @param content - The content to share (text, URL, or file URI)
 * @param options - Additional share options
 * 
 * @example
 * ```tsx
 * await shareContent('Check out this pattern!', {
 *   title: 'Share Pattern',
 *   url: 'https://example.com/pattern'
 * });
 * ```
 */
export async function shareContent(
  content: string,
  options: ShareOptions = {},
): Promise<void> {
  if (Platform.OS === 'web') {
    // Web fallback: use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title || 'Share',
          text: content,
          url: options.url,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
        return;
      }
    } else {
      // Fallback: copy to clipboard
      const textToCopy = options.url ? `${content}\n${options.url}` : content;
      await navigator.clipboard.writeText(textToCopy);
      return;
    }
  }

  // Android/iOS: Use expo-sharing
  try {
    if (options.url && options.url.startsWith('file://')) {
      // Sharing a file
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(options.url, {
          mimeType: options.mimeType,
          dialogTitle: options.dialogTitle || options.title || 'Share',
        });
      }
    } else {
      // Sharing text content
      // Note: expo-sharing primarily handles files, so for text we'd need
      // to use React Native's Share API or create a temporary file
      const { Share } = require('react-native');
      await Share.share(
        {
          message: options.url ? `${content}\n${options.url}` : content,
          title: options.title,
        },
        {
          dialogTitle: options.dialogTitle || options.title || 'Share',
        },
      );
    }
  } catch (error) {
    console.error('Share error:', error);
    throw error;
  }
}

/**
 * Share a project as text
 */
export async function shareProject(
  projectName: string,
  projectDetails: {
    status: string;
    counters: Array<{ label: string; value: number }>;
    notes?: string;
  },
): Promise<void> {
  const lines = [
    `📱 ${projectName}`,
    `Status: ${projectDetails.status}`,
    '',
    'Counters:',
    ...projectDetails.counters.map((c) => `  • ${c.label}: ${c.value}`),
  ];

  if (projectDetails.notes) {
    lines.push('', 'Notes:', projectDetails.notes);
  }

  await shareContent(lines.join('\n'), {
    title: `Share ${projectName}`,
  });
}

/**
 * Share a pattern
 */
export async function sharePattern(
  patternName: string,
  patternDetails: {
    designer: string;
    difficulty: string;
    url?: string;
  },
): Promise<void> {
  const content = [
    `📖 ${patternName}`,
    `by ${patternDetails.designer}`,
    `Difficulty: ${patternDetails.difficulty}`,
  ].join('\n');

  await shareContent(content, {
    title: `Share ${patternName}`,
    url: patternDetails.url,
  });
}

/**
 * Share yarn stash entry
 */
export async function shareYarn(
  yarnName: string,
  yarnDetails: {
    brand: string;
    colorway: string;
    weight: string;
    quantity: number;
  },
): Promise<void> {
  const content = [
    `🧶 ${yarnName}`,
    `Brand: ${yarnDetails.brand}`,
    `Colorway: ${yarnDetails.colorway}`,
    `Weight: ${yarnDetails.weight}`,
    `Quantity: ${yarnDetails.quantity} skeins`,
  ].join('\n');

  await shareContent(content, {
    title: `Share ${yarnName}`,
  });
}

/**
 * Share app (invite friends)
 */
export async function shareApp(): Promise<void> {
  const content = `Check out StitchFlow - the ultimate crochet and knitting companion app! 🧶✨

Track your projects, manage your yarn stash, and discover amazing patterns all in one place.`;

  await shareContent(content, {
    title: 'Share StitchFlow',
  });
}



