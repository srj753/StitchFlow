import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Finished', value: 'finished' },
];

type FilterValue = 'all' | Project['status'];

export default function ProjectsHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const projects = useProjectsStore((state) => state.projects);
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId],
  );
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return projects;
    return projects.filter((project) => (project.status ?? 'active') === filter);
  }, [projects, filter]);

  const stats = useMemo(() => {
    const activeCount = projects.filter((p) => (p.status ?? 'active') === 'active').length;
    const finishedCount = projects.filter((p) => p.status === 'finished').length;
    return [
      { label: 'Active', value: activeCount },
      { label: 'Finished', value: finishedCount },
      { label: 'Total', value: projects.length },
    ];
  }, [projects]);

  const handleOpenProject = (id: string) => {
    router.push({
      pathname: '/projects/[id]',
      params: { id },
    });
  };

  const renderProject = ({ item, index }: { item: Project; index: number }) => (
    <ProjectCard 
      project={item} 
      onPress={() => handleOpenProject(item.id)}
      index={index}
      isActive={item.id === activeProjectId}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Projects</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Track every stitch</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Keep yarn details, palette, and pattern snippets in one cozy dashboard.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/projects/create')}
          style={[
            styles.createButton,
            {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
            },
          ]}>
          <FontAwesome name="plus" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <Card style={styles.sectionCard}>
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.statChip, index === stats.length - 1 && styles.statChipLast]}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
        {activeProject ? (
          <View style={styles.activeHint}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Active project:{' '}
              <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{activeProject.name}</Text>
            </Text>
            <TouchableOpacity onPress={() => handleOpenProject(activeProject.id)}>
              <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Resume</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Card>

      <Card title="Filters" style={styles.sectionCard}>
        <View style={styles.filterRow}>
          {filters.map((item) => {
            const selected = filter === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setFilter(item.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="🧶"
            title="No projects yet"
            description="Start tracking your crochet projects with counters, notes, and progress photos."
            actionLabel="Create your first project"
            onAction={() => router.push('/projects/create')}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroCopy: {
    flex: 1,
    marginRight: 16,
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
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionCard: {
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statChip: {
    flex: 1,
    marginRight: 12,
  },
  statChipLast: {
    marginRight: 0,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  activeHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  separator: {
    height: 16,
  },
});
