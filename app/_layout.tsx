import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ToastManagerWrapper } from '@/components/ui/ToastProvider';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { useTheme } from '@/hooks/useTheme';
import { ToastProvider } from '@/hooks/useToast';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'home/index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const theme = useTheme();
  const effectiveScheme = useEffectiveColorScheme();
  const isWeb = Platform.OS === 'web';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Tabs
        initialRouteName="home/index"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: theme.colors.accent, // Use dynamic accent color
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarStyle: isWeb ? undefined : {
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 24,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: -4,
          },
        }}>
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: 'Projects',
            tabBarIcon: ({ color }) => <TabBarIcon name="heart-o" color={color} />,
            href: '/projects',
          }}
        />
        <Tabs.Screen
          name="patterns"
          options={{
            title: 'Patterns',
            tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
            href: '/patterns',
          }}
        />
        <Tabs.Screen
          name="community/index"
          options={{
            title: 'Community',
            tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
          }}
        />
        <Tabs.Screen
          name="community/publish"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color}) => <TabBarIcon name="cog" color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="profile/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="create-pattern/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="modal"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="+html"
          options={{
            href: null,
          }}
        />
      </Tabs>
          <ToastManagerWrapper />
        </ThemeProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
