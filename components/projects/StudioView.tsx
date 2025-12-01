import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Project } from '@/types/project';

type StudioViewProps = {
  project: Project;
};

export function StudioView({ project }: StudioViewProps) {
  const theme = useTheme();
  const palette = project.colorPalette || [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Palette Section */}
      <Card title="Palette" subtitle="Yarn colors" style={styles.card}>
        <View style={styles.paletteGrid}>
          {palette.length > 0 ? (
            palette.map((color, index) => (
              <View key={index} style={styles.swatchContainer}>
                <View style={[styles.swatch, { backgroundColor: color }]} />
                <Text style={[styles.hexCode, { color: theme.colors.muted }]}>{color}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>No colors added yet.</Text>
          )}
          <TouchableOpacity
            style={[
              styles.addSwatch,
              { borderColor: theme.colors.border, borderStyle: 'dashed' },
            ]}>
            <FontAwesome name="plus" size={16} color={theme.colors.muted} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Moodboard / Inspiration (Masonry Simulation) */}
      <View style={styles.masonry}>
        <View style={styles.column}>
          <View style={[styles.moodItem, { backgroundColor: '#FEF3C7', height: 120 }]}>
            <Text style={[styles.moodText, { color: '#92400E' }]}>
              "Make the sleeves wider than the pattern suggests. Maybe add ribbing?"
            </Text>
          </View>
          <View style={[styles.moodItem, { backgroundColor: theme.colors.card, height: 180 }]}>
             <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceAlt }]} />
             <Text style={[styles.moodLabel, { color: theme.colors.text }]}>Inspo Pic</Text>
          </View>
        </View>
        <View style={styles.column}>
           <View style={[styles.moodItem, { backgroundColor: theme.colors.card, height: 100, justifyContent: 'center', alignItems: 'center' }]}>
              <FontAwesome name="microphone" size={24} color={theme.colors.accent} />
              <Text style={[styles.moodLabel, { color: theme.colors.text, marginTop: 8 }]}>Voice Note</Text>
           </View>
           <View style={[styles.moodItem, { backgroundColor: '#DBEAFE', height: 160 }]}>
             <Text style={[styles.moodText, { color: '#1E40AF' }]}>
               Need to buy more buttons for the front panel.
             </Text>
           </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchContainer: {
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addSwatch: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexCode: {
    fontSize: 10,
    fontFamily: 'SpaceMono',
  },
  masonry: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  moodItem: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  moodText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  imagePlaceholder: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});





