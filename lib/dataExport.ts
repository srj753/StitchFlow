import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

import { useProjectsStore } from '@/store/useProjectsStore';
import { useYarnStore } from '@/store/useYarnStore';
import { usePatternStore } from '@/store/usePatternStore';

export type ExportData = {
  version: string;
  exportedAt: string;
  projects: ReturnType<typeof useProjectsStore.getState>['projects'];
  yarns: ReturnType<typeof useYarnStore.getState>['yarns'];
  patterns: ReturnType<typeof usePatternStore.getState>['patterns'];
};

export async function exportAllData(): Promise<string | null> {
  try {
    const projects = useProjectsStore.getState().projects;
    const yarns = useYarnStore.getState().yarns;
    const patterns = usePatternStore.getState().patterns;

    const data: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects,
      yarns,
      patterns,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `knotiq-backup-${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      // For web, create download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return null;
    }

    // For native platforms - share as text (simplified approach)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (await Sharing.isAvailableAsync()) {
        // Share as text for now - can be improved later with proper file handling
        await Sharing.shareAsync(jsonString, { mimeType: 'application/json', dialogTitle: fileName });
        return 'shared';
      }
    }

    return null;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function importData(jsonString: string): Promise<void> {
  try {
    const data: ExportData = JSON.parse(jsonString);

    // Validate data structure
    if (!data.projects || !data.yarns || !data.patterns) {
      throw new Error('Invalid backup file format');
    }

    // Import data into stores
    useProjectsStore.setState({ projects: data.projects });
    useYarnStore.setState({ yarns: data.yarns });
    usePatternStore.setState({ patterns: data.patterns });

    // Persist will happen automatically via Zustand persist middleware
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

