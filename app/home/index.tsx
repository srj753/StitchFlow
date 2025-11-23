import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const projects = useProjectsStore((state) => state.projects);
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const setActiveProject = useProjectsStore((state) => state.setActiveProject);
  const incrementRound = useProjectsStore((state) => state.incrementRound);

  const stats = useMemo(() => {
    const active = projects.filter((p) => (p.status ?? 'active') === 'active').length;
    const paused = projects.filter((p) => p.status === 'paused').length;
    const finished = projects.filter((p) => p.status === 'finished').length;
    return [
      { label: 'Active', value: active },
      { label: 'Paused', value: paused },
      { label: 'Finished', value: finished },
    ];
  }, [projects]);

  const activeProject = useMemo(() => {
    if (!projects.length) return undefined;
    if (activeProjectId) {
      return projects.find((project) => project.id === activeProjectId) ?? projects[0];
    }
    return projects[0];
  }, [activeProjectId, projects]);

  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const hasProjects = projects.length > 0;

  const handleCreatePress = () => {
    router.push('/projects/create');
  };

  const handleViewProjects = () => {
    router.push('/projects');
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project.id);
    router.push({
      pathname: '/projects/[id]',
      params: { id: project.id },
    });
  };

  const handleQuickRound = (delta: number) => {
    if (!activeProject) {
      handleCreatePress();
      return;
    }
    incrementRound(activeProject.id, delta);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Home</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Keep every stitch aligned</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Jump into your most active project, log progress, or sketch a new idea in seconds.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            onPress={handleCreatePress}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.accent,
              },
            ]}>
            <Text style={styles.primaryButtonText}>Start a project</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleViewProjects}
            style={[
              styles.secondaryButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}>
            <Text style={{ color: theme.colors.text }}>View all projects</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Card title="At a glance" style={styles.sectionCard}>
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          {hasProjects ? 'Tap a quick action below to keep momentum.' : 'Create your first project to populate this dashboard.'}
        </Text>
      </Card>

      <Card title="Today’s focus" style={styles.sectionCard}>
        <View style={styles.quickRow}>
          <QuickAction
            label="+1 round"
            description={activeProject ? `Log progress for ${activeProject.name}` : 'Create a project first'}
            onPress={() => handleQuickRound(1)}
            disabled={!activeProject}
          />
          <QuickAction
            label="Open notes"
            description="Jump to your notebook"
            onPress={() =>
              activeProject ? handleOpenProject(activeProject) : handleCreatePress()
            }
          />
          <QuickAction
            label="Pattern ideas"
            description="Sketch in Pattern Maker"
            onPress={() => router.push('/create-pattern')}
          />
        </View>
      </Card>

      <Card
        title={activeProject ? 'Active project' : 'No projects yet'}
        subtitle={
          activeProject
            ? 'Keep the streak alive'
            : 'Start something new to track yarn, notes, and rounds'
        }
        highlight={!!activeProject}
        style={styles.sectionCard}>
        {activeProject ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View>
                <Text style={[styles.activeTitle, { color: theme.colors.text }]}>
                  {activeProject.name}
                </Text>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {activeProject.patternName ?? 'Custom plan'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleOpenProject(activeProject)}>
                <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Resume</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activeMetrics}>
              <Metric label="Rounds" value={String(activeProject.currentRound)} />
              <Metric
                label="Height"
                value={`${activeProject.currentHeightInches.toFixed(1)} in`}
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleCreatePress}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.accent,
              },
            ]}>
            <Text style={styles.primaryButtonText}>Create your first project</Text>
          </TouchableOpacity>
        )}
      </Card>

      <Card title="Recently added" style={styles.sectionCard}>
        {recentProjects.length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary }}>
            Add a project and it’ll appear here with quick access.
          </Text>
        ) : (
          <View style={styles.recentList}>
            {recentProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => handleOpenProject(project)}
                style={[
                  styles.recentItem,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
                    {project.name}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {project.patternName ?? 'Custom plan'}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                  {new Date(project.updatedAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      <Card title="Next up" subtitle="Phase 2 roadmap" style={styles.sectionCard}>
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
          Coming soon:
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>• Diagram + sketch workspace</Text>
        <Text style={{ color: theme.colors.textSecondary }}>• Voice + video notes</Text>
        <Text style={{ color: theme.colors.textSecondary }}>• Smart pattern parsing</Text>
        <Text style={{ color: theme.colors.textSecondary }}>• Cloud sync & sharing</Text>
        <TouchableOpacity
          onPress={() => router.push('/patterns')}
          style={[
            styles.secondaryButton,
            {
              marginTop: 12,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceAlt,
            },
          ]}>
          <Text style={{ color: theme.colors.text }}>Browse patterns</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
}

function QuickAction({
  label,
  description,
  onPress,
  disabled,
}: {
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.quickAction,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceAlt,
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      <Text style={[styles.quickLabel, { color: theme.colors.text }]}>{label}</Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{description}</Text>
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={{ color: theme.colors.muted, fontSize: 12, letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 24,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickRow: {
    gap: 12,
  },
  quickAction: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeCard: {
    gap: 12,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  activeMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flex: 1,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});

