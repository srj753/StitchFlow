import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { WeeklyProgressData } from '@/lib/analytics';

export function WeeklyActivityChart({ data }: { data: WeeklyProgressData[] }) {
  const theme = useTheme();
  
  // Find max for scaling
  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid div by zero

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Activity</Text>
      
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const displayCount = item.count || 0;
          const maxCount = Math.max(...data.map(d => d.count), 1);
          const heightPercent = maxCount > 0 ? (displayCount / maxCount) * 100 : 0;
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      height: `${heightPercent}%`,
                      backgroundColor: theme.colors.accent,
                      opacity: displayCount > 0 ? (index === data.length - 1 ? 1 : 0.6) : 0.2
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.dayLabel, { color: theme.colors.muted }]}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  barTrack: {
    width: 8,
    height: '100%',
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  }
});









