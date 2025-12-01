import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { RowAnnotation } from '@/types/pattern';

type PatternRowEditorProps = {
  visible: boolean;
  onClose: () => void;
  rowId: string;
  rowText: string;
  annotation?: RowAnnotation;
  onSave: (annotation: Omit<RowAnnotation, 'rowId' | 'createdAt' | 'modifiedAt'>) => void;
  onDelete?: () => void;
};

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#FFEB3B' },
  { label: 'Green', value: '#4CAF50' },
  { label: 'Blue', value: '#2196F3' },
  { label: 'Orange', value: '#FF9800' },
  { label: 'Pink', value: '#E91E63' },
  { label: 'Purple', value: '#9C27B0' },
];

/**
 * Component for editing row-level annotations
 */
export function PatternRowEditor({
  visible,
  onClose,
  rowId,
  rowText,
  annotation,
  onSave,
  onDelete,
}: PatternRowEditorProps) {
  const theme = useTheme();
  const [note, setNote] = useState(annotation?.note || '');
  const [highlightColor, setHighlightColor] = useState(annotation?.highlightColor);
  const [isCrossedOut, setIsCrossedOut] = useState(annotation?.isCrossedOut || false);

  const handleSave = () => {
    onSave({
      note: note.trim() || undefined,
      highlightColor,
      isCrossedOut,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Edit Row Annotation</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Row Preview */}
            <View style={[styles.rowPreview, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>Row:</Text>
              <Text style={[styles.rowText, { color: theme.colors.text }]}>{rowText}</Text>
            </View>

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Note</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note about this row..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Highlight Color */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Highlight Color</Text>
              <View style={styles.colorGrid}>
                <TouchableOpacity
                  onPress={() => setHighlightColor(undefined)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: !highlightColor ? theme.colors.accent : theme.colors.border,
                      borderWidth: !highlightColor ? 2 : 1,
                    },
                  ]}>
                  <Text style={[styles.colorLabel, { color: theme.colors.textSecondary }]}>None</Text>
                </TouchableOpacity>
                {HIGHLIGHT_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => setHighlightColor(color.value)}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color.value,
                        borderColor: highlightColor === color.value ? theme.colors.accent : 'transparent',
                        borderWidth: highlightColor === color.value ? 2 : 0,
                      },
                    ]}>
                    {highlightColor === color.value && (
                      <FontAwesome name="check" size={16} color="#000" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cross Out Toggle */}
            <View style={styles.section}>
              <TouchableOpacity
                onPress={() => setIsCrossedOut(!isCrossedOut)}
                style={[
                  styles.toggleRow,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderColor: isCrossedOut ? theme.colors.accent : theme.colors.border,
                  },
                ]}>
                <View style={styles.toggleContent}>
                  <FontAwesome
                    name={isCrossedOut ? 'check-square' : 'square-o'}
                    size={20}
                    color={isCrossedOut ? theme.colors.accent : theme.colors.textSecondary}
                  />
                  <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                    Cross out this row
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
            {onDelete && annotation && (
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: '#E74C3C20' }]}>
                <FontAwesome name="trash" size={16} color="#E74C3C" />
                <Text style={[styles.deleteButtonText, { color: '#E74C3C' }]}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: theme.colors.accent }]}>
              <Text style={[styles.saveButtonText, { color: '#000' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  rowPreview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  rowText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});





