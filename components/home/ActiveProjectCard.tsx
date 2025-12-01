import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

type ActiveProjectCardProps = {
  project: Project;
  onPress: () => void;
};

export function ActiveProjectCard({ project, onPress }: ActiveProjectCardProps) {
  const theme = useTheme();
  const updateCounter = useProjectsStore((state) => state.updateCounter);
  const incrementRound = useProjectsStore((state) => state.incrementRound);

  // Find the primary row counter
  const rowCounter = project.counters.find(
    (c) => c.type === 'row' || c.label.toLowerCase().includes('row')
  );

  // Calculate progress
  const progress =
    rowCounter && rowCounter.targetValue && rowCounter.targetValue > 0
      ? Math.min(100, (rowCounter.currentValue / rowCounter.targetValue) * 100)
      : 0;

  const handleQuickContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (rowCounter) {
      updateCounter(project.id, rowCounter.id, rowCounter.currentValue + 1);
    } else {
      incrementRound(project.id, 1);
    }
  };

  return (
    <SlideUp duration={600} distance={40}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.container}>
        {/* Dark Card Background */}
        <View style={styles.card}>
          {/* Abstract Decoration - Gradient Orb */}
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
            style={styles.decorationOrb}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <View>
                <View style={styles.badge}>
                  <FontAwesome name="clock-o" size={10} color="#fff" />
                  <Text style={styles.badgeText}>CONTINUE</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                  {project.name}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {project.patternName || 'Custom Project'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.arrowButton}
                onPress={onPress}
              >
                <FontAwesome name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  Row {rowCounter?.currentValue || project.currentRound || 0}
                </Text>
                <Text style={styles.statText}>{Math.round(progress)}%</Text>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%`, backgroundColor: theme.colors.accent }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    backgroundColor: '#1c1917', // Stone-900 equivalent
    borderRadius: 32,
    overflow: 'hidden',
    minHeight: 180,
    position: 'relative',
  },
  decorationOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.6,
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    maxWidth: 220,
  },
  subtitle: {
    color: '#a8a29e', // Stone-400
    fontSize: 14,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  footer: {
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    color: '#a8a29e',
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});





