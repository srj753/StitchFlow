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
  const bottomPadding = insets.bottom + theme.spacing.xl + 32;

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

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme.barStyle} />
      {scrollable ? (
        <KeyboardAvoidingView
          style={styles.avoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContainer}>
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

