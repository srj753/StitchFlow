import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AdvancedFilterOptions, AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filtered = useMemo(() => {
    let result = projects;

    // Status Filter (simple)
    if (filter !== 'all') {
      result = result.filter((project) => (project.status ?? 'active') === filter);
    }

    // Advanced Status Filters (multi-select)
    if (advancedFilters.status && advancedFilters.status.length > 0) {
      result = result.filter((project) => advancedFilters.status!.includes(project.status ?? 'active'));
    }

    // Text Search (debounced)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((project) => 
        project.name.toLowerCase().includes(query) || 
        project.patternName?.toLowerCase().includes(query) ||
        project.notes?.toLowerCase().includes(query) ||
        project.progressNotes?.toLowerCase().includes(query)
      );
    }

    // Has Photos filter
    if (advancedFilters.hasPhotos) {
      result = result.filter((project) => project.photos.length > 0);
    }

    // Has Journal filter
    if (advancedFilters.hasJournal) {
      result = result.filter((project) => project.journal.length > 0);
    }

    return result;
  }, [projects, filter, debouncedSearchQuery, advancedFilters]);

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
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer]}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
          <FontAwesome name="search" size={16} color={theme.colors.muted} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search projects..." 
            placeholderTextColor={theme.colors.muted}
            style={[styles.searchInput, { color: theme.colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={16} color={theme.colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/projects/create')}
          style={[
            styles.addButton,
            {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
            },
          ]}>
          <FontAwesome name="plus" size={16} color="#000" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card (Simplified) */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
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
        {activeProject && (
          <View style={[styles.activeHint, { borderTopColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              Active: <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{activeProject.name}</Text>
            </Text>
            <TouchableOpacity onPress={() => handleOpenProject(activeProject.id)}>
              <Text style={{ color: theme.colors.accent, fontWeight: '600', fontSize: 13 }}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Horizontal Filters - No Card Wrapper */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterRow}
          style={{ flex: 1 }}
        >
          {filters.map((item) => {
            const selected = filter === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setFilter(item.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    shadowColor: selected ? theme.colors.accent : 'transparent',
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? '#000' : theme.colors.textSecondary,
                    fontWeight: selected ? '700' : '500',
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          onPress={() => setShowAdvancedFilters(true)}
          style={[
            styles.advancedChip,
            styles.advancedChipFixed,
            {
              backgroundColor: Object.keys(advancedFilters).length > 0 ? theme.colors.accentMuted : theme.colors.surface,
              borderColor: Object.keys(advancedFilters).length > 0 ? theme.colors.accent : theme.colors.border,
            },
          ]}>
          <FontAwesome 
            name="sliders" 
            size={14} 
            color={Object.keys(advancedFilters).length > 0 ? theme.colors.accent : theme.colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: Object.keys(advancedFilters).length > 0 ? theme.colors.accent : theme.colors.textSecondary,
              fontWeight: Object.keys(advancedFilters).length > 0 ? '700' : '500',
            }}>
            More
          </Text>
        </TouchableOpacity>
      </View>
      
      <AdvancedFilters
        visible={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={() => {
          setAdvancedFilters({});
          setFilter('all');
        }}
      />
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
            title={debouncedSearchQuery || Object.keys(advancedFilters).length > 0 ? "No matches found" : "No projects yet"}
            description={
              debouncedSearchQuery || Object.keys(advancedFilters).length > 0
                ? "Try adjusting your search or filters."
                : "Start tracking your crochet projects with counters, notes, and progress photos."
            }
            actionLabel={
              debouncedSearchQuery || Object.keys(advancedFilters).length > 0
                ? "Clear Filters"
                : "Create your first project"
            }
            onAction={
              debouncedSearchQuery || Object.keys(advancedFilters).length > 0
                ? () => {
                    setSearchQuery('');
                    setAdvancedFilters({});
                    setFilter('all');
                  }
                : () => router.push('/projects/create')
            }
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
    paddingBottom: 100, // Add more bottom padding for tab bar
  },
  header: {
    marginBottom: 12,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0, 
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  statsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  activeHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  filtersContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterRow: {
    paddingRight: 16,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    elevation: 1,
  },
  advancedChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedChipFixed: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
    flexShrink: 0,
  },
  separator: {
    height: 16,
  },
});
