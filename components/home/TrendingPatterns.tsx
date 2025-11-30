import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { patternCatalog } from '@/data/patterns/catalog';
import { useTheme } from '@/hooks/useTheme';
import { Pattern } from '@/types/pattern';

export function TrendingPatterns() {
  const theme = useTheme();
  const router = useRouter();
  const trending = patternCatalog.slice(0, 5); // Take first 5 as trending

  const handlePress = (pattern: Pattern) => {
    router.push({
      pathname: '/patterns/[id]',
      params: { id: pattern.id },
    });
  };

  const renderItem = ({ item, index }: { item: Pattern; index: number }) => {
    const color = item.palette?.[0] || theme.colors.surfaceAlt;
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handlePress(item)}
        style={[
          styles.card,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}>
        <View style={[styles.imagePlaceholder, { backgroundColor: color }]}>
          {/* In a real app, use <Image /> here */}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.designer, { color: theme.colors.muted }]} numberOfLines={1}>
            by {item.designer}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SlideUp duration={600} distance={40} delay={200} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Trending Patterns</Text>
        <TouchableOpacity onPress={() => router.push('/patterns')}>
          <Text style={[styles.seeAll, { color: theme.colors.accent }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={trending}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 4,
    gap: 16,
  },
  card: {
    width: 160,
    height: 200,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePlaceholder: {
    flex: 1,
    width: '100%',
  },
  content: {
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  designer: {
    fontSize: 12,
  },
});

