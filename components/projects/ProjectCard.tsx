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
     ];
     const idx = project.id.charCodeAt(0) % gradients.length;
     return gradients[idx];
  }, [project.id]);

  return (
    <SlideUp delay={index * 50} duration={400}>
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.95}
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isActive ? theme.colors.accent : 'transparent',
            shadowColor: theme.colors.shadow,
          },
        ]}>
        
        {/* Top Section: Image/Header */}
        <View style={styles.headerContainer}>
           {hasImage ? (
             <Image source={{ uri: project.thumbnail }} style={styles.heroImage} />
           ) : (
             <LinearGradient
               colors={gradientColors as any}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={styles.placeholderGradient}
             >
               <FontAwesome name="heart-o" size={32} color="rgba(255,255,255,0.8)" />
             </LinearGradient>
           )}
           
           {/* Status Badge */}
           <View style={[styles.statusBadge, { backgroundColor: isActive ? theme.colors.accent : 'rgba(0,0,0,0.6)' }]}>
              <Text style={styles.statusText}>
                {isActive ? 'Active' : project.status === 'finished' ? 'Finished' : 'Paused'}
              </Text>
           </View>

           {/* Progress Bar (Bottom of Header) */}
           <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.accent }]} />
           </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
           <View style={styles.mainInfo}>
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                {project.name}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {project.patternName || 'Custom Project'}
              </Text>
              
              <View style={styles.metaRow}>
                <FontAwesome name="clock-o" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {lastUpdated}
                </Text>
                {project.timeSpentMinutes > 0 && (
                  <>
                    <Text style={[styles.metaDot, { color: theme.colors.border }]}>•</Text>
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                      {Math.floor(project.timeSpentMinutes / 60)}h {project.timeSpentMinutes % 60}m
                    </Text>
                  </>
                )}
              </View>
           </View>

           {/* Quick Counter Action */}
           <View style={styles.counterAction}>
              <View style={styles.counterDisplay}>
                 <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>
                    {rowCounter?.label || 'Row'}
                 </Text>
                 <Text style={[styles.counterValue, { color: theme.colors.text }]}>
                    {rowCounter?.currentValue || 0}
                    {rowCounter?.targetValue ? <Text style={{color: theme.colors.muted}}>/{rowCounter.targetValue}</Text> : ''}
                 </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.accent }]}
                onPress={(e) => {
                   e.stopPropagation(); // Prevent opening card
                   handleQuickAdjust(1);
                }}
              >
                 <FontAwesome name="plus" size={16} color="#fff" />
              </TouchableOpacity>
           </View>
        </View>
      </TouchableOpacity>
    </SlideUp>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent', // Overridden if active
  },
  headerContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainInfo: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  counterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterDisplay: {
    alignItems: 'flex-end',
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
