import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

type ProjectCardProps = {
  project: Project;
  onPress?: () => void;
  isActive?: boolean;
  index?: number;
};

export const ProjectCard = memo(function ProjectCard({
  project,
  onPress,
  isActive,
  index = 0,
}: ProjectCardProps) {
  const theme = useTheme();
  const updateCounter = useProjectsStore((state) => state.updateCounter);
  const setActiveProject = useProjectsStore((state) => state.setActiveProject);
  const incrementRound = useProjectsStore((state) => state.incrementRound);

  const rowCounter = useMemo(() => {
    return project.counters.find((c) => c.type === 'row' || c.label.toLowerCase().includes('row')) || project.counters[0];
  }, [project.counters]);

  const progress = useMemo(() => {
    if (!rowCounter || !rowCounter.targetValue || rowCounter.targetValue <= 0) return 0;
    return Math.min(100, (rowCounter.currentValue / rowCounter.targetValue) * 100);
  }, [rowCounter]);

  const lastUpdated = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });
    } catch (e) {
      return '';
    }
  }, [project.updatedAt]);

  const handleQuickAdjust = useCallback(
    (delta: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (rowCounter) {
        updateCounter(project.id, rowCounter.id, rowCounter.currentValue + delta);
      } else {
        incrementRound(project.id, delta);
      }
    },
    [incrementRound, project.id, rowCounter, updateCounter],
  );

  const handleOpen = useCallback(() => {
    setActiveProject(project.id);
    onPress?.();
  }, [onPress, project.id, setActiveProject]);

  const hasImage = !!project.thumbnail;

  // Generate a stable gradient based on project ID if no image
  const gradientColors = useMemo(() => {
    const gradients = [
      ['#F472B6', '#DB2777'], // Pink
      ['#60A5FA', '#2563EB'], // Blue
      ['#34D399', '#059669'], // Green
      ['#A78BFA', '#7C3AED'], // Purple
      ['#FBBF24', '#D97706'], // Amber
      ['#FB7185', '#E11D48'], // Rose
      ['#22D3EE', '#0891B2'], // Cyan
    ];
    const idx = project.id.charCodeAt(0) % gradients.length;
    return gradients[idx];
  }, [project.id]);

  // Get status color
  const getStatusColor = () => {
    if (isActive) return theme.colors.accent;
    if (project.status === 'finished') return '#22c55e';
    if (project.status === 'paused') return theme.colors.muted;
    return theme.colors.textSecondary;
  };

  const getStatusLabel = () => {
    if (isActive) return 'Active';
    if (project.status === 'finished') return 'Done';
    if (project.status === 'paused') return 'Paused';
    return 'In Progress';
  };

  return (
    <SlideUp delay={index * 50} duration={350}>
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.92}
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isActive ? theme.colors.accent : theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}>

        {/* Horizontal Layout */}
        <View style={styles.horizontalLayout}>

          {/* Left: Image/Gradient */}
          <View style={styles.imageContainer}>
            {hasImage ? (
              <Image source={{ uri: project.thumbnail }} style={styles.image} />
            ) : (
              <LinearGradient
                colors={gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientPlaceholder}
              >
                <FontAwesome name="heart-o" size={24} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
            )}

            {/* Progress Overlay Ring */}
            {progress > 0 && (
              <View style={styles.progressRingContainer}>
                <View style={[styles.progressRingBg, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.progressRingText}>{Math.round(progress)}%</Text>
                </View>
              </View>
            )}
          </View>

          {/* Right: Content */}
          <View style={styles.content}>
            {/* Status Badge */}
            <View style={styles.topRow}>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {getStatusLabel()}
                </Text>
              </View>
              <Text style={[styles.timeText, { color: theme.colors.muted }]}>
                {lastUpdated}
              </Text>
            </View>

            {/* Title & Pattern */}
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={[styles.patternName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {project.patternName || 'Custom Project'}
            </Text>

            {/* Bottom: Counter + Action */}
            <View style={styles.bottomRow}>
              <View style={styles.counterInfo}>
                <Text style={[styles.counterLabel, { color: theme.colors.muted }]}>
                  {rowCounter?.label || 'Row'}
                </Text>
                <View style={styles.counterValueRow}>
                  <Text style={[styles.counterValue, { color: theme.colors.text }]}>
                    {rowCounter?.currentValue || 0}
                  </Text>
                  {rowCounter?.targetValue && (
                    <Text style={[styles.counterTarget, { color: theme.colors.muted }]}>
                      /{rowCounter.targetValue}
                    </Text>
                  )}
                </View>
              </View>

              {/* Quick Increment FAB */}
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.accent }]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickAdjust(1);
                }}
              >
                <FontAwesome name="plus" size={14} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Progress Bar at Bottom */}
        <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%`, backgroundColor: theme.colors.accent }
            ]}
          />
        </View>
      </TouchableOpacity>
    </SlideUp>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
  },
  horizontalLayout: {
    flexDirection: 'row',
    padding: 12,
    gap: 14,
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingContainer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  progressRingBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  patternName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  counterInfo: {
    gap: 2,
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  counterTarget: {
    fontSize: 13,
    fontWeight: '500',
  },
  fab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBarTrack: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
});
