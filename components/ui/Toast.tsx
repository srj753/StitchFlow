import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
};

export function Toast({ message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const theme = useTheme();
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-20));

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    // Auto-hide
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide, opacity, translateY]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.accent;
      case 'error':
        return '#ef4444';
      default:
        return theme.colors.surfaceAlt;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#07080c';
      case 'error':
        return '#ffffff';
      default:
        return theme.colors.text;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: theme.colors.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
    </Animated.View>
  );
}

type ToastManagerProps = {
  toasts: Array<{ id: string; message: string; type?: ToastType }>;
  onRemove: (id: string) => void;
};

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  if (toasts.length === 0) return null;

  return (
    <View style={styles.manager} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={() => onRemove(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
  },
  manager: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});




