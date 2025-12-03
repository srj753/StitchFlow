/**
 * Android Back Button Handler
 * 
 * Provides a hook to handle Android back button presses.
 * Can be used to show confirmation dialogs, navigate back, or prevent default behavior.
 */

import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

export type BackHandlerCallback = () => boolean;

/**
 * Hook to handle Android back button presses
 * 
 * @param onBackPress - Callback that returns true if the back press was handled, false otherwise
 * @param enabled - Whether the handler is enabled (default: true)
 * 
 * @example
 * ```tsx
 * useAndroidBackHandler(() => {
 *   if (showModal) {
 *     setShowModal(false);
 *     return true; // Prevent default back behavior
 *   }
 *   return false; // Allow default back behavior
 * });
 * ```
 */
export function useAndroidBackHandler(
  onBackPress: BackHandlerCallback,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (Platform.OS !== 'android' || !enabled) {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return onBackPress();
    });

    return () => {
      backHandler.remove();
    };
  }, [onBackPress, enabled]);
}

/**
 * Hook to prevent Android back button (e.g., when showing a modal)
 */
export function usePreventAndroidBack(enabled: boolean = true) {
  useAndroidBackHandler(
    () => {
      return enabled; // Return true to prevent default back behavior
    },
    enabled,
  );
}







