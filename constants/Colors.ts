import { darkTheme, lightTheme } from '@/lib/theme';

export default {
  light: {
    text: lightTheme.colors.text,
    background: lightTheme.colors.background,
    tint: lightTheme.colors.accent,
    tabIconDefault: lightTheme.colors.muted,
    tabIconSelected: lightTheme.colors.accent,
  },
  dark: {
    text: darkTheme.colors.text,
    background: darkTheme.colors.background,
    tint: darkTheme.colors.accent,
    tabIconDefault: darkTheme.colors.muted,
    tabIconSelected: darkTheme.colors.accent,
  },
};
