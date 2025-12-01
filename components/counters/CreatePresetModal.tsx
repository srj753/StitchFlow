import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { usePreventAndroidBack } from '@/hooks/useAndroidBackHandler';
import { useTheme } from '@/hooks/useTheme';
import { useCounterPresetsStore } from '@/store/useCounterPresetsStore';
import { CounterPreset, CounterPresetInput } from '@/types/counterPreset';

type CreatePresetModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreatePresetModal({ visible, onClose, onCreated }: CreatePresetModalProps) {
  const theme = useTheme();
  const addPreset = useCounterPresetsStore((state) => state.addPreset);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CounterPreset['category']>('custom');
  const [counters, setCounters] = useState<CounterPresetInput['counters']>([
    { type: 'custom', label: 'Counter 1', targetValue: undefined },
  ]);

  // Prevent Android back button when modal is open
  usePreventAndroidBack(visible);

  const categories: Array<{ label: string; value: CounterPreset['category'] }> = [
    { label: 'Amigurumi', value: 'amigurumi' },
    { label: 'Blanket', value: 'blanket' },
    { label: 'Garment', value: 'garment' },
    { label: 'Accessory', value: 'accessory' },
    { label: 'Custom', value: 'custom' },
  ];

  const counterTypes: Array<{ label: string; value: CounterPresetInput['counters'][0]['type'] }> = [
    { label: 'Row', value: 'row' },
    { label: 'Stitch', value: 'stitch' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleAddCounter = () => {
    setCounters([...counters, { type: 'custom', label: `Counter ${counters.length + 1}`, targetValue: undefined }]);
  };

  const handleRemoveCounter = (index: number) => {
    if (counters.length > 1) {
      setCounters(counters.filter((_, i) => i !== index));
    }
  };

  const handleUpdateCounter = (index: number, updates: Partial<CounterPresetInput['counters'][0]>) => {
    setCounters(counters.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    addPreset({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      counters,
    });
    setName('');
    setDescription('');
    setCategory('custom');
    setCounters([{ type: 'custom', label: 'Counter 1', targetValue: undefined }]);
    onCreated?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create Preset</Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                Build a custom counter template
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., My Amigurumi Template"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border },
                ]}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text, borderColor: theme.colors.border },
                ]}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
              <View style={styles.chipRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: category === cat.value ? theme.colors.accent : theme.colors.surfaceAlt,
                        borderColor: category === cat.value ? theme.colors.accent : theme.colors.border,
                      },
                    ]}>
                    <Text
                      style={{
                        color: category === cat.value ? '#000' : theme.colors.textSecondary,
                        fontWeight: category === cat.value ? '700' : '500',
                      }}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Counters */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Counters</Text>
                <TouchableOpacity onPress={handleAddCounter} style={styles.addButton}>
                  <FontAwesome name="plus" size={12} color={theme.colors.accent} />
                  <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
              {counters.map((counter, index) => (
                <View
                  key={index}
                  style={[
                    styles.counterRow,
                    { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
                  ]}>
                  <View style={styles.counterInputs}>
                    <View style={styles.counterTypeSelect}>
                      {counterTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          onPress={() => handleUpdateCounter(index, { type: type.value })}
                          style={[
                            styles.typeChip,
                            {
                              backgroundColor:
                                counter.type === type.value ? theme.colors.accent : 'transparent',
                              borderColor: theme.colors.border,
                            },
                          ]}>
                          <Text
                            style={{
                              color: counter.type === type.value ? '#000' : theme.colors.textSecondary,
                              fontSize: 11,
                              fontWeight: counter.type === type.value ? '700' : '500',
                            }}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      value={counter.label}
                      onChangeText={(text) => handleUpdateCounter(index, { label: text })}
                      placeholder="Counter label"
                      placeholderTextColor={theme.colors.muted}
                      style={[
                        styles.counterLabelInput,
                        { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border },
                      ]}
                    />
                  </View>
                  {counters.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveCounter(index)} style={styles.removeButton}>
                      <FontAwesome name="trash" size={14} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: theme.colors.border }]}>
              <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={!name.trim()}
              style={[
                styles.actionButton,
                styles.actionButtonPrimary,
                { backgroundColor: theme.colors.accent, opacity: name.trim() ? 1 : 0.5 },
              ]}>
              <Text style={styles.actionButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    padding: 8,
    marginTop: -4,
  },
  scrollContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  counterInputs: {
    flex: 1,
    gap: 8,
  },
  counterTypeSelect: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  counterLabelInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    borderWidth: 1,
  },
  actionButtonPrimary: {
    borderWidth: 0,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});

