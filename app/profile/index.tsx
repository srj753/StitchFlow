import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { WeeklyActivityChart } from '@/components/analytics/ProgressCharts';
import { ProjectStatsView } from '@/components/analytics/ProjectStats';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { calculateProjectStats, calculateWeeklyActivity } from '@/lib/analytics';
import { usePatternStore } from '@/store/usePatternStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { useYarnStore } from '@/store/useYarnStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const projects = useProjectsStore((state) => state.projects);
  const yarns = useYarnStore((state) => state.yarns);
  const patterns = usePatternStore((state) => state.patterns);

  const projectStats = useMemo(() => calculateProjectStats(projects), [projects]);
  const weeklyActivity = useMemo(() => calculateWeeklyActivity(projects), [projects]);

  return (
    <Screen scrollable={true}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Profile</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your maker stats</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Track your progress, streaks, and habits.
        </Text>
      </View>

      <ProjectStatsView stats={projectStats} />
      
      <WeeklyActivityChart data={weeklyActivity} />

      <Card title="Library Stats" style={styles.card}>
        <View style={styles.statsContainer}>
          <Stat label="Total Projects" value={projectStats.total} />
          <Stat label="Imported Patterns" value={patterns.length} />
          <Stat label="Stash Entries" value={yarns.length} isLast />
        </View>
      </Card>

      <Card title="Coming soon" style={styles.card}>
        <View style={styles.comingSoonContainer}>
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            We're planning:
          </Text>
          <Bullet text="Cross-device sync & backups" />
          <Bullet text="Shareable project pages" />
          <Bullet text="Community challenges and testers" />
        </View>
      </Card>
    </Screen>
  );
}

function Stat({ label, value, isLast }: { label: string; value: number; isLast?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, isLast && styles.statLast]}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: theme.colors.accent }]} />
      <Text style={{ color: theme.colors.textSecondary }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    gap: 8,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  statLast: {
    borderBottomWidth: 0,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
  },
  comingSoonContainer: {
    gap: 12,
  },
  comingSoonText: {
    fontSize: 14,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
});


