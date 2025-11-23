import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useDebounce } from '@/hooks/useDebounce';
import { PatternCard } from '@/components/patterns/PatternCard';
import { patternCatalog } from '@/data/patterns/catalog';
import { Pattern, PatternDifficulty } from '@/types/pattern';
import { usePatternStore } from '@/store/usePatternStore';

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

  const hasCustomFilters =
    query.trim().length > 0 || difficulty !== 'all';

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Patterns</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Library & inspiration</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Browse curated crochet patterns, filter by skill level, and send instructions straight to
          your projects.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            onPress={() => router.push('/create-pattern')}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.accent,
              },
            ]}>
            <Text style={styles.primaryButtonText}>Open Pattern Maker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/patterns/import' as any)}
            style={[
              styles.secondaryButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}>
            <Text style={{ color: theme.colors.text }}>Import pattern</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/patterns/stash' as any)}
            style={[
              styles.secondaryButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}>
            <Text style={{ color: theme.colors.text }}>Yarn Stash</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/projects/create')}
            style={[
              styles.secondaryButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}>
            <Text style={{ color: theme.colors.text }}>Add a project</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.searchField,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceAlt,
          },
        ]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search plushies, cardigans, stitches..."
          placeholderTextColor={theme.colors.muted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>

      <Card title="Filters" style={styles.sectionCard}>
        <Text style={[styles.helper, { color: theme.colors.muted }]}>Difficulty</Text>
        <View style={styles.chipRow}>
          {difficultyFilters.map((item) => {
            const selected = difficulty === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setDifficulty(item.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
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

  return (
    <Screen scrollable={false}>
      <FlatList
        data={filteredPatterns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatternCard
            pattern={item}
            onPreview={() => handlePreview(item)}
            onSave={() => handleSave(item)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Card title="No matches yet" subtitle="Try a different filter">
            <Text style={{ color: theme.colors.textSecondary }}>
              {hasCustomFilters
                ? 'Nothing matches those filters yet. Clear the search or try a different difficulty level.'
                : 'Our next pattern drop is loading. Check back soon!'}
            </Text>
          </Card>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

type DifficultyFilter = 'all' | PatternDifficulty;

const difficultyFilters: Array<{ label: string; value: DifficultyFilter }> = [
  { label: 'All levels', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  hero: {
    marginBottom: 16,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  primaryButton: {
    paddingHorizontal: 18,
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchField: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 6,
  },
  sectionCard: {
    marginBottom: 16,
  },
  helper: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
});
