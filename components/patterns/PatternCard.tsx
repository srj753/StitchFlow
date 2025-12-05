import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { useTheme } from '@/hooks/useTheme';
import { Pattern } from '@/types/pattern';

type PatternCardProps = {
  pattern: Pattern;
  onPreview: () => void;
  onSave: () => void;
  index?: number;
};

// Fallback colors if no palette is available
const difficultyColors: Record<string, string[]> = {
  beginner: ['#4ade80', '#22c55e'], // Green
  intermediate: ['#facc15', '#eab308'], // Yellow
  advanced: ['#f87171', '#ef4444'], // Red
  default: ['#94a3b8', '#64748b'], // Slate gray
};

export function PatternCard({ pattern, onPreview, onSave, index = 0 }: PatternCardProps) {
  const theme = useTheme();
  const palette = pattern.palette ? pattern.palette.slice(0, 3) : [];

  // Use palette for the gradient if available, otherwise fallback to difficulty or default
  const getGradientColors = () => {
    if (palette.length >= 2) {
      return palette.slice(0, 2);
    } else if (palette.length === 1) {
      return [palette[0], palette[0]]; // Solid gradient
    }

    // Fallback to difficulty colors
    const difficultyKey = pattern.difficulty?.toLowerCase() || 'default';
    return difficultyColors[difficultyKey] || difficultyColors.default;
  };

  const gradientColors = getGradientColors();

  return (
    <SlideUp delay={index * 50} duration={300}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPreview}
        style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}
      >
        {/* Top Decoration Bar */}
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.colorBar}
        />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                {pattern.name}
              </Text>
              <Text style={[styles.designer, { color: theme.colors.textSecondary }]}>
                by {pattern.designer}
              </Text>
            </View>

            {/* Difficulty Badge */}
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                {pattern.difficulty || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <FontAwesome name="clock-o" size={12} color={theme.colors.muted} />
              <Text style={[styles.detailText, { color: theme.colors.muted }]}>{pattern.duration}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            <View style={styles.detailItem}>
              <FontAwesome name="balance-scale" size={12} color={theme.colors.muted} />
              <Text style={[styles.detailText, { color: theme.colors.muted }]}>{pattern.yarnWeight}</Text>
            </View>
          </View>

          {/* Footer: Palette & Actions */}
          <View style={styles.footer}>
            {/* Mini Palette */}
            <View style={styles.palette}>
              {palette.map((color, i) => (
                <View
                  key={i}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: color,
                      borderColor: theme.colors.surface, // Match card background for cutout effect
                      zIndex: 10 - i,
                      marginLeft: i === 0 ? 0 : -8
                    }
                  ]}
                />
              ))}
              {palette.length === 0 && (
                <Text style={{ color: theme.colors.muted, fontSize: 12, fontStyle: 'italic' }}>
                  No palette
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                style={[styles.addBtn, { backgroundColor: theme.colors.text }]}
              >
                <Text style={[styles.addBtnText, { color: theme.colors.background }]}>Use</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  colorBar: {
    height: 6,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  designer: {
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 12,
    marginHorizontal: 12,
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  palette: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
