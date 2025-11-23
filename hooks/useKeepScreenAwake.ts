import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

/**
 * Keeps the device awake while `enabled` is true.
 * TODO: Tie into project session tracking so we only keep awake while actively counting.
 */
export function useKeepScreenAwake(enabled: boolean, tag = 'knotiq-project') {
  useEffect(() => {
    let cancelled = false;

    async function activate() {
      try {
        if (enabled) {
          await activateKeepAwakeAsync(tag);
        }
      } catch {
        // noop – on web this may not be supported
      }
    }

    activate();

    return () => {
      if (cancelled) return;
      cancelled = true;
      deactivateKeepAwake(tag).catch(() => undefined);
    };
  }, [enabled, tag]);
}



