import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type ProjectTab = 'track' | 'pattern' | 'studio' | 'ai';

type ProjectTabsProps = {
  activeTab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
};

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const theme = useTheme();
  const aiAssistantEnabled = useSettingsStore((state) => state.aiAssistantEnabled);

  const tabs: { id: ProjectTab; label: string }[] = [
    { id: 'track', label: 'Track' },
    { id: 'pattern', label: 'Pattern' },
    { id: 'studio', label: 'Studio' },
    ...(aiAssistantEnabled ? [{ id: 'ai' as ProjectTab, label: 'Assistant' }] : []),
  ];

  const handleTabPress = (tabId: ProjectTab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onTabChange(tabId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceAlt }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: theme.colors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.text : theme.colors.textSecondary,
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
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  label: {
    fontSize: 13,
  },
});
