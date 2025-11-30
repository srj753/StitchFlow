import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
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
    return project.counters.find((c) => c.type === 'row' || c.label.toLowerCase().includes('row'));
  }, [project.counters]);

  const progress = useMemo(() => {
    if (!rowCounter || !rowCounter.targetValue || rowCounter.targetValue <= 0) return undefined;
    return Math.min(100, (rowCounter.currentValue / rowCounter.targetValue) * 100);
  }, [rowCounter]);

  const handleQuickAdjust = useCallback(
    (delta: number) => {
      if (delta > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
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
  const palette = project.colorPalette?.slice(0, 5) ?? [];

  return (
    <SlideUp delay={index * 50} duration={300}>
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.9}
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isActive ? theme.colors.accent : theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}>
        
        {/* Layout: Image Left (if exists) or Top Bar (if no image) */}
        <View style={[styles.content, !hasImage && styles.contentNoImage]}>
          {hasImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: project.thumbnail }} style={styles.image} />
              {/* Progress Bar Overlay on Image */}
              {progress !== undefined && (
                <View style={styles.progressOverlay}>
                  <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.colors.accent }]} />
                </View>
              )}
            </View>
          ) : (
            // Fallback: Decorative Top Bar if no image
            <View style={[styles.decorativeBar, { backgroundColor: palette[0] || theme.colors.accent }]}>
               {progress !== undefined && (
                  <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: 'rgba(255,255,255,0.5)' }]} />
               )}
            </View>
          )}

          {/* Info Column */}
          <View style={styles.infoContainer}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                {project.name}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {project.patternName || 'Custom Pattern'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                <FontAwesome name="hashtag" size={10} color={theme.colors.textSecondary} style={{marginRight: 4}} />
                <Text style={[styles.statText, { color: theme.colors.text }]}>
                  {rowCounter ? `${rowCounter.currentValue}` : '0'}
                  {rowCounter?.targetValue ? `/${rowCounter.targetValue}` : ''}
                </Text>
              </View>

              {project.timeSpentMinutes > 0 && (
                <View style={[styles.statBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <FontAwesome name="clock-o" size={10} color={theme.colors.textSecondary} style={{marginRight: 4}} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>
                    {Math.floor(project.timeSpentMinutes / 60)}h {project.timeSpentMinutes % 60}m
                  </Text>
                </View>
              )}
            </View>

            {/* Palette (Only show if no image to add visual interest) */}
            {!hasImage && palette.length > 0 && (
              <View style={styles.paletteRow}>
                {palette.map((color, i) => (
                  <View key={i} style={[styles.swatch, { backgroundColor: color }]} />
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionRow}>
               <TouchableOpacity
                onPress={() => handleQuickAdjust(1)}
                style={[styles.quickBtn, { backgroundColor: theme.colors.accent }]}>
                <FontAwesome name="plus" size={12} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SlideUp>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  content: {
    flexDirection: 'row',
    height: 110,
  },
  contentNoImage: {
    flexDirection: 'column',
    height: 'auto',
    minHeight: 120,
  },
  imageContainer: {
    width: 100,
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  decorativeBar: {
    height: 8,
    width: '100%',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  progressBar: {
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paletteRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 6,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  actionRow: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  quickBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
