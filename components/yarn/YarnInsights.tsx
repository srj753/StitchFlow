import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { YarnStats } from '@/lib/yarnAnalytics';

export function YarnInsights({ stats }: { stats: YarnStats }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Stash Value</Text>
      <View style={styles.grid}>
        <View style={styles.col}>
          <Text style={[styles.value, { color: theme.colors.accent }]}>
            ${stats.totalValue.toFixed(2)}
          </Text>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Total Est. Value</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.col}>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {stats.totalMeters.toLocaleString()}m
          </Text>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Total Length</Text>
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.footerText, { color: theme.colors.muted }]}>
          Top Brand: <Text style={{ color: theme.colors.text }}>{stats.mostUsedBrand}</Text>
        </Text>
        <Text style={[styles.footerText, { color: theme.colors.muted }]}>
          Top Weight: <Text style={{ color: theme.colors.text }}>{stats.mostUsedWeight}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
  }
});








