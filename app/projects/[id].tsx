import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AssistantView } from '@/components/projects/AssistantView';
import { DiagramsView } from '@/components/projects/DiagramsView';
import { PatternView } from '@/components/projects/PatternView';
import { ProjectTab, ProjectTabs } from '@/components/projects/ProjectTabs';
import { StudioView } from '@/components/projects/StudioView';
import { TrackView } from '@/components/projects/TrackView';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useAppearanceStore } from '@/store/useAppearanceStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { ProjectCounter } from '@/types/project';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const { mode } = useAppearanceStore();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projects = useProjectsStore((state) => state.projects);
  const updateCounter = useProjectsStore((state) => state.updateCounter);
  const updateProjectStatus = useProjectsStore((state) => state.updateProjectStatus);
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const { showSuccess } = useToast();
  
  const [activeTab, setActiveTab] = useState<ProjectTab>('track');
  const [activeCounterIndex, setActiveCounterIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

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
      case 'diagrams':
        return <DiagramsView project={project} />;
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

  const handleFinishProject = () => {
    Alert.alert(
      "Finish Project",
      "Are you sure you want to mark this project as finished?",
      [
        { text: "Cancel", style: "cancel" },
        { 
            text: "Finish", 
            onPress: () => {
                updateProjectStatus(project.id, 'finished');
                
                // Check for yarn consumption
                if (!project.linkedYarns || project.linkedYarns.length === 0) {
                  Alert.alert(
                    "No Yarn Linked",
                    "We couldn't automatically deduct yarn from your stash because no yarn was linked to this project."
                  );
                } else {
                  showSuccess("Project finished & yarn deducted!");
                }
            }
        }
      ]
    );
  };

  const handleDeleteProject = () => {
    Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project? This action cannot be undone.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: () => {
                    deleteProject(project.id);
                    showSuccess("Project deleted");
                    router.back();
                }
            }
        ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Decorative Header Background */}
      <View style={styles.headerBackgroundContainer}>
        {project.thumbnail ? (
           <ImageBackground 
             source={{ uri: project.thumbnail }} 
             style={styles.headerImage}
             blurRadius={50}
           >
             <View style={[styles.headerOverlay, { backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]} />
           </ImageBackground>
        ) : (
          <LinearGradient
            colors={[theme.colors.surfaceAlt, theme.colors.background]}
            style={styles.headerGradient}
          />
        )}
      </View>

      {/* Screen with 0 top padding to allow header to sit flush */}
      <Screen contentStyle={{ paddingTop: 0 }}>
        {/* Header Content */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.iconButton, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <FontAwesome name="arrow-left" size={16} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={{ position: 'relative' }}>
                <TouchableOpacity 
                    onPress={() => setShowMenu(!showMenu)}
                    style={[styles.iconButton, { backgroundColor: theme.colors.surfaceAlt }]}
                >
                    <FontAwesome name="ellipsis-h" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                
                {/* Dropdown Menu */}
                {showMenu && (
                    <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                // Navigate to edit screen or show modal (placeholder for now)
                                Alert.alert("Edit Project", "Edit functionality coming soon.");
                            }}
                        >
                            <FontAwesome name="pencil" size={14} color={theme.colors.text} style={styles.menuIcon} />
                            <Text style={[styles.menuText, { color: theme.colors.text }]}>Edit Project</Text>
                        </TouchableOpacity>
                        
                        {project.status !== 'finished' ? (
                          <>
                            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => {
                                    setShowMenu(false);
                                    handleFinishProject();
                                }}
                            >
                                <FontAwesome name="check-circle" size={14} color={theme.colors.accent} style={styles.menuIcon} />
                                <Text style={[styles.menuText, { color: theme.colors.text }]}>Finish Project</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => {
                                    setShowMenu(false);
                                    updateProjectStatus(project.id, 'active');
                                    showSuccess("Project reactivated!");
                                }}
                            >
                                <FontAwesome name="undo" size={14} color={theme.colors.text} style={styles.menuIcon} />
                                <Text style={[styles.menuText, { color: theme.colors.text }]}>Unfinish / Reactivate</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                handleDeleteProject();
                            }}
                        >
                            <FontAwesome name="trash-o" size={14} color="#ff4444" style={styles.menuIcon} />
                            <Text style={[styles.menuText, { color: '#ff4444' }]}>Delete Project</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
          </View>
          
          <View style={styles.headerTitleRow}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
                  {project.name}
                </Text>
                <View style={styles.subtitleRow}>
                  <View style={[styles.badge, { backgroundColor: theme.colors.accentMuted }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.accent }]}>
                       {project.status === 'active' ? 'In Progress' : project.status}
                    </Text>
                  </View>
                  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {project.patternName || 'Custom Project'}
                  </Text>
                </View>
             </View>
          </View>
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
      
      {/* Transparent overlay to close menu when tapping outside */}
      {showMenu && (
        <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerGradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 100, // Ensure header stays on top of all content
    position: 'relative',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 101, // Above header background
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
      position: 'absolute',
      top: 48,
      right: 0,
      width: 160,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 100,
      paddingVertical: 4,
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
  },
  menuIcon: {
      marginRight: 12,
      width: 16,
      textAlign: 'center',
  },
  menuText: {
      fontSize: 14,
      fontWeight: '500',
  },
  menuDivider: {
      height: 1,
      opacity: 0.1,
  },
  menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingBottom: 120, // Add padding for floating counter
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 100, // Above tab bar (tab bar is ~80px + safe area)
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    zIndex: 1000, // Ensure it's above content but below modals
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
    marginRight: 16, // Add spacing between counters
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
