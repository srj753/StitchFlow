import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

import { findCounterByName, parseVoiceCommand, ParsedCommand } from '@/lib/voiceCommands';

// Dynamically import Voice to handle Expo Go compatibility
let Voice: any = null;
let SpeechErrorEvent: any = null;
let SpeechResultsEvent: any = null;

try {
  const voiceModule = require('@react-native-voice/voice');
  Voice = voiceModule.default || voiceModule;
  SpeechErrorEvent = voiceModule.SpeechErrorEvent;
  SpeechResultsEvent = voiceModule.SpeechResultsEvent;
} catch (e) {
  // Module not available (Expo Go limitation)
  console.warn('Voice recognition not available in Expo Go. Requires development build.');
}

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface UseVoiceCommandOptions {
  onCommand?: (command: ParsedCommand) => void;
  enabled?: boolean;
}

export function useVoiceCommand(options: UseVoiceCommandOptions = {}) {
  const { onCommand, enabled = true } = options;
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if voice recognition is supported
  useEffect(() => {
    if (!Voice) {
      setIsSupported(false);
      return;
    }

    Voice.isAvailable()
      .then((available: boolean) => {
        setIsSupported(available);
      })
      .catch(() => {
        setIsSupported(false);
      });

    // Set up event listeners
    Voice.onSpeechStart = () => {
      setStatus('listening');
      setError(null);
    };

    Voice.onSpeechEnd = () => {
      setStatus('processing');
    };

    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        const parsed = parseVoiceCommand(text);
        
        if (parsed.action.type !== 'unknown') {
          onCommand?.(parsed);
        } else {
          speak('Sorry, I didn\'t understand that command.');
          setError('Command not recognized');
        }
        
        setStatus('idle');
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('Speech recognition error:', e.error);
      setError(e.error?.message || 'Speech recognition failed');
      setStatus('error');
      
      // Auto-reset after error
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    };

    return () => {
      if (Voice) {
        Voice.destroy().then(() => Voice.removeAllListeners?.()).catch(() => {});
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
    };
  }, [onCommand]);

  const startListening = useCallback(async () => {
    if (!enabled || !isSupported || !Voice) {
      setError('Voice recognition not available. Requires development build.');
      return;
    }

    try {
      setError(null);
      await Voice.start('en-US');
      
      // Auto-stop after 5 seconds of listening
      recognitionTimeoutRef.current = setTimeout(async () => {
        try {
          if (Voice) {
            await Voice.stop();
          }
        } catch (e) {
          // Ignore stop errors
        }
      }, 5000);
    } catch (err: any) {
      console.error('Failed to start voice recognition:', err);
      setError(err?.message || 'Failed to start listening');
      setStatus('error');
    }
  }, [enabled, isSupported]);

  const stopListening = useCallback(async () => {
    if (!Voice) return;
    
    try {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
      await Voice.stop();
      setStatus('idle');
    } catch (err) {
      console.error('Failed to stop voice recognition:', err);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled) return;
    
    setStatus('speaking');
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        setStatus('idle');
      },
      onStopped: () => {
        setStatus('idle');
      },
      onError: () => {
        setStatus('idle');
      },
    });
  }, [enabled]);

  return {
    status,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    message: isSupported
      ? 'Tap and speak your command'
      : Voice
        ? 'Voice recognition not available on this device'
        : 'Voice commands require a development build (not available in Expo Go)',
  };
}

