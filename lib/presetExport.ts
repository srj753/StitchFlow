import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import { useCounterPresetsStore } from '@/store/useCounterPresetsStore';

/**
 * Export presets to a JSON file
 */
export async function exportPresets(): Promise<boolean> {
  try {
    const exportData = useCounterPresetsStore.getState().exportPresets();
    const fileName = `knotiq-presets-${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      // For web, create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    }

    // For native platforms
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportData, { 
          mimeType: 'application/json', 
          dialogTitle: fileName 
        });
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Export presets failed:', error);
    return false;
  }
}

/**
 * Import presets from a JSON file
 */
export async function importPresets(): Promise<{ imported: number; errors: string[] }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { imported: 0, errors: [] };
    }

    const fileUri = result.assets[0].uri;
    const response = await fetch(fileUri);
    const jsonString = await response.text();

    return useCounterPresetsStore.getState().importPresets(jsonString);
  } catch (error) {
    console.error('Import presets failed:', error);
    return { imported: 0, errors: [`Failed to import: ${error}`] };
  }
}










