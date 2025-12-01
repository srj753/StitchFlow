import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CreatePresetModal } from '@/components/counters/CreatePresetModal';
import { usePreventAndroidBack } from '@/hooks/useAndroidBackHandler';
import { useTheme } from '@/hooks/useTheme';
import { useCounterPresetsStore } from '@/store/useCounterPresetsStore';
import { CounterPreset } from '@/types/counterPreset';

type CounterPresetPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (preset: CounterPreset) => void;
};

const categoryLabels: Record<CounterPreset['category'], string> = {
  amigurumi: 'Amigurumi',
  blanket: 'Blanket',
  garment: 'Garment',
  accessory: 'Accessory',
  custom: 'Custom',
};

export function CounterPresetPicker({ visible, onClose, onSelect }: CounterPresetPickerProps) {
  const theme = useTheme();
  const presets = useCounterPresetsStore((state) => state.presets);
  const [selectedCategory, setSelectedCategory] = useState<CounterPreset['category'] | 'all'>('all');
  const [selectedPreset, setSelectedPreset] = useState<CounterPreset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Prevent Android back button when modal is open
  usePreventAndroidBack(visible && !showCreateModal);

  const categories: Array<CounterPreset['category'] | 'all'> = ['all', 'amigurumi', 'blanket', 'garment', 'accessory', 'custom'];

  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'all') return presets;
    return presets.filter((p) => p.category === selectedCategory);
  }, [presets, selectedCategory]);

  // Auto-select first preset when category changes
  useEffect(() => {
    if (filteredPresets.length > 0 && (!selectedPreset || !filteredPresets.find(p => p.id === selectedPreset.id))) {
      setSelectedPreset(filteredPresets[0]);
    } else if (filteredPresets.length === 0) {
      setSelectedPreset(null);
    }
  }, [filteredPresets, selectedPreset]);

  const handlePresetSelect = (preset: CounterPreset) => {
    setSelectedPreset(preset);
  };

  const handleAddToProject = () => {
    if (selectedPreset) {
      onSelect(selectedPreset);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Counter Presets</Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  Choose a preset or create your own
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createButton}>
                  <FontAwesome name="plus" size={18} color={theme.colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FontAwesome name="times" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow} contentContainerStyle={styles.categoryRowContent}>
              {categories.map((category) => {
                const selected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceAlt,
                        borderColor: selected ? theme.colors.accent : theme.colors.border,
                      },
                    ]}>
                    <Text
                      style={{
                        color: selected ? '#000' : theme.colors.textSecondary,
                        fontWeight: selected ? '700' : '500',
                        fontSize: 13,
                      }}>
                      {category === 'all' ? 'All' : categoryLabels[category]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Presets Horizontal Scroll */}
            {filteredPresets.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome name="inbox" size={48} color={theme.colors.muted} style={{ marginBottom: 12 }} />
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', fontSize: 16, marginBottom: 4 }}>
                  No presets in this category
                </Text>
                <Text style={{ color: theme.colors.muted, textAlign: 'center', fontSize: 13 }}>
                  Tap the + button to create a custom preset
                </Text>
              </View>
            ) : (
              <>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.presetsScroll}
                  contentContainerStyle={styles.presetsScrollContent}
                >
                  {filteredPresets.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        onPress={() => handlePresetSelect(preset)}
                        activeOpacity={0.7}
                        style={[
                          styles.presetCard,
                          {
                            backgroundColor: isSelected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}>
                        <View style={styles.presetCardContent}>
                          <View style={styles.presetTitleRow}>
                            <Text 
                              style={[
                                styles.presetName, 
                                { 
                                  color: isSelected ? theme.colors.accent : theme.colors.text,
                                  fontWeight: isSelected ? '800' : '700',
                                }
                              ]}
                              numberOfLines={1}
                            >
                              {preset.name}
                            </Text>
                            <View
                              style={[
                                styles.categoryBadge,
                                { backgroundColor: isSelected ? theme.colors.accent : theme.colors.accentMuted },
                              ]}>
                              <Text style={{ 
                                color: isSelected ? '#000' : theme.colors.accent, 
                                fontSize: 8, 
                                fontWeight: '700' 
                              }}>
                                {categoryLabels[preset.category].toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.countersPreview}>
                            {preset.counters.slice(0, 2).map((counter, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.counterBadge,
                                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                ]}>
                                <FontAwesome
                                  name={counter.type === 'row' ? 'hashtag' : counter.type === 'stitch' ? 'link' : 'tag'}
                                  size={9}
                                  color={theme.colors.accent}
                                  style={{ marginRight: 3 }}
                                />
                                <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '500' }} numberOfLines={1}>
                                  {counter.label}
                                </Text>
                              </View>
                            ))}
                            {preset.counters.length > 2 && (
                              <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                                +{preset.counters.length - 2}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Selected Preset Details */}
                {selectedPreset && (
                  <View style={[styles.selectedPresetDetails, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
                    <View style={styles.selectedPresetHeader}>
                      <View>
                        <Text style={[styles.selectedPresetName, { color: theme.colors.text }]}>
                          {selectedPreset.name}
                        </Text>
                        {selectedPreset.description && (
                          <Text style={[styles.selectedPresetDescription, { color: theme.colors.textSecondary }]}>
                            {selectedPreset.description}
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: theme.colors.accentMuted },
                        ]}>
                        <Text style={{ color: theme.colors.accent, fontSize: 9, fontWeight: '700' }}>
                          {categoryLabels[selectedPreset.category].toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.countersList}>
                      {selectedPreset.counters.map((counter, index) => (
                        <View
                          key={index}
                          style={[
                            styles.counterItem,
                            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                          ]}>
                          <FontAwesome
                            name={counter.type === 'row' ? 'hashtag' : counter.type === 'stitch' ? 'link' : 'tag'}
                            size={12}
                            color={theme.colors.accent}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '500' }}>
                            {counter.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      onPress={handleAddToProject}
                      style={[styles.addButton, { backgroundColor: theme.colors.accent }]}
                    >
                      <Text style={styles.addButtonText}>Add to Project</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
        </View>
      </View>
    </Modal>
    
    <CreatePresetModal
      visible={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onCreated={() => {
        // Presets will refresh automatically from store
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButton: {
    padding: 8,
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
  categoryRow: {
    marginBottom: 20,
  },
  categoryRowContent: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  presetsScroll: {
    marginBottom: 20,
  },
  presetsScrollContent: {
    paddingRight: 20,
  },
  presetCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
    width: 140,
    minHeight: 100,
  },
  presetCardContent: {
    flex: 1,
  },
  presetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },
  categoryBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  countersPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedPresetDetails: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginTop: 8,
  },
  selectedPresetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectedPresetName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  selectedPresetDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  countersList: {
    gap: 8,
    marginBottom: 16,
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});

