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

import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { estimateYarnRequirement } from '@/lib/yarnEstimator';
import { useYarnStore } from '@/store/useYarnStore';
import { Yarn, YarnWeightCategory } from '@/types/yarn';

export default function YarnStashScreen() {
  const theme = useTheme();
  const router = useRouter();
  const yarns = useYarnStore((state) => state.yarns);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [weightFilter, setWeightFilter] = useState<YarnWeightCategory | 'all'>('all');
  const [estimatorWidth, setEstimatorWidth] = useState('40');
  const [estimatorHeight, setEstimatorHeight] = useState('60');
  const [estimatorYardage, setEstimatorYardage] = useState('200');

  const filteredYarns = useMemo(() => {
    return yarns.filter((yarn) => {
      const matchesSearch =
        debouncedSearchQuery.trim().length === 0 ||
        yarn.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        yarn.brand?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        yarn.color.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesWeight = weightFilter === 'all' || yarn.weightCategory === weightFilter;

      return matchesSearch && matchesWeight;
    });
  }, [yarns, debouncedSearchQuery, weightFilter]);

  const totalSkeins = useMemo(
    () => yarns.reduce((sum, yarn) => sum + yarn.skeinsOwned, 0),
    [yarns],
  );

  const availableSkeins = useMemo(
    () => yarns.reduce((sum, yarn) => sum + (yarn.skeinsOwned - yarn.skeinsReserved), 0),
    [yarns],
  );
  const estimatorResult = useMemo(() => {
    const width = Number(estimatorWidth);
    const height = Number(estimatorHeight);
    const yardage = Number(estimatorYardage);
    const factor = weightFactorMap[weightFilter] ?? 1;
    return estimateYarnRequirement({
      widthInches: Number.isFinite(width) ? width : 0,
      heightInches: Number.isFinite(height) ? height : 0,
      yardagePerSkein: Number.isFinite(yardage) ? yardage : 0,
      yarnWeightFactor: factor,
    });
  }, [estimatorWidth, estimatorHeight, estimatorYardage, weightFilter]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>INVENTORY</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Yarn Stash</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/patterns/stash/add' as any)}
            style={[styles.addButton, { backgroundColor: theme.colors.accent }]}>
            <FontAwesome name="plus" size={16} color="#000" />
          </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <StatCard label="Total Skeins" value={totalSkeins.toString()} theme={theme} />
        <StatCard
          label="Available"
          value={availableSkeins.toString()}
          theme={theme}
          highlight
        />
      </View>

      <View
        style={[
          styles.searchField,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceAlt,
          },
        ]}>
        <FontAwesome name="search" size={16} color={theme.colors.muted} style={{ marginRight: 8 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search name, brand, color..."
          placeholderTextColor={theme.colors.muted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {weightOptions.map((option) => {
            const selected = weightFilter === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setWeightFilter(option.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceAlt,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? '#000' : theme.colors.textSecondary,
                    fontWeight: '600',
                    fontSize: 12,
                  }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <FlatList
        data={filteredYarns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <YarnCard yarn={item} theme={theme} router={router} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={[styles.estimatorCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Quick Estimator</Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 16, fontSize: 13 }}>
              Rough math for blankets based on width/height.
            </Text>
            <View style={styles.estimatorRow}>
              <EstimatorField
                label="Width (in)"
                value={estimatorWidth}
                onChangeText={setEstimatorWidth}
                theme={theme}
              />
              <EstimatorField
                label="Height (in)"
                value={estimatorHeight}
                onChangeText={setEstimatorHeight}
                theme={theme}
              />
              <EstimatorField
                label="Yds/skein"
                value={estimatorYardage}
                onChangeText={setEstimatorYardage}
                theme={theme}
              />
            </View>
            <View style={[styles.estimatorResult, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                ≈ {estimatorResult.estimatedSkeins.toFixed(1)} skeins needed
                </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="🧵"
            title={searchQuery || weightFilter !== 'all' ? 'No matching yarns' : 'Stash is empty'}
            description={
              searchQuery || weightFilter !== 'all'
                ? "Try adjusting your filters."
                : "Add yarns to track what you have and reserve them for projects."
            }
            actionLabel="Add yarn"
            onAction={() => router.push('/patterns/stash/add' as any)}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

function StatCard({
  label,
  value,
  theme,
  highlight,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
  highlight?: boolean;
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>{label}</Text>
      <Text
        style={{
          color: highlight ? theme.colors.accent : theme.colors.text,
          fontSize: 24,
          fontWeight: '800',
        }}>
        {value}
      </Text>
    </View>
  );
}

function YarnCard({
  yarn,
  theme,
  router,
}: {
  yarn: Yarn;
  theme: ReturnType<typeof useTheme>;
  router: ReturnType<typeof useRouter>;
}) {
  const available = yarn.skeinsOwned - yarn.skeinsReserved;

  return (
    <TouchableOpacity 
        onPress={() => router.push(`/patterns/stash/${yarn.id}` as any)}
        activeOpacity={0.7}
        style={[styles.yarnCard, { backgroundColor: theme.colors.surface }]}
    >
        <View style={[styles.yarnSwatch, { backgroundColor: yarn.colorHex || theme.colors.muted }]} />
        
        <View style={styles.yarnContent}>
            <View style={styles.yarnHeader}>
                <Text style={[styles.yarnName, { color: theme.colors.text }]} numberOfLines={1}>{yarn.name}</Text>
                <View style={[styles.badge, { backgroundColor: available > 0 ? theme.colors.surfaceAlt : theme.colors.cardMuted }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: available > 0 ? theme.colors.text : theme.colors.muted }}>
                        {available}/{yarn.skeinsOwned}
                    </Text>
                </View>
            </View>
            
            <Text style={[styles.yarnBrand, { color: theme.colors.textSecondary }]}>
                {yarn.brand ? `${yarn.brand} · ` : ''}{yarn.color}
            </Text>
            
            <View style={styles.yarnMetaRow}>
                <Text style={[styles.yarnMeta, { color: theme.colors.muted }]}>{yarn.weightCategory}</Text>
                {yarn.skeinsReserved > 0 && (
                    <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>
                        {yarn.skeinsReserved} reserved
                    </Text>
                )}
            </View>
        </View>
    </TouchableOpacity>
  );
}

function EstimatorField({
  label,
  value,
  onChangeText,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        style={[
          styles.estimatorInput,
          {
            backgroundColor: theme.colors.surfaceAlt,
            color: theme.colors.text,
          },
        ]}
      />
    </View>
  );
}

const weightOptions: Array<{ label: string; value: YarnWeightCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Lace', value: 'Lace' },
  { label: 'Fingering', value: 'Fingering' },
  { label: 'Sport', value: 'Sport' },
  { label: 'DK', value: 'DK' },
  { label: 'Worsted', value: 'Worsted' },
  { label: 'Aran', value: 'Aran' },
  { label: 'Bulky', value: 'Bulky' },
  { label: 'Super Bulky', value: 'Super Bulky' },
  { label: 'Jumbo', value: 'Jumbo' },
];
const weightFactorMap: Record<YarnWeightCategory | 'all', number> = {
  all: 1,
  Lace: 0.7,
  Fingering: 0.8,
  Sport: 0.9,
  DK: 1,
  Worsted: 1.1,
  Aran: 1.15,
  Bulky: 1.25,
  'Super Bulky': 1.35,
  Jumbo: 1.5,
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
  },
  filterRow: {
    marginBottom: 8,
  },
  chipRow: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yarnCard: {
    marginBottom: 12,
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  yarnSwatch: {
      width: 64,
      height: 64,
      borderRadius: 18,
  },
  yarnContent: {
      flex: 1,
      justifyContent: 'center',
  },
  yarnHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
  },
  yarnName: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      marginRight: 8,
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
  },
  yarnBrand: {
      fontSize: 13,
      marginBottom: 6,
  },
  yarnMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  yarnMeta: {
      fontSize: 12,
      fontWeight: '600',
  },
  estimatorCard: {
      marginTop: 24,
      borderRadius: 24,
      padding: 20,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
  },
  estimatorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  estimatorInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  estimatorResult: {
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
  },
});
