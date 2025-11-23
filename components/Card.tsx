import { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type CardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  style?: ViewStyle;
  highlight?: boolean;
};

export function Card({ title, subtitle, children, style, highlight }: CardProps) {
  const theme = useTheme();
  const shadowStyle = Platform.select({
    web: {
      boxShadow: `0px 20px 40px ${theme.colors.shadow}`,
    },
    default: {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 14 },
    },
  });

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: highlight ? theme.colors.accent : theme.colors.border,
        },
        shadowStyle,
        style,
      ]}>
      {title ? (
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ marginTop: title || subtitle ? theme.spacing.sm : 0 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
});



