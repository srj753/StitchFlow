/**
 * Android App Shortcuts
 * 
 * Provides deep linking support for Android app shortcuts.
 * Shortcuts allow users to quickly access specific projects or actions
 * directly from the Android launcher.
 */

import * as Linking from 'expo-linking';

export type ShortcutAction = 
  | { type: 'open_project'; projectId: string }
  | { type: 'open_active_project' }
  | { type: 'increment_counter'; projectId: string; counterId?: string }
  | { type: 'create_project' }
  | { type: 'view_patterns' }
  | { type: 'view_stash' };

/**
 * Generate a deep link URL for a shortcut action
 */
export function getShortcutUrl(action: ShortcutAction): string {
  const scheme = 'crochetreboot';
  
  switch (action.type) {
    case 'open_project':
      return `${scheme}://projects/${action.projectId}`;
    case 'open_active_project':
      return `${scheme}://projects/active`;
    case 'increment_counter':
      if (action.counterId) {
        return `${scheme}://projects/${action.projectId}/counters/${action.counterId}/increment`;
      }
      return `${scheme}://projects/${action.projectId}/increment`;
    case 'create_project':
      return `${scheme}://projects/create`;
    case 'view_patterns':
      return `${scheme}://patterns`;
    case 'view_stash':
      return `${scheme}://patterns/stash`;
    default:
      return `${scheme}://`;
  }
}

/**
 * Parse a deep link URL into a shortcut action
 */
export function parseShortcutUrl(url: string): ShortcutAction | null {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path || '';
    
    // Match project detail: /projects/:id
    const projectMatch = path.match(/^\/projects\/([^/]+)$/);
    if (projectMatch) {
      const projectId = projectMatch[1];
      if (projectId === 'active') {
        return { type: 'open_active_project' };
      }
      return { type: 'open_project', projectId };
    }
    
    // Match counter increment: /projects/:id/counters/:counterId/increment
    const counterIncrementMatch = path.match(/^\/projects\/([^/]+)\/counters\/([^/]+)\/increment$/);
    if (counterIncrementMatch) {
      return {
        type: 'increment_counter',
        projectId: counterIncrementMatch[1],
        counterId: counterIncrementMatch[2],
      };
    }
    
    // Match simple increment: /projects/:id/increment
    const simpleIncrementMatch = path.match(/^\/projects\/([^/]+)\/increment$/);
    if (simpleIncrementMatch) {
      return {
        type: 'increment_counter',
        projectId: simpleIncrementMatch[1],
      };
    }
    
    // Match create project: /projects/create
    if (path === '/projects/create') {
      return { type: 'create_project' };
    }
    
    // Match patterns: /patterns
    if (path === '/patterns') {
      return { type: 'view_patterns' };
    }
    
    // Match stash: /patterns/stash
    if (path === '/patterns/stash') {
      return { type: 'view_stash' };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing shortcut URL:', error);
    return null;
  }
}

/**
 * Get shortcut configuration for Android
 * This should be used with native Android code to register shortcuts
 */
export interface AndroidShortcut {
  id: string;
  shortLabel: string;
  longLabel: string;
  icon?: string; // Icon resource name
  action: ShortcutAction;
}

/**
 * Generate default shortcuts for the app
 */
export function getDefaultShortcuts(activeProjectId?: string): AndroidShortcut[] {
  const shortcuts: AndroidShortcut[] = [
    {
      id: 'create_project',
      shortLabel: 'New Project',
      longLabel: 'Create a new project',
      action: { type: 'create_project' },
    },
    {
      id: 'view_patterns',
      shortLabel: 'Patterns',
      longLabel: 'Browse pattern library',
      action: { type: 'view_patterns' },
    },
    {
      id: 'view_stash',
      shortLabel: 'Yarn Stash',
      longLabel: 'View your yarn stash',
      action: { type: 'view_stash' },
    },
  ];
  
  if (activeProjectId) {
    shortcuts.unshift({
      id: 'active_project',
      shortLabel: 'Active Project',
      longLabel: 'Open your active project',
      action: { type: 'open_project', projectId: activeProjectId },
    });
  }
  
  return shortcuts;
}

/**
 * Generate shortcuts for a specific project
 */
export function getProjectShortcuts(projectId: string, projectName: string): AndroidShortcut[] {
  return [
    {
      id: `project_${projectId}`,
      shortLabel: projectName.length > 20 ? projectName.substring(0, 20) : projectName,
      longLabel: `Open ${projectName}`,
      action: { type: 'open_project', projectId },
    },
    {
      id: `increment_${projectId}`,
      shortLabel: 'Increment',
      longLabel: `Increment counter in ${projectName}`,
      action: { type: 'increment_counter', projectId },
    },
  ];
}







