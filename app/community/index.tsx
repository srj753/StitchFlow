import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';

const patterns = [
  {
    id: 'cozygarden',
    title: 'Cozy Garden Wrap',
    difficulty: 'Intermediate',
    tags: ['wrap', 'worsted', 'textured'],
  },
  {
    id: 'bubblepop',
    title: 'Bubble Pop Bucket Hat',
    difficulty: 'Easy',
    tags: ['hat', 'bulky', 'retro'],
  },
  {
    id: 'stellarplush',
    title: 'Stellar Plush Star',
    difficulty: 'Intermediate',
    tags: ['plush', 'amigurumi'],
  },
];

export default function CommunityScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Community</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Discover inspiring patterns</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          These cards will soon be powered by real feeds—complete with filters, tags, and one-tap
          project creation.
        </Text>
      </View>

      <View style={styles.list}>
        {patterns.map((pattern) => (
          <Card key={pattern.id} style={styles.patternCard}>
            <View
              style={[
                styles.thumbnail,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                },
              ]}
            />
            <View style={styles.patternMeta}>
              <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
                {pattern.title}
              </Text>
              <Text style={[styles.patternDifficulty, { color: theme.colors.accent }]}>
                {pattern.difficulty}
              </Text>
              <View style={styles.tagRow}>
                {pattern.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: theme.colors.accentMuted,
                        borderColor: theme.colors.accent,
                      },
                    ]}>
                    <Text style={[styles.tagText, { color: theme.colors.accent }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    marginTop: 20,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#131726',
  },
  patternMeta: {
    flex: 1,
    marginLeft: 16,
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  patternDifficulty: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 6,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    marginHorizontal: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});


