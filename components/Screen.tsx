import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  contentStyle?: ViewStyle;
};

export function Screen({ children, scrollable = true, contentStyle }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Adjust bottom padding for web to avoid cutting off content if no tab bar is present or different layout
  const isWeb = Platform.OS === 'web';
  const bottomPadding = insets.bottom + theme.spacing.xl + (isWeb ? 48 : 32);

  const content = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: bottomPadding,
        },
        contentStyle,
      ]}>
      {children}
    </View>
  );

  const containerStyle = [
    styles.safeArea,
    {
      backgroundColor: theme.colors.background,
    },
    // Web-specific centering constraint
    isWeb && styles.webContainer,
  ];

  return (
    <View style={[styles.webBackground, { backgroundColor: isWeb ? '#111' : theme.colors.background }]}>
      <SafeAreaView
        style={containerStyle}
        edges={['top', 'left', 'right']}>
        <StatusBar barStyle={theme.barStyle} />
        {scrollable ? (
          <KeyboardAvoidingView
            style={styles.avoider}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={!isWeb} // Hide scrollbar on web for cleaner look
            >
              {content}
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackground: {
    flex: 1,
    justifyContent: 'center', // Center the "mobile" app on desktop
    flexDirection: 'row',
  },
  webContainer: {
    maxWidth: 500, // Limit width on desktop to simulate mobile view
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  avoider: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
  },
});
