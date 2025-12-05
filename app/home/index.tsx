import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ActiveProjectCard } from '@/components/home/ActiveProjectCard';
import { TrendingPatterns } from '@/components/home/TrendingPatterns';
import { WeeklyProgress } from '@/components/home/WeeklyProgress';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const projects = useProjectsStore((state) => state.projects);
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const setActiveProject = useProjectsStore((state) => state.setActiveProject);

  const activeProject = useMemo(() => {
    if (!projects.length) return undefined;
    if (activeProjectId) {
      return projects.find((project) => project.id === activeProjectId) ?? projects[0];
    }
    return projects[0]; // Default to most recent if no active ID
  }, [activeProjectId, projects]);

  const handleOpenProject = (project: Project) => {
    setActiveProject(project.id);
    router.push({
      pathname: '/projects/[id]',
      params: { id: project.id },
    });
  };

  const handleCreatePress = () => {
    router.push('/projects/create');
  };

  const handleProfilePress = () => {
    router.push('/profile'); // Assuming this route exists or will exist
  };

  return (
    <Screen scrollable={true} contentStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.muted }]}>Good morning,</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Ready to flow?</Text>
        </View>
        <Pressable
          onPress={handleProfilePress}
          role="button"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.avatar,
            {
              borderColor: theme.colors.surface,
              backgroundColor: theme.colors.surfaceAlt,
              opacity: pressed ? 0.7 : 1,
              cursor: 'pointer' as any,
            }
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.colors.accent }]}>S</Text>
        </Pressable>
      </View>

      {/* Active Project */}
      {activeProject ? (
        <ActiveProjectCard
          project={activeProject}
          onPress={() => handleOpenProject(activeProject)}
        />
      ) : (
        <Link href="/projects/create" asChild>
          <Pressable
            role="button"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.emptyState,
              {
                backgroundColor: theme.colors.surfaceAlt,
                opacity: pressed ? 0.8 : 1,
                cursor: 'pointer' as any,
              }
            ]}
          >
            <FontAwesome name="plus" size={24} color={theme.colors.muted} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Start a Project</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.muted }]}>
              Tap to begin your first creation
            </Text>
          </Pressable>
        </Link>
      )}

      {/* Weekly Stats */}
      <WeeklyProgress />

      {/* Trending Patterns */}
      <TrendingPatterns />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    height: 180,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
