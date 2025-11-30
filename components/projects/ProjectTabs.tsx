import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export type ProjectTab = 'track' | 'pattern' | 'studio' | 'ai';

type ProjectTabsProps = {
  activeTab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
};

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const theme = useTheme();

  const tabs: { id: ProjectTab; label: string }[] = [
    { id: 'track', label: 'Track' },
    { id: 'pattern', label: 'Pattern' },
    { id: 'studio', label: 'Studio' },
    { id: 'ai', label: 'Assistant' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceAlt }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: theme.colors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
  },
});

