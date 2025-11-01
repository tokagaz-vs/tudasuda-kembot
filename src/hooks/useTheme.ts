import { useThemeStore } from '@/store/themeStore';
import { themes } from '@/constants/theme';

export const useTheme = () => {
  const { isDark, toggleTheme, setTheme } = useThemeStore();
  
  const theme = isDark ? themes.dark : themes.light;

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    animation: theme.animation,
    gradients: theme.gradients,
    blur: theme.blur,
    zIndex: theme.zIndex,
  };
};