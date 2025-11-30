import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Pattern } from '@/types/pattern';

type PatternCardProps = {
  pattern: Pattern;
  onPreview: () => void;
  onSave: () => void;
  index?: number; // For staggered animations
};

const difficultyCopy: Record<Pattern['difficulty'], string> = {
  beginner: 'Beginner friendly',
  intermediate: 'Intermediate',
  advanced: 'Advanced challenge',
};

export function PatternCard({ pattern, onPreview, onSave, index = 0 }: PatternCardProps) {
  const theme = useTheme();
  const palette = pattern.palette.slice(0, 4);

  return (
    <SlideUp delay={index * 50} duration={300}>
      <Card
        title={pattern.name}
        subtitle={`${pattern.designer} · ${difficultyCopy[pattern.difficulty]}`}
        style={styles.card}>
      {pattern.sourceType === 'imported' ? (
        <View
          style={[
            styles.badge,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceAlt,
            },
          ]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Imported</Text>
        </View>
      ) : null}
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {pattern.description}
      </Text>

      <View style={styles.metaRow}>
        <Meta label="Duration" value={pattern.duration} />
        <Meta label="Yarn weight" value={pattern.yarnWeight} />
        <Meta label="Hook" value={pattern.hookSize} />
      </View>

      <View style={styles.swatchRow}>
        {palette.map((color) => (
          <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
        ))}
      </View>

      <View style={styles.tagRow}>
        {pattern.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { borderColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onPreview}
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.colors.accent,
            },
          ]}>
          <Text style={styles.primaryButtonText}>Preview instructions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          style={[
            styles.secondaryButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceAlt,
            },
          ]}>
          <Text style={{ color: theme.colors.text }}>Add to project</Text>
        </TouchableOpacity>
      </View>
    </Card>
    </SlideUp>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.meta}>
      <Text style={{ color: theme.colors.muted, fontSize: 12, letterSpacing: 0.4 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  swatchRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 10,
    marginRight: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
});

