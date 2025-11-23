import { useCallback, useState } from 'react';

type VoiceStatus = 'idle' | 'listening' | 'coming-soon';

/**
 * Placeholder hook for future voice command implementation.
 * TODO: Replace with native speech recognition for counters & notes.
 */
export function useVoiceCommandStub() {
  const [status, setStatus] = useState<VoiceStatus>('coming-soon');

  const startListening = useCallback(() => {
    setStatus('coming-soon');
  }, []);

  const stopListening = useCallback(() => {
    setStatus('coming-soon');
  }, []);

  return {
    status,
    startListening,
    stopListening,
    isSupported: false,
    message:
      'Voice controls are on the roadmap. Soon you’ll be able to say “add 10 stitches” or “what row am I on?”.',
  };
}



