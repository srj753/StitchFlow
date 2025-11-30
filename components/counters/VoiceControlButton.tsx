import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useVoiceCommand, VoiceStatus } from '@/hooks/useVoiceCommand';
import { ParsedCommand } from '@/lib/voiceCommands';

type VoiceControlButtonProps = {
  onCommand: (command: ParsedCommand) => void;
  enabled?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export function VoiceControlButton({
  onCommand,
  enabled = true,
  size = 'medium',
}: VoiceControlButtonProps) {
  const theme = useTheme();
  const { status, error, isSupported, startListening, stopListening, speak } =
    useVoiceCommand({
      onCommand,
      enabled,
    });

  // Provide audio feedback for status changes
  useEffect(() => {
    if (status === 'listening') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      speak('Listening...');
    } else if (status === 'processing') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (status === 'error' && error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [status, error, speak]);

  const handlePress = () => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, icon: 16 };
      case 'large':
        return { width: 64, height: 64, icon: 24 };
      default:
        return { width: 48, height: 48, icon: 20 };
    }
  };

  const buttonSize = getButtonSize();
  const isActive = status === 'listening';

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!enabled || status === 'processing' || status === 'speaking'}
        activeOpacity={0.7}
        style={[
          styles.button,
          {
            width: buttonSize.width,
            height: buttonSize.height,
            backgroundColor: isActive
              ? theme.colors.accent
              : theme.colors.surfaceAlt,
            borderColor: isActive ? theme.colors.accent : theme.colors.border,
          },
        ]}>
        {status === 'processing' ? (
          <ActivityIndicator
            size="small"
            color={isActive ? '#000' : theme.colors.text}
          />
        ) : (
          <FontAwesome
            name={isActive ? 'microphone' : 'microphone-slash'}
            size={buttonSize.icon}
            color={isActive ? '#000' : theme.colors.text}
          />
        )}
      </TouchableOpacity>
      
      {error && (
        <Text style={[styles.errorText, { color: '#ff4444' }]} numberOfLines={1}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  button: {
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 10,
    textAlign: 'center',
  },
});

