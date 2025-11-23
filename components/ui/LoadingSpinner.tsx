import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type LoadingSpinnerProps = {
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
};

export function LoadingSpinner({ size = 'small', color, overlay }: LoadingSpinnerProps) {
  const theme = useTheme();
  const spinnerColor = color || theme.colors.accent;

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={spinnerColor} />;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});




