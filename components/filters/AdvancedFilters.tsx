import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePreventAndroidBack } from '@/hooks/useAndroidBackHandler';
import { useTheme } from '@/hooks/useTheme';
import { Project } from '@/types/project';

export type AdvancedFilterOptions = {
  status?: Project['status'][];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  tags?: string[];
  hasPhotos?: boolean;
  hasJournal?: boolean;
};

type AdvancedFiltersProps = {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFilterOptions;
  onApply: (filters: AdvancedFilterOptions) => void;
  onReset: () => void;
};

export function AdvancedFilters({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}: AdvancedFiltersProps) {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<AdvancedFilterOptions>(filters);

  // Prevent Android back button when modal is open
  usePreventAndroidBack(visible);

  // Sync local filters when modal opens or filters prop changes
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const statusOptions: Array<{ label: string; value: Project['status'] }> = [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Finished', value: 'finished' },
  ];

  const toggleStatus = (status: Project['status']) => {
    const current = localFilters.status || [];
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setLocalFilters({ ...localFilters, status: next.length > 0 ? next : undefined });
  };

  const toggleHasPhotos = () => {
    setLocalFilters({ ...localFilters, hasPhotos: localFilters.hasPhotos ? undefined : true });
  };

  const toggleHasJournal = () => {
    setLocalFilters({ ...localFilters, hasJournal: localFilters.hasJournal ? undefined : true });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Advanced Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filtersList}>
            {/* Status Multi-Select */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>STATUS</Text>
              <View style={styles.chipRow}>
                {statusOptions.map((option) => {
                  const selected = localFilters.status?.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => toggleStatus(option.value)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceAlt,
                          borderColor: selected ? theme.colors.accent : theme.colors.border,
                        },
                      ]}>
                      <Text
                        style={{
                          color: selected ? '#000' : theme.colors.textSecondary,
                          fontWeight: selected ? '700' : '500',
                        }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Content Filters */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>HAS CONTENT</Text>
              <TouchableOpacity
                onPress={toggleHasPhotos}
                style={[
                  styles.toggleRow,
                  {
                    backgroundColor: localFilters.hasPhotos ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    borderColor: localFilters.hasPhotos ? theme.colors.accent : theme.colors.border,
                  },
                ]}>
                <View style={styles.toggleInfo}>
                  <FontAwesome
                    name="camera"
                    size={16}
                    color={localFilters.hasPhotos ? theme.colors.accent : theme.colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      color: localFilters.hasPhotos ? theme.colors.accent : theme.colors.text,
                      fontWeight: localFilters.hasPhotos ? '600' : '400',
                    }}>
                    Has Photos
                  </Text>
                </View>
                {localFilters.hasPhotos && (
                  <FontAwesome name="check" size={14} color={theme.colors.accent} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleHasJournal}
                style={[
                  styles.toggleRow,
                  {
                    backgroundColor: localFilters.hasJournal ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    borderColor: localFilters.hasJournal ? theme.colors.accent : theme.colors.border,
                  },
                ]}>
                <View style={styles.toggleInfo}>
                  <FontAwesome
                    name="book"
                    size={16}
                    color={localFilters.hasJournal ? theme.colors.accent : theme.colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      color: localFilters.hasJournal ? theme.colors.accent : theme.colors.text,
                      fontWeight: localFilters.hasJournal ? '600' : '400',
                    }}>
                    Has Journal Entries
                  </Text>
                </View>
                {localFilters.hasJournal && (
                  <FontAwesome name="check" size={14} color={theme.colors.accent} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={handleReset}
              style={[
                styles.actionButton,
                styles.actionButtonSecondary,
                { borderColor: theme.colors.border },
              ]}>
              <Text style={{ color: theme.colors.textSecondary }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={[styles.actionButton, styles.actionButtonPrimary, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.actionButtonText}>Apply Filters</Text>
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
    zIndex: 1000,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  filtersList: {
    flexShrink: 0,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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

