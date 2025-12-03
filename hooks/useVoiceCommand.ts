import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

import { findCounterByName, parseVoiceCommand, ParsedCommand } from '@/lib/voiceCommands';

import Constants from 'expo-constants';

// Lazy load Voice module to handle Expo Go compatibility
// Check execution environment first to avoid bundling issues
let VoiceModule: any = null;
let VoiceLoadPromise: Promise<any> | null = null;
let VoiceLoadAttempted = false;

// Check if we're in an environment where the module might be available
const isModuleEnvironment = (): boolean => {
  try {
    // Only try to load in standalone or bare environments
    // In Expo Go (storeClient), the module definitely doesn't exist
    return Constants?.executionEnvironment === 'standalone' || 
           Constants?.executionEnvironment === 'bare' ||
           !Constants?.executionEnvironment; // Fallback for unknown environments
  } catch {
    // If we can't check, assume we should try (for bare React Native)
    return true;
  }
};

// Safely load Voice module asynchronously
const loadVoiceModule = async (): Promise<any> => {
  if (VoiceModule) {
    return VoiceModule;
  }
  
  if (VoiceLoadPromise) {
    return VoiceLoadPromise;
  }
  
  // Don't even try in Expo Go
  if (!isModuleEnvironment()) {
    VoiceLoadAttempted = true;
    return null;
  }
  
  VoiceLoadAttempted = true;
  
  // Use dynamic import to avoid bundling issues
  VoiceLoadPromise = import('@react-native-voice/voice')
    .then((module) => {
      VoiceModule = module.default || module;
      return VoiceModule;
    })
    .catch((e) => {
      VoiceModule = null;
      return null;
    });
  
  return VoiceLoadPromise;
};

const getVoice = async (): Promise<any> => {
  return await loadVoiceModule();
};

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

  // Check if voice recognition is supported - defer module loading
  useEffect(() => {
    // Load module asynchronously
    loadVoiceModule().then((Voice) => {
      if (!Voice) {
        setIsSupported(false);
        return;
      }

      // Set up availability check and event listeners
      try {
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
      } catch (e) {
        console.warn('Voice module setup failed:', e);
        setIsSupported(false);
      }
    });

    return () => {
      loadVoiceModule().then((Voice) => {
        try {
          if (Voice) {
            Voice.destroy().then(() => Voice.removeAllListeners?.()).catch(() => {});
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
    };
  }, [onCommand]);

  const startListening = useCallback(async () => {
    const Voice = await getVoice();
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
          const Voice = await getVoice();
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
    const Voice = await getVoice();
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
      : 'Voice commands require a development build (not available in Expo Go)',
  };
}

