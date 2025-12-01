import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Pattern, RowAnnotation } from '@/types/pattern';
import { PatternRowEditor } from './PatternRowEditor';

type PatternAnnotationsProps = {
  pattern: Pattern;
  parsedLines: Array<{ id: string; text: string }>;
  onAnnotationChange: (
    rowId: string,
    annotation: Omit<RowAnnotation, 'rowId' | 'createdAt' | 'modifiedAt'>,
  ) => void;
  onAnnotationDelete: (rowId: string) => void;
};

/**
 * Component for managing pattern annotations
 */
export function PatternAnnotations({
  pattern,
  parsedLines,
  onAnnotationChange,
  onAnnotationDelete,
}: PatternAnnotationsProps) {
  const theme = useTheme();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const annotations = pattern.rowAnnotations || {};

  const getAnnotatedRows = () => {
    return parsedLines.filter((line) => annotations[line.id]);
  };

  const annotatedRows = getAnnotatedRows();

  if (annotatedRows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="sticky-note-o" size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No annotations yet
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          Tap on a row in the pattern view to add an annotation
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {annotatedRows.map((line) => {
        const annotation = annotations[line.id];
        if (!annotation) return null;

        return (
          <TouchableOpacity
            key={line.id}
            onPress={() => setEditingRowId(line.id)}
            style={[
              styles.annotationCard,
              {
                backgroundColor: annotation.highlightColor
                  ? `${annotation.highlightColor}20`
                  : theme.colors.surface,
                borderLeftColor: annotation.highlightColor || theme.colors.accent,
                borderLeftWidth: 4,
              },
            ]}>
            <View style={styles.annotationHeader}>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowId, { color: theme.colors.textSecondary }]}>
                  Row {line.id.split('-')[1] || 'N/A'}
                </Text>
                {annotation.isCrossedOut && (
                  <View style={[styles.badge, { backgroundColor: '#E74C3C20' }]}>
                    <Text style={[styles.badgeText, { color: '#E74C3C' }]}>Crossed Out</Text>
                  </View>
                )}
              </View>
              <FontAwesome name="edit" size={16} color={theme.colors.textSecondary} />
            </View>

            <Text
              style={[
                styles.rowText,
                {
                  color: theme.colors.text,
                  textDecorationLine: annotation.isCrossedOut ? 'line-through' : 'none',
                },
              ]}>
              {line.text}
            </Text>

            {annotation.note && (
              <View style={[styles.noteContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                <FontAwesome name="comment-o" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.noteText, { color: theme.colors.text }]}>
                  {annotation.note}
                </Text>
              </View>
            )}

            {annotation.createdAt && (
              <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                Added {new Date(annotation.createdAt).toLocaleDateString()}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}

      {editingRowId && (
        <PatternRowEditor
          visible={!!editingRowId}
          onClose={() => setEditingRowId(null)}
          rowId={editingRowId}
          rowText={parsedLines.find((l) => l.id === editingRowId)?.text || ''}
          annotation={annotations[editingRowId]}
          onSave={(annotation) => {
            onAnnotationChange(editingRowId, annotation);
            setEditingRowId(null);
          }}
          onDelete={() => {
            onAnnotationDelete(editingRowId);
            setEditingRowId(null);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  annotationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  annotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowId: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rowText: {
    fontSize: 16,
    lineHeight: 24,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
});



