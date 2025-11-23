import { memo, useCallback, useMemo } from 'react';
import {
  DimensionValue,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

type ProjectCardProps = {
  project: Project;
  onPress?: () => void;
  isActive?: boolean;
};

const statusCopy: Record<Project['status'], string> = {
  active: 'In progress',
  paused: 'On hold',
  finished: 'Finished',
};

const sourceCopy: Record<Project['patternSourceType'], string> = {
  external: 'External link',
  'built-in': 'Built-in pattern',
  'my-pattern': 'My notes',
};

export const ProjectCard = memo(function ProjectCard({
  project,
  onPress,
  isActive,
}: ProjectCardProps) {
  const theme = useTheme();
  const incrementRound = useProjectsStore((state) => state.incrementRound);
  const setActiveProject = useProjectsStore((state) => state.setActiveProject);
  const status = (project.status ?? 'active') as Project['status'];
  const shadowStyle = Platform.select({
    web: {
      boxShadow: `0px 18px 36px ${theme.colors.shadow}`,
    },
    default: {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.15,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
    },
  });

  // Use counters instead of legacy fields
  const rowCounter = useMemo(() => {
    return project.counters.find((c) => c.type === 'row' || c.label.toLowerCase().includes('row'));
  }, [project.counters]);

  const progress = useMemo(() => {
    if (!rowCounter || !rowCounter.targetValue || rowCounter.targetValue <= 0) return undefined;
    return Math.min(100, (rowCounter.currentValue / rowCounter.targetValue) * 100);
  }, [rowCounter]);

  const palette = project.colorPalette?.slice(0, 4) ?? [];
  const progressWidth = useMemo(() => {
    if (progress === undefined) return undefined;
    if (progress <= 0) return 0;
    return Math.max(progress, 1);
  }, [progress]);
  const progressWidthPercent = useMemo<DimensionValue | undefined>(() => {
    if (progressWidth === undefined) return undefined;
    const bounded = Math.min(100, Math.max(0, progressWidth));
    return `${bounded.toFixed(2)}%` as DimensionValue;
  }, [progressWidth]);

  const updateCounter = useProjectsStore((state) => state.updateCounter);

  const handleQuickAdjust = useCallback(
    (delta: number) => {
      if (rowCounter) {
        updateCounter(project.id, rowCounter.id, rowCounter.currentValue + delta);
      } else {
        // Fallback to legacy
        incrementRound(project.id, delta);
      }
    },
    [incrementRound, project.id, rowCounter, updateCounter],
  );

  const handleOpen = useCallback(() => {
    setActiveProject(project.id);
    onPress?.();
  }, [onPress, project.id, setActiveProject]);

  return (
    <TouchableOpacity
      onPress={handleOpen}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: isActive ? theme.colors.accent : theme.colors.border,
        },
        shadowStyle,
      ]}>
      <View style={[styles.headerRow, styles.block]}>
        <View style={styles.titleColumn}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{project.name}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {project.patternName ? project.patternName : 'Custom plan'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isActive ? theme.colors.accentMuted : theme.colors.surfaceAlt,
              borderColor: isActive ? theme.colors.accent : theme.colors.border,
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              { color: isActive ? theme.colors.accent : theme.colors.textSecondary },
            ]}>
            {statusCopy[status]}
          </Text>
        </View>
      </View>
      <View style={[styles.metaRow, styles.block]}>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>
          {sourceCopy[project.patternSourceType]}
        </Text>
      </View>

      {project.yarnWeight ? (
        <Text style={[styles.meta, styles.block, { color: theme.colors.muted }]}>
          Yarn weight · {project.yarnWeight}
        </Text>
      ) : null}

      <View style={[styles.statRow, styles.block]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.colors.muted }]}>
            {rowCounter?.label ?? 'Rows'}
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {rowCounter?.currentValue ?? 0}
            {rowCounter?.targetValue ? ` / ${rowCounter.targetValue}` : ''}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.colors.muted }]}>Height</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {project.currentHeightInches.toFixed(1)} in
          </Text>
        </View>
      </View>

      {progressWidthPercent !== undefined ? (
        <View
          style={[styles.progressTrack, styles.block, { backgroundColor: theme.colors.cardMuted }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: Math.round(progressWidth ?? 0), min: 0, max: 100 }}>
          <View
            style={[
              styles.progressFill,
              {
                width: progressWidthPercent,
                backgroundColor: theme.colors.accent,
              },
            ]}
          />
        </View>
      ) : null}

      {palette.length > 0 ? (
        <View style={[styles.paletteRow, styles.block]}>
          {palette.map((color) => (
            <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
          ))}
        </View>
      ) : null}

      <View style={[styles.actionRow, styles.block]}>
        <TouchableOpacity
          onPress={() => handleQuickAdjust(-1)}
          style={[
            styles.actionButton,
            {
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={{ color: theme.colors.textSecondary }}>-1 round</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleQuickAdjust(1)}
          style={[
            styles.actionButton,
            {
              borderColor: theme.colors.accent,
              backgroundColor: theme.colors.accentMuted,
            },
          ]}>
          <Text style={{ color: theme.colors.accent }}>+1 round</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleOpen}
          style={[
            styles.actionButton,
            styles.actionButtonLast,
            {
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={{ color: theme.colors.textSecondary }}>Open</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
        Updated {new Date(project.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 4,
  },
  block: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  actionButtonLast: {
    marginRight: 0,
  },
});

