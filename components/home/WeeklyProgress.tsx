import { StyleSheet, Text, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { useTheme } from '@/hooks/useTheme';

// Mock data - in a real app this would come from your history logs
const data = [
  { day: 'M', value: 40 },
  { day: 'T', value: 70 },
  { day: 'W', value: 30 },
  { day: 'T', value: 85 },
  { day: 'F', value: 50 },
  { day: 'S', value: 90 },
  { day: 'S', value: 60 },
];

export function WeeklyProgress() {
  const theme = useTheme();
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <SlideUp duration={600} distance={40} delay={100} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>This Week's Flow</Text>
      </View>
      
      <View style={styles.chart}>
        {data.map((item, index) => {
          const heightPercentage = (item.value / maxVal) * 100;
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercentage}%`,
                      backgroundColor: index === 5 ? theme.colors.accent : theme.colors.border, // Highlight today (Saturday/Sunday)
                      opacity: index === 5 ? 1 : 0.5,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, { color: theme.colors.muted }]}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barContainer: {
    height: 100, // Max height of bars
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});



