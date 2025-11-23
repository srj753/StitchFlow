import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { JournalEntry as JournalEntryType } from '@/types/project';

type JournalEntryProps = {
  entry: JournalEntryType;
  onDelete?: () => void;
};

export function JournalEntry({ entry, onDelete }: JournalEntryProps) {
  const theme = useTheme();

  const getTypeLabel = () => {
    switch (entry.type) {
      case 'note':
        return 'Note';
      case 'progress':
        return 'Progress';
      case 'finished':
        return 'Finished';
      case 'photo':
        return 'Photo';
      case 'milestone':
        return 'Milestone';
      default:
        return 'Entry';
    }
  };

  const getTypeColor = () => {
    switch (entry.type) {
      case 'finished':
      case 'milestone':
        return theme.colors.accent;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceAlt,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  entry.type === 'finished' || entry.type === 'milestone'
                    ? theme.colors.accentMuted
                    : theme.colors.cardMuted,
              },
            ]}>
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color: getTypeColor(),
                },
              ]}>
              {getTypeLabel()}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: theme.colors.muted }]}>
            {formatDate(entry.createdAt)}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {entry.title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>{entry.title}</Text>
      )}

      {entry.text && <Text style={[styles.text, { color: theme.colors.textSecondary }]}>{entry.text}</Text>}

      {entry.photoUri && (
        <Image source={{ uri: entry.photoUri }} style={styles.photo} resizeMode="cover" />
      )}

      {entry.metadata && (
        <View style={styles.metadata}>
          {entry.metadata.roundsCompleted !== undefined && (
            <Text style={[styles.metadataText, { color: theme.colors.muted }]}>
              Rounds: {entry.metadata.roundsCompleted}
            </Text>
          )}
          {entry.metadata.heightAchieved !== undefined && (
            <Text style={[styles.metadataText, { color: theme.colors.muted }]}>
              Height: {entry.metadata.heightAchieved}"
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  metadata: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
  },
});




