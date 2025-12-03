import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * iOS-optimized haptic feedback
 * Uses iOS-specific haptic patterns for better user experience
 */

export type HapticType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * iOS-specific haptic feedback patterns
 */
export function iosHaptic(type: HapticType = 'medium'): void {
  if (Platform.OS !== 'ios') {
    // Fallback to standard haptics on other platforms
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
    return;
  }

  // iOS-specific patterns
  switch (type) {
    case 'light':
      // Light tap for subtle feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      // Medium tap for standard interactions
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      // Heavy tap for important actions
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      // Success notification pattern
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      // Warning notification pattern
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      // Error notification pattern
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'selection':
      // Selection feedback for pickers, switches, etc.
      Haptics.selectionAsync();
      break;
  }
}

/**
 * Haptic feedback for counter increments
 */
export function counterHaptic(delta: number): void {
  if (delta > 0) {
    iosHaptic('medium');
  } else if (delta < 0) {
    iosHaptic('light');
  } else {
    iosHaptic('selection');
  }
}

/**
 * Haptic feedback for button presses
 */
export function buttonHaptic(importance: 'low' | 'medium' | 'high' = 'medium'): void {
  switch (importance) {
    case 'low':
      iosHaptic('light');
      break;
    case 'medium':
      iosHaptic('medium');
      break;
    case 'high':
      iosHaptic('heavy');
      break;
  }
}

/**
 * Haptic feedback for navigation
 */
export function navigationHaptic(): void {
  iosHaptic('selection');
}

/**
 * Haptic feedback for success actions
 */
export function successHaptic(): void {
  iosHaptic('success');
}

/**
 * Haptic feedback for errors
 */
export function errorHaptic(): void {
  iosHaptic('error');
}







