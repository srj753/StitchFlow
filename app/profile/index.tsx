import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { usePatternStore } from '@/store/usePatternStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { useYarnStore } from '@/store/useYarnStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const projects = useProjectsStore((state) => state.projects);
  const yarns = useYarnStore((state) => state.yarns);
  const patterns = usePatternStore((state) => state.patterns);

  const stats = useMemo(() => {
    const active = projects.filter((project) => project.status === 'active').length;
    const finished = projects.filter((project) => project.status === 'finished').length;
    return {
      totalProjects: projects.length,
      activeProjects: active,
      finishedProjects: finished,
      stashCount: yarns.length,
      importedPatterns: patterns.length,
    };
  }, [patterns.length, projects, yarns.length]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Profile</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your maker stats</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Quick snapshot of everything you’ve logged so far. Future versions will sync across
          devices and add streaks, badges, and community sharing.
        </Text>
      </View>

      <Card title="Projects">
        <Stat label="Total" value={stats.totalProjects} />
        <Stat label="Active" value={stats.activeProjects} />
        <Stat label="Finished" value={stats.finishedProjects} />
      </Card>

      <Card title="Library">
        <Stat label="Imported patterns" value={stats.importedPatterns} />
        <Stat label="Yarn stash entries" value={stats.stashCount} />
      </Card>

      <Card title="Coming soon">
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
          We’re planning:
        </Text>
        <Bullet text="Cross-device sync & backups" />
        <Bullet text="Shareable project pages" />
        <Bullet text="Community challenges and testers" />
      </Card>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
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
    marginBottom: 20,
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
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});


