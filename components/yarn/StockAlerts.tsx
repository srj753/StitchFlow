import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { StockAlert } from '@/lib/yarnAnalytics';

export function StockAlerts({ 
  alerts, 
  onPressYarn 
}: { 
  alerts: StockAlert[]; 
  onPressYarn: (id: string) => void; 
}) {
  const theme = useTheme();

  if (alerts.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceAlt }]}>
      <View style={styles.header}>
        <FontAwesome name="exclamation-triangle" size={14} color={theme.colors.notification || '#ff453a'} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Low Stock Alerts</Text>
      </View>
      
      {alerts.slice(0, 3).map((alert) => (
        <TouchableOpacity 
          key={alert.yarnId} 
          onPress={() => onPressYarn(alert.yarnId)}
          style={[styles.row, { borderBottomColor: theme.colors.border }]}
        >
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {alert.name}
            </Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
              {alert.color}
            </Text>
          </View>
          <View style={[
            styles.badge, 
            { backgroundColor: alert.status === 'out_of_stock' ? theme.colors.notification : theme.colors.card }
          ]}>
            <Text style={[styles.badgeText, { color: alert.status === 'out_of_stock' ? '#fff' : theme.colors.text }]}>
              {alert.available <= 0 ? '0 left' : '< 1 left'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
      {alerts.length > 3 && (
        <Text style={[styles.more, { color: theme.colors.muted }]}>
          + {alerts.length - 3} more items
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  more: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  }
});









