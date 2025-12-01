/**
 * iOS Shortcuts Integration
 * 
 * This file defines Siri shortcuts and App Intents for iOS.
 * Note: Full implementation requires native iOS code and App Intents framework (iOS 16+).
 * 
 * For Expo projects, these shortcuts need to be configured in:
 * - app.json/app.config.js for basic shortcuts
 * - Native iOS code for App Intents (iOS 16+)
 */

export type ShortcutAction = 
  | 'increment-counter'
  | 'decrement-counter'
  | 'read-counter'
  | 'reset-counter'
  | 'open-active-project';

export interface ShortcutIntent {
  action: ShortcutAction;
  projectId?: string;
  counterId?: string;
  counterName?: string;
  amount?: number;
}

/**
 * Shortcut phrases that Siri can recognize
 */
export const SHORTCUT_PHRASES: Record<ShortcutAction, string[]> = {
  'increment-counter': [
    'Increment row counter',
    'Add one to counter',
    'Increase counter',
    'Add row',
  ],
  'decrement-counter': [
    'Decrement row counter',
    'Subtract one from counter',
    'Decrease counter',
  ],
  'read-counter': [
    'What row am I on?',
    'Read counter',
    'Current counter value',
    'How many rows?',
  ],
  'reset-counter': [
    'Reset counter',
    'Set counter to zero',
    'Clear counter',
  ],
  'open-active-project': [
    'Open active project',
    'Show my project',
    'Open StitchFlow',
  ],
};

/**
 * Suggested shortcuts configuration for app.json
 * Add this to your app.json under ios.userInterfaceStyle and ios.infoPlist
 */
export const SHORTCUTS_CONFIG = {
  shortcuts: [
    {
      title: 'Increment Counter',
      subtitle: 'Add one to your active counter',
      icon: 'plus.circle',
      userInfo: {
        action: 'increment-counter',
      },
    },
    {
      title: 'Read Counter',
      subtitle: 'Check your current row count',
      icon: 'number.circle',
      userInfo: {
        action: 'read-counter',
      },
    },
    {
      title: 'Open Active Project',
      subtitle: 'Open your current project',
      icon: 'heart.circle',
      userInfo: {
        action: 'open-active-project',
      },
    },
  ],
};

/**
 * Handle shortcut intent
 * This should be called from the app's deep linking handler
 */
export function handleShortcutIntent(intent: ShortcutIntent): void {
  // This will be implemented to call the appropriate store actions
  console.log('Handling shortcut intent:', intent);
  
  // Example implementation:
  // switch (intent.action) {
  //   case 'increment-counter':
  //     if (intent.projectId && intent.counterId) {
  //       useProjectsStore.getState().updateCounter(
  //         intent.projectId,
  //         intent.counterId,
  //         currentValue + (intent.amount || 1)
  //       );
  //     }
  //     break;
  //   // ... other cases
  // }
}

/**
 * Generate App Intent definitions (for iOS 16+)
 * These need to be implemented in native Swift code
 */
export const APP_INTENTS = {
  incrementCounter: {
    title: 'Increment Counter',
    description: 'Add one to your active project counter',
    parameters: [
      {
        name: 'projectId',
        type: 'string',
        description: 'Project ID',
      },
      {
        name: 'counterId',
        type: 'string',
        description: 'Counter ID',
      },
    ],
  },
  readCounter: {
    title: 'Read Counter',
    description: 'Get the current value of your counter',
    parameters: [
      {
        name: 'projectId',
        type: 'string',
        description: 'Project ID',
      },
      {
        name: 'counterId',
        type: 'string',
        description: 'Counter ID',
      },
    ],
  },
};

