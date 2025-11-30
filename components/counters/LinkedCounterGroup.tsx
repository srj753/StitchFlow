import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ProjectCounter } from '@/types/project';

type LinkedCounterGroupProps = {
  counters: ProjectCounter[];
  linkedIds: string[];
  onIncrement: (counterId: string, delta: number) => void;
  onSetValue: (counterId: string, value: number) => void;
  onUnlink: (counterId: string) => void;
};

export function LinkedCounterGroup({
  counters,
  linkedIds,
  onIncrement,
  onSetValue,
  onUnlink,
}: LinkedCounterGroupProps) {
  const theme = useTheme();

  // Get the actual counter objects
  const linkedCounters = useMemo(() => {
    return counters.filter((c) => linkedIds.includes(c.id));
  }, [counters, linkedIds]);

  // Calculate total
  const total = useMemo(() => {
    return linkedCounters.reduce((sum, counter) => sum + counter.currentValue, 0);
  }, [linkedCounters]);

  if (linkedCounters.length < 2) return null;

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.accent,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      {/* Header with Total and Advance All Button */}
      <View style={styles.header}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          <Text style={[styles.totalValue, { color: theme.colors.accent }]}>{total}</Text>
        </View>
        <View style={styles.linkIndicator}>
          <FontAwesome name="link" size={12} color={theme.colors.accent} />
          <Text style={[styles.linkText, { color: theme.colors.accent }]}>
            {linkedCounters.length} linked
          </Text>
        </View>
      </View>

      {/* Advance All Button - Like knitCompanion's single button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          linkedCounters.forEach((counter) => {
            onIncrement(counter.id, 1);
          });
        }}
        style={[
          styles.advanceAllButton,
          {
            backgroundColor: theme.colors.accent,
          },
        ]}>
        <FontAwesome name="plus" size={20} color="#000" style={{ marginRight: 8 }} />
        <Text style={styles.advanceAllText}>Advance All</Text>
      </TouchableOpacity>

      {/* Individual Counters */}
      <View style={styles.countersList}>
        {linkedCounters.map((counter, index) => (
          <View key={counter.id} style={styles.counterRow}>
            <View style={styles.counterInfo}>
              <Text style={[styles.counterLabel, { color: theme.colors.text }]}>{counter.label}</Text>
              <Text style={[styles.counterValue, { color: theme.colors.textSecondary }]}>
                {counter.currentValue}
              </Text>
            </View>
            <View style={styles.counterActions}>
              <TouchableOpacity
                onPress={() => onIncrement(counter.id, -1)}
                style={[styles.actionButton, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.text }}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onIncrement(counter.id, 1)}
                style={[
                  styles.actionButton,
                  styles.actionButtonPrimary,
                  { backgroundColor: theme.colors.accent },
                ]}>
                <Text style={{ color: '#000', fontWeight: '700' }}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onUnlink(counter.id)}
                style={[styles.unlinkButton, { borderColor: theme.colors.border }]}>
                <FontAwesome name="unlink" size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {index < linkedCounters.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  linkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 100, 150, 0.1)',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countersList: {
    gap: 0,
  },
  counterRow: {
    paddingVertical: 12,
  },
  counterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  counterActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    borderWidth: 0,
  },
  unlinkButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginTop: 12,
  },
  advanceAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  advanceAllText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
});

