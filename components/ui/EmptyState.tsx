import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string; // Emoji or text icon
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = '📭',
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.accent,
            },
          ]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
  },
  actionText: {
    color: '#07080c',
    fontWeight: '700',
    fontSize: 16,
  },
});




