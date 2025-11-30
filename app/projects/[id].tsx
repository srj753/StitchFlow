import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AssistantView } from '@/components/projects/AssistantView';
import { PatternView } from '@/components/projects/PatternView';
import { ProjectTab, ProjectTabs } from '@/components/projects/ProjectTabs';
import { StudioView } from '@/components/projects/StudioView';
import { TrackView } from '@/components/projects/TrackView';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { ProjectCounter } from '@/types/project';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projects = useProjectsStore((state) => state.projects);
  const updateCounter = useProjectsStore((state) => state.updateCounter);
  
  const [activeTab, setActiveTab] = useState<ProjectTab>('track');
  const [activeCounterIndex, setActiveCounterIndex] = useState(0);

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);

  if (!project) {
    return (
      <Screen>
        <Card title="Project missing">
          <Text style={{ color: theme.colors.textSecondary }}>
            We couldn’t find this project. Head back to projects to add a new one.
          </Text>
        </Card>
      </Screen>
    );
  }

  const handleQuickIncrement = (counter: ProjectCounter, delta: number) => {
    if (delta > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateCounter(project.id, counter.id, counter.currentValue + delta);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'track':
        return <TrackView project={project} />;
      case 'pattern':
        return <PatternView project={project} />;
      case 'studio':
        return <StudioView project={project} />;
      case 'ai':
        return <AssistantView project={project} />;
      default:
        return null;
    }
  };

  const handleCounterScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    setActiveCounterIndex(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {project.patternName || 'Custom Project'}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="ellipsis-v" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </Screen>

      {/* Persistent Floating Counter Deck (Visible on non-Track tabs) */}
      {activeTab !== 'track' && project.counters.length > 0 && (
        <View style={styles.floatingContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCounterScroll}
            snapToInterval={CARD_WIDTH}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.counterDeck}
          >
            {project.counters.map((counter) => (
              <View 
                key={counter.id} 
                style={[
                  styles.floatingCounter, 
                  { 
                    backgroundColor: theme.colors.surface, 
                    borderColor: theme.colors.border,
                    width: CARD_WIDTH,
                  }
                ]}
              >
                <View>
                  <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>{counter.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={[styles.counterValue, { color: theme.colors.text }]}>{counter.currentValue}</Text>
                    {counter.targetValue && (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginLeft: 4 }}>
                        / {counter.targetValue}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    onPress={() => handleQuickIncrement(counter, -1)}
                    style={[styles.controlButton, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
                  >
                    <FontAwesome name="minus" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleQuickIncrement(counter, 1)}
                    style={[styles.controlButton, { backgroundColor: theme.colors.accent }]}
                  >
                    <FontAwesome name="plus" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          {project.counters.length > 1 && (
            <View style={styles.pagination}>
              {project.counters.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === activeCounterIndex ? theme.colors.accent : theme.colors.border,
                      width: index === activeCounterIndex ? 16 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingBottom: 120, // Add padding for floating counter
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
  },
  counterDeck: {
    paddingHorizontal: 16, // Center the cards
  },
  floatingCounter: {
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginRight: 0, // We handle spacing via snapToInterval logic or specific container padding if needed
  },
  counterLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  counterControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
