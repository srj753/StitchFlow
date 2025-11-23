import { ColorSchemeName } from 'react-native';

type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  cardMuted: string;
  text: string;
  textSecondary: string;
  muted: string;
  accent: string;
  accentMuted: string;
  border: string;
  shadow: string;
};

type ThemeSpacing = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

type ThemeRadius = {
  sm: number;
  md: number;
  lg: number;
};

type ThemeTypography = {
  eyebrow: number;
  small: number;
  body: number;
  title: number;
  display: number;
};

export type Theme = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
  barStyle: 'light-content' | 'dark-content';
};

const baseSpacing: ThemeSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

const radius: ThemeRadius = {
  sm: 10,
  md: 16,
  lg: 24,
};

const typography: ThemeTypography = {
  eyebrow: 12,
  small: 14,
  body: 16,
  title: 28,
  display: 34,
};

export const darkTheme: Theme = {
  colors: {
    background: '#07080c',
    surface: '#0d1018',
    surfaceAlt: '#131726',
    card: '#1b2032',
    cardMuted: '#141922',
    text: '#f5f5ff',
    textSecondary: '#b6bfd6',
    muted: '#8087a2',
    accent: '#f68aaf',
    accentMuted: 'rgba(246, 138, 175, 0.15)',
    border: '#2d3350',
    shadow: 'rgba(0, 0, 0, 0.25)',
  },
  spacing: baseSpacing,
  radius,
  typography,
  barStyle: 'light-content',
};

export const lightTheme: Theme = {
  colors: {
    background: '#f7f7fb',
    surface: '#fdfdff',
    surfaceAlt: '#f2f3f8',
    card: '#ffffff',
    cardMuted: '#f4f5fb',
    text: '#1d2333',
    textSecondary: '#4b5162',
    muted: '#8a90a6',
    accent: '#d44f87',
    accentMuted: 'rgba(212, 79, 135, 0.14)',
    border: '#e3e5ef',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
  spacing: baseSpacing,
  radius,
  typography,
  barStyle: 'dark-content',
};

export const getTheme = (scheme: ColorSchemeName): Theme => {
  return scheme === 'dark' ? darkTheme : lightTheme;
};




