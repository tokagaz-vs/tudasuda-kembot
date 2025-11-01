import { useColorScheme } from './useColorScheme';

const LIGHT_THEME = {
  colors: {
    primary: '#FF6A00',
    primaryDark: '#E55A00',
    primaryLight: '#FF8533',
    secondary: '#7C4DFF',
    accent: '#FF2D55',
    background: '#FFFFFF',
    surface: '#F6F7FB',
    surfaceAlt: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#0A0C12',
    textSecondary: '#4A5568',
    textTertiary: '#718096',
    textLight: '#A0AEC0',
    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#F87171',
    info: '#3B82F6',
    infoLight: '#60A5FA',
    border: 'rgba(10, 12, 18, 0.08)',
    borderLight: 'rgba(10, 12, 18, 0.04)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    glass: 'rgba(10, 12, 18, 0.06)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  typography: {
    h1: { fontSize: '28px', fontWeight: 700 },
    h2: { fontSize: '24px', fontWeight: 700 },
    h3: { fontSize: '20px', fontWeight: 600 },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  gradients: {
    brand: {
      colors: ['#FF6A00', '#FF2D55'] as const,
      css: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
    },
    accent: {
      colors: ['#7C4DFF', '#18A0FB'] as const,
      css: 'linear-gradient(135deg, #7C4DFF 0%, #18A0FB 100%)',
    },
    success: {
      colors: ['#22C55E', '#10B981'] as const,
      css: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
    },
  },
};

const DARK_THEME = {
  ...LIGHT_THEME,
  colors: {
    ...LIGHT_THEME.colors,
    background: '#0F1115',
    surface: '#151821',
    surfaceAlt: '#1C1F2A',
    text: '#F5F7FA',
    textSecondary: '#B4BDCC',
    textTertiary: '#7A8394',
    textLight: '#5A6373',
    border: 'rgba(255, 255, 255, 0.08)',
    glass: 'rgba(255, 255, 255, 0.06)',
  },
};

export const useTheme = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return isDark ? DARK_THEME : LIGHT_THEME;
};