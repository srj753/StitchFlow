import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { PatternCard } from '@/components/patterns/PatternCard';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { patternCatalog } from '@/data/patterns/catalog';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { usePatternStore } from '@/store/usePatternStore';
import { Pattern, PatternDifficulty } from '@/types/pattern';

export default function PatternsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const importedPatterns = usePatternStore((state) => state.patterns);

  const allPatterns = useMemo(
    () => [...patternCatalog, ...importedPatterns],
    [importedPatterns],
  );

  const filteredPatterns = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    return allPatterns.filter((pattern) => {
      if (difficulty !== 'all' && pattern.difficulty !== difficulty) return false;
      if (normalized.length > 0) {
        const haystack = [
          pattern.name,
          pattern.designer,
          pattern.description,
          ...pattern.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [allPatterns, difficulty, debouncedQuery]);

  const featuredPatterns = useMemo(() => patternCatalog.slice(0, 5), []);

  const handlePreview = (pattern: Pattern) => {
    router.push({
      pathname: '/patterns/[id]' as any,
      params: { id: pattern.id },
    });
  };

  const handleSave = (pattern: Pattern) => {
    router.push({
      pathname: '/projects/create',
      params: { patternId: pattern.id },
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Header Title */}
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Patterns</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchField,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceAlt,
          },
        ]}>
        <FontAwesome name="search" size={16} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search patterns..."
          placeholderTextColor={theme.colors.muted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
        {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <FontAwesome name="times-circle" size={16} color={theme.colors.muted} />
            </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsRow} contentContainerStyle={{ paddingHorizontal: 4 }}>
        <TouchableOpacity
            onPress={() => router.push('/create-pattern')}
            style={[styles.actionChip, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
        >
            <FontAwesome name="pencil" size={14} color="#000" style={{ marginRight: 6 }} />
            <Text style={[styles.actionChipText, { color: '#000' }]}>Create</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
            onPress={() => router.push('/patterns/import' as any)}
            style={[styles.actionChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
            <FontAwesome name="download" size={14} color={theme.colors.text} style={{ marginRight: 6 }} />
            <Text style={[styles.actionChipText, { color: theme.colors.text }]}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => router.push('/patterns/stash' as any)}
            style={[styles.actionChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
            <FontAwesome name="archive" size={14} color={theme.colors.text} style={{ marginRight: 6 }} />
            <Text style={[styles.actionChipText, { color: theme.colors.text }]}>Stash</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Featured Section */}
      {!query && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured</Text>
          <FlatList
            horizontal
            data={featuredPatterns}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePreview(item)}
                style={[styles.featuredCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <View style={[styles.featuredImage, { backgroundColor: item.palette?.[0] || theme.colors.surfaceAlt }]} />
                <View style={styles.featuredContent}>
                   <Text style={[styles.featuredTitle, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
                   <Text style={[styles.featuredDesigner, { color: theme.colors.muted }]} numberOfLines={1}>{item.designer}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
          {difficultyFilters.map((item) => {
            const selected = difficulty === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setDifficulty(item.value)}
                style={[
                  styles.filterChip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
                    shadowColor: selected ? theme.colors.accent : 'transparent',
                    elevation: selected ? 1 : 0,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? '#000' : theme.colors.textSecondary,
                    fontWeight: selected ? '700' : '500',
                    fontSize: 13,
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 8, marginBottom: 16 }]}>
        {query ? 'Search Results' : 'All Patterns'}
      </Text>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <FlatList
        data={filteredPatterns}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PatternCard
            pattern={item}
            onPreview={() => handlePreview(item)}
            onSave={() => handleSave(item)}
            index={index}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon={{ name: 'search', size: 48 }}
            title={query || difficulty !== 'all' ? "No patterns found" : "No patterns yet"}
            description={
              query || difficulty !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Import patterns from PDFs or create your own custom patterns to get started."
            }
            actionLabel={query || difficulty !== 'all' ? "Clear Filters" : "Import Pattern"}
            onAction={
              query || difficulty !== 'all'
                ? () => {
                    setQuery('');
                    setDifficulty('all');
                  }
                : () => router.push('/patterns/import' as any)
            }
          />
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

type DifficultyFilter = 'all' | PatternDifficulty;

const difficultyFilters: Array<{ label: string; value: DifficultyFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 8,
  },
  hero: {
    marginBottom: 16,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    padding: 0,
  },
  actionsRow: {
    marginBottom: 24,
    marginHorizontal: -4,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  actionChipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  featuredList: {
    gap: 12,
  },
  featuredCard: {
    width: 140,
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
  },
  featuredImage: {
    flex: 1,
    width: '100%',
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featuredDesigner: {
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
});
