import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string | { name: keyof typeof FontAwesome.glyphMap; size?: number }; // Emoji string or FontAwesome icon config
  compact?: boolean; // For smaller inline empty states
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = '📭',
  compact = false,
}: EmptyStateProps) {
  const theme = useTheme();
  const isIconObject = typeof icon === 'object';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {icon && (
        isIconObject ? (
          <FontAwesome 
            name={icon.name} 
            size={icon.size || (compact ? 32 : 48)} 
            color={theme.colors.muted} 
            style={styles.iconFontAwesome}
          />
        ) : (
          <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
        )
      )}
      <Text style={[styles.title, { color: theme.colors.text }, compact && styles.titleCompact]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: theme.colors.textSecondary }, compact && styles.descriptionCompact]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.accent,
            },
            compact && styles.actionButtonCompact,
          ]}>
          <Text style={[styles.actionText, compact && styles.actionTextCompact]}>{actionLabel}</Text>
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
  containerCompact: {
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  iconCompact: {
    fontSize: 32,
    marginBottom: 12,
  },
  iconFontAwesome: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 16,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  descriptionCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
  },
  actionButtonCompact: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  actionText: {
    color: '#07080c',
    fontWeight: '700',
    fontSize: 16,
  },
  actionTextCompact: {
    fontSize: 14,
  },
});




