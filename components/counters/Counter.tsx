import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ProjectCounter } from '@/types/project';

type CounterProps = {
  counter: ProjectCounter;
  onIncrement: (delta: number) => void;
  onSetValue: (value: number) => void;
  onRename?: (label: string) => void;
  onDelete?: () => void;
  onLink?: () => void;
  isLinked?: boolean;
};

export function Counter({ counter, onIncrement, onSetValue, onRename, onDelete, onLink, isLinked }: CounterProps) {
  const theme = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editValue, setEditValue] = useState(counter.currentValue.toString());
  const [renameValue, setRenameValue] = useState(counter.label);
  
  // Animation value
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const progress = counter.targetValue
    ? Math.min(100, (counter.currentValue / counter.targetValue) * 100)
    : undefined;

  const animatePulse = (direction: 'up' | 'down' = 'up') => {
    const scaleTo = direction === 'up' ? 1.2 : 0.9;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: scaleTo,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleIncrement = (delta: number) => {
      if (delta > 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          animatePulse('up');
      } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          animatePulse('down');
      }
      onIncrement(delta);
  };

  const handleSaveEdit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSetValue(parsed);
    }
    setShowEditModal(false);
  };

  const handleOpenEdit = () => {
    setEditValue(counter.currentValue.toString());
    setShowEditModal(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onRename ? setShowRenameModal(true) : undefined} activeOpacity={onRename ? 0.7 : 1}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{counter.label}</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {onLink && (
            <TouchableOpacity onPress={onLink} style={styles.linkButton}>
              <FontAwesome name={isLinked ? "link" : "chain-broken"} size={12} color={isLinked ? theme.colors.accent : theme.colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={{ color: isLinked ? theme.colors.accent : theme.colors.textSecondary, fontSize: 12 }}>Link</Text>
            </TouchableOpacity>
          )}
          {onRename && (
            <TouchableOpacity onPress={() => setShowRenameModal(true)} style={styles.renameButton}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Rename</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Counter Value */}
      <TouchableOpacity onPress={handleOpenEdit} style={styles.valueContainer} activeOpacity={0.7}>
        <Animated.Text 
            style={[
                styles.value, 
                { 
                    color: theme.colors.text,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            {counter.currentValue}
        </Animated.Text>
        {counter.targetValue !== undefined && (
          <Text style={[styles.target, { color: theme.colors.textSecondary }]}>
            / {counter.targetValue}
          </Text>
        )}
      </TouchableOpacity>

      {/* Progress Bar */}
      {progress !== undefined && (
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.cardMuted }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, progress))}%`,
                backgroundColor: theme.colors.accent,
              },
            ]}
          />
        </View>
      )}

      {/* Quick Increment Buttons */}
      <View style={styles.quickButtons}>
        <QuickButton
          label="-10"
          onPress={() => handleIncrement(-10)}
          theme={theme}
        />
        <QuickButton
          label="-5"
          onPress={() => handleIncrement(-5)}
          theme={theme}
        />
        <QuickButton
          label="-1"
          onPress={() => handleIncrement(-1)}
          theme={theme}
          large
        />
        <QuickButton
          label="+1"
          onPress={() => handleIncrement(1)}
          theme={theme}
          large
          primary
        />
        <QuickButton
          label="+5"
          onPress={() => handleIncrement(5)}
          theme={theme}
        />
        <QuickButton
          label="+10"
          onPress={() => handleIncrement(10)}
          theme={theme}
        />
        <QuickButton
          label="+20"
          onPress={() => handleIncrement(20)}
          theme={theme}
        />
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit {counter.label}
            </Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="number-pad"
              autoFocus
              selectTextOnFocus
              style={[
                styles.modalInput,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                },
              ]}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={[styles.modalButton, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: theme.colors.accent },
                ]}>
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      {onRename && (
        <Modal visible={showRenameModal} transparent animationType="fade" onRequestClose={() => setShowRenameModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Rename Counter</Text>
              <TextInput
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder="Counter name"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.modalInput,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceAlt,
                    color: theme.colors.text,
                  },
                ]}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowRenameModal(false);
                    setRenameValue(counter.label);
                  }}
                  style={[
                    styles.modalButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceAlt,
                    },
                  ]}>
                  <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (renameValue.trim()) {
                      onRename(renameValue.trim());
                      setShowRenameModal(false);
                    }
                  }}
                  style={[
                    styles.modalButton,
                    styles.modalButtonPrimary,
                    {
                      backgroundColor: theme.colors.accent,
                    },
                  ]}>
                  <Text style={styles.modalButtonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function QuickButton({
  label,
  onPress,
  theme,
  large,
  primary,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  large?: boolean;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.quickButton,
        large && styles.quickButtonLarge,
        {
          borderColor: primary ? theme.colors.accent : theme.colors.border,
          backgroundColor: primary ? theme.colors.accentMuted : theme.colors.surfaceAlt,
        },
      ]}>
      <Text
        style={[
          styles.quickButtonText,
          large && styles.quickButtonTextLarge,
          {
            color: primary ? theme.colors.accent : theme.colors.text,
          },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  renameButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  target: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  quickButtonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 70,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickButtonTextLarge: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonPrimaryText: {
    color: '#07080c',
    fontWeight: '700',
  },
});
