import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ProjectStats } from '@/lib/analytics';

export function ProjectStatsView({ stats }: { stats: ProjectStats }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard 
          label="Completed" 
          value={stats.completed.toString()} 
          subtext={`${stats.completionRate}% rate`}
          theme={theme} 
          accent
        />
        <StatCard 
          label="Active" 
          value={stats.active.toString()} 
          theme={theme} 
        />
      </View>
      <View style={styles.row}>
        <StatCard 
          label="Total Time" 
          value={`${Math.round(stats.totalTimeMinutes / 60)}h`} 
          subtext={`${stats.totalTimeMinutes % 60}m`}
          theme={theme} 
        />
        <StatCard 
          label="Avg Project" 
          value={`${Math.round(stats.averageTimePerProject / 60)}h`} 
          theme={theme} 
        />
      </View>
    </View>
  );
}

function StatCard({ 
  label, 
  value, 
  subtext, 
  theme, 
  accent 
}: { 
  label: string; 
  value: string; 
  subtext?: string;
  theme: any; 
  accent?: boolean;
}) {
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: theme.colors.surface,
        borderColor: accent ? theme.colors.accent : theme.colors.border,
        borderWidth: accent ? 1 : 0
      }
    ]}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: accent ? theme.colors.accent : theme.colors.text }]}>{value}</Text>
      {subtext && (
        <Text style={[styles.subtext, { color: theme.colors.muted }]}>{subtext}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtext: {
    fontSize: 12,
    marginTop: 2,
  }
});








