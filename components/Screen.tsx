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
  safeAreaBackgroundColor?: string;
};

export function Screen({ children, scrollable = true, contentStyle, safeAreaBackgroundColor }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  // On web, we don't have a bottom tab bar overlay usually, but we might want padding
  const bottomPadding = insets.bottom + theme.spacing.xl + (isWeb ? 24 : 32);

  const content = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: bottomPadding,
        },
        isWeb && styles.webContentConstraint,
        contentStyle,
      ]}>
      {children}
    </View>
  );

  const safeAreaStyle = [
    styles.safeArea,
    {
      backgroundColor: safeAreaBackgroundColor ?? theme.colors.background,
    },
  ];

  // Web-specific simplified wrapper to avoid layout/touch issues
  if (isWeb) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, overflow: 'hidden' }]}>
        <View style={styles.webInnerContainer}>
          {scrollable ? (
            <ScrollView
              style={{ width: '100%', flex: 1 }}
              contentContainerStyle={[styles.scrollContainer, styles.webScrollContainer]}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="always"
            >
              {content}
            </ScrollView>
          ) : (
            <View style={[styles.staticContainer, styles.webScrollContainer]}>
              {content}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Native Implementation
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView
        style={safeAreaStyle}
        edges={['top', 'left', 'right']}>
        <StatusBar barStyle={theme.barStyle} />

        <View style={styles.innerContainer}>
          {scrollable ? (
            <KeyboardAvoidingView
              style={styles.avoider}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                {content}
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.staticContainer}>
              {content}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  webInnerContainer: {
    flex: 1,
    alignItems: 'center', // Center content column
    width: '100%',
    height: '100%', // Ensure full height
  },
  avoider: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  staticContainer: {
    flex: 1,
    width: '100%',
  },
  webScrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
  },
  webContentConstraint: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
});
