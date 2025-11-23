import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
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
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { estimateYarnRequirement } from '@/lib/yarnEstimator';
import { useYarnStore } from '@/store/useYarnStore';
import { Yarn, YarnWeightCategory } from '@/types/yarn';

export default function YarnStashScreen() {
  const theme = useTheme();
  const router = useRouter();
  const yarns = useYarnStore((state) => state.yarns);
  const [searchQuery, setSearchQuery] = useState('');
  const [weightFilter, setWeightFilter] = useState<YarnWeightCategory | 'all'>('all');
  const [estimatorWidth, setEstimatorWidth] = useState('40');
  const [estimatorHeight, setEstimatorHeight] = useState('60');
  const [estimatorYardage, setEstimatorYardage] = useState('200');

  const filteredYarns = useMemo(() => {
    return yarns.filter((yarn) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        yarn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        yarn.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        yarn.color.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWeight = weightFilter === 'all' || yarn.weightCategory === weightFilter;

      return matchesSearch && matchesWeight;
    });
  }, [yarns, searchQuery, weightFilter]);

  const totalSkeins = useMemo(
    () => yarns.reduce((sum, yarn) => sum + yarn.skeinsOwned, 0),
    [yarns],
  );

  const totalMeters = useMemo(
    () => yarns.reduce((sum, yarn) => sum + yarn.skeinsOwned * yarn.metersPerSkein, 0),
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
      <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Yarn Stash</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>Your materials</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        Track what you have, reserve yarn for projects, and see availability at a glance.
      </Text>

      <View style={styles.statsRow}>
        <StatCard label="Total skeins" value={totalSkeins.toString()} theme={theme} />
        <StatCard
          label="Available"
          value={availableSkeins.toString()}
          theme={theme}
          highlight
        />
        <StatCard label="Total meters" value={Math.round(totalMeters).toString()} theme={theme} />
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
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, brand, or color..."
          placeholderTextColor={theme.colors.muted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>

      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.muted }]}>Filter by weight</Text>
        <View style={styles.chipRow}>
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
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                    fontSize: 12,
                  }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/patterns/stash/add' as any)}
        style={[styles.addButton, { backgroundColor: theme.colors.accent }]}>
        <Text style={styles.addButtonText}>+ Add yarn to stash</Text>
      </TouchableOpacity>
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
          <Card title="Quick blanket estimator" subtitle="Very rough approximation">
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
              Enter target dimensions and average yardage per skein to estimate how many skeins you
              might need. Calculations include ~15% buffer and will be refined later.
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
            </View>
            <View style={styles.estimatorRow}>
              <EstimatorField
                label="Yards per skein"
                value={estimatorYardage}
                onChangeText={setEstimatorYardage}
                theme={theme}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>
              ≈ {estimatorResult.estimatedYards.toFixed(0)} yards ·{' '}
              {estimatorResult.estimatedSkeins.toFixed(1)} skeins
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 4 }}>
              TODO: plug in gauge swatches and yarn weights for smarter math.
            </Text>
          </Card>
        }
        ListEmptyComponent={
          <EmptyState
            icon="🧵"
            title={searchQuery || weightFilter !== 'all' ? 'No matching yarns' : 'No yarns yet'}
            description={
              searchQuery || weightFilter !== 'all'
                ? "No yarns match your filters. Try adjusting your search or add new yarns to your stash."
                : "Add yarns to track what you have, reserve them for projects, and plan future makes."
            }
            actionLabel="Add yarn to stash"
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
          borderColor: highlight ? theme.colors.accent : theme.colors.border,
          backgroundColor: highlight ? theme.colors.accentMuted : theme.colors.surfaceAlt,
        },
      ]}>
      <Text style={{ color: theme.colors.muted, fontSize: 11, letterSpacing: 0.5 }}>{label}</Text>
      <Text
        style={{
          color: highlight ? theme.colors.accent : theme.colors.text,
          fontSize: 20,
          fontWeight: '700',
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
  const totalMeters = yarn.skeinsOwned * yarn.metersPerSkein;

  return (
    <Card style={styles.yarnCard}>
      <TouchableOpacity onPress={() => router.push(`/patterns/stash/${yarn.id}` as any)}>
        <View style={styles.yarnHeader}>
          <View
            style={[
              styles.colorSwatch,
              {
                backgroundColor: yarn.colorHex || theme.colors.muted,
                borderColor: theme.colors.border,
              },
            ]}
          />
          <View style={styles.yarnInfo}>
            <Text style={[styles.yarnName, { color: theme.colors.text }]}>{yarn.name}</Text>
            {yarn.brand ? (
              <Text style={[styles.yarnBrand, { color: theme.colors.textSecondary }]}>
                {yarn.brand} · {yarn.color}
              </Text>
            ) : (
              <Text style={[styles.yarnBrand, { color: theme.colors.textSecondary }]}>
                {yarn.color}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.yarnMeta}>
          <YarnMeta label="Weight" value={yarn.weightCategory} theme={theme} />
          <YarnMeta
            label="Skeins"
            value={`${available}/${yarn.skeinsOwned}`}
            theme={theme}
            highlight={available === 0}
          />
          <YarnMeta label="Meters" value={Math.round(totalMeters).toString()} theme={theme} />
        </View>

        {yarn.skeinsReserved > 0 && (
          <View style={[styles.reservedBadge, { backgroundColor: theme.colors.accentMuted }]}>
            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '600' }}>
              {yarn.skeinsReserved} reserved for projects
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
}

function YarnMeta({
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
    <View style={styles.yarnMetaItem}>
      <Text style={{ color: theme.colors.muted, fontSize: 11, letterSpacing: 0.3 }}>{label}</Text>
      <Text
        style={{
          color: highlight ? theme.colors.accent : theme.colors.text,
          fontSize: 14,
          fontWeight: '600',
        }}>
        {value}
      </Text>
    </View>
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
      <Text style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        style={[
          styles.estimatorInput,
          {
            borderColor: theme.colors.border,
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
  { label: 'Sport', value: 'Sport' },
  { label: 'DK', value: 'DK' },
  { label: 'Worsted', value: 'Worsted' },
  { label: 'Bulky', value: 'Bulky' },
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
    marginBottom: 20,
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
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
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#07080c',
    fontWeight: '700',
    fontSize: 16,
  },
  yarnCard: {
    marginBottom: 12,
  },
  yarnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  yarnInfo: {
    flex: 1,
  },
  yarnName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  yarnBrand: {
    fontSize: 14,
  },
  yarnMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  yarnMetaItem: {
    flex: 1,
    gap: 4,
  },
  reservedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  estimatorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  estimatorInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});


