// ================ SPACING SYSTEM ================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

// ================ TYPOGRAPHY ================
export const TYPOGRAPHY = {
  h1: { 
    fontSize: '28px', 
    fontWeight: 700,
    lineHeight: '34px',
    letterSpacing: '-0.5px',
  },
  h2: { 
    fontSize: '24px', 
    fontWeight: 700,
    lineHeight: '30px',
    letterSpacing: '-0.3px',
  },
  h3: { 
    fontSize: '20px', 
    fontWeight: 500, 
    lineHeight: '26px',
    letterSpacing: '-0.2px',
  },
  h4: { 
    fontSize: '18px', 
    fontWeight: 600, 
    lineHeight: '24px' 
  },
  body: { 
    fontSize: '16px', 
    fontWeight: 400, 
    lineHeight: '24px' 
  },
  bodySmall: { 
    fontSize: '14px', 
    fontWeight: 400, 
    lineHeight: '20px' 
  },
  sub: { 
    fontSize: '14px', 
    fontWeight: 400, 
    lineHeight: '20px' 
  },
  label: { 
    fontSize: '12px', 
    fontWeight: 500, 
    lineHeight: '16px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  caption: { 
    fontSize: '12px', 
    fontWeight: 400, 
    lineHeight: '16px' 
  },
  button: { 
    fontSize: '16px', 
    fontWeight: 600,
    lineHeight: '24px',
    letterSpacing: '0.1px',
  },
  numeric: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '24px',
    fontVariant: 'tabular-nums' as const,
  },
} as const;

// ================ BORDER RADIUS ================
export const BORDER_RADIUS = {
  xs: '8px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '28px',
  pill: '999px',
  round: '999px',
} as const;

// ================ SHADOWS & ELEVATION ================
export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
  small: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
  md: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
  medium: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
  lg: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
  large: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
  xl: '0 12px 24px 0 rgba(0, 0, 0, 0.18)',
  glow: '0 0 20px rgba(255, 106, 0, 0.5)',
  glowSecondary: '0 0 20px rgba(124, 77, 255, 0.5)',
} as const;

// ================ ANIMATION ================
export const ANIMATION = {
  duration: {
    instant: '0ms',
    fast: '120ms',
    normal: '220ms',
    slow: '320ms',
    verySlow: '480ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    enter: 'cubic-bezier(0.12, 0.9, 0.24, 1)',
    exit: 'cubic-bezier(0.22, 0, 0.36, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  spring: {
    gentle: { damping: 20, stiffness: 300 },
    snappy: { damping: 15, stiffness: 150 },
    bouncy: { damping: 10, stiffness: 100 },
  },
} as const;

// ================ COLOR TYPES ================
interface ColorScheme {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;

  // Base
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textLight: string;

  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Borders & Overlays
  border: string;
  borderLight: string;
  overlay: string;
  overlayLight: string;
  overlayHeavy: string;
  scrim: string;

  // Glass effects
  glass: string;
  glassLight: string;
  glassHeavy: string;

  // State layers
  statePressed: string;
  stateHover: string;
  stateFocus: string;
  stateDisabled: string;
}

// ================ DARK THEME COLORS ================
export const DARK_COLORS: ColorScheme = {
  // Brand
  primary: '#FF6A00',
  primaryDark: '#E55A00',
  primaryLight: '#FF8533',
  secondary: '#7C4DFF',
  secondaryDark: '#6234E5',
  secondaryLight: '#9D7DFF',
  accent: '#FF2D55',

  // Base
  background: '#0F1115',
  surface: '#151821',
  surfaceAlt: '#1C1F2A',
  surfaceElevated: '#232734',

  // Text
  text: '#F5F7FA',
  textSecondary: '#B4BDCC',
  textTertiary: '#7A8394',
  textLight: '#5A6373',

  // Semantic
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',

  // Borders & Overlays
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.6)',

  // Glass effects
  glass: 'rgba(255, 255, 255, 0.06)',
  glassLight: 'rgba(255, 255, 255, 0.03)',
  glassHeavy: 'rgba(255, 255, 255, 0.10)',

  // State layers
  statePressed: 'rgba(255, 255, 255, 0.10)',
  stateHover: 'rgba(255, 255, 255, 0.08)',
  stateFocus: 'rgba(255, 106, 0, 0.24)',
  stateDisabled: 'rgba(255, 255, 255, 0.12)',
};

// ================ LIGHT THEME COLORS ================
export const LIGHT_COLORS: ColorScheme = {
  // Brand
  primary: '#FF6A00',
  primaryDark: '#E55A00',
  primaryLight: '#FF8533',
  secondary: '#7C4DFF',
  secondaryDark: '#6234E5',
  secondaryLight: '#9D7DFF',
  accent: '#FF2D55',

  // Base
  background: '#FFFFFF',
  surface: '#F6F7FB',
  surfaceAlt: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#0A0C12',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textLight: '#A0AEC0',

  // Semantic
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',

  // Borders & Overlays
  border: 'rgba(10, 12, 18, 0.08)',
  borderLight: 'rgba(10, 12, 18, 0.04)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.6)',
  scrim: 'rgba(0, 0, 0, 0.5)',

  // Glass effects
  glass: 'rgba(10, 12, 18, 0.06)',
  glassLight: 'rgba(10, 12, 18, 0.03)',
  glassHeavy: 'rgba(10, 12, 18, 0.10)',

  // State layers
  statePressed: 'rgba(0, 0, 0, 0.06)',
  stateHover: 'rgba(0, 0, 0, 0.04)',
  stateFocus: 'rgba(255, 106, 0, 0.12)',
  stateDisabled: 'rgba(0, 0, 0, 0.12)',
};

// ================ GRADIENTS ================
export const GRADIENTS = {
  brand: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
  accent: 'linear-gradient(135deg, #7C4DFF 0%, #18A0FB 100%)',
  dark: 'linear-gradient(180deg, #1C1F2A 0%, #0F1115 100%)',
  shimmer: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 100%)',
  success: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)',
} as const;

// ================ BLUR SETTINGS ================
export const BLUR = {
  none: '0px',
  sm: '10px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

// ================ Z-INDEX LAYERS ================
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;

// ================ THEME TYPE ================
export interface Theme {
  colors: ColorScheme;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  animation: typeof ANIMATION;
  gradients: typeof GRADIENTS;
  blur: typeof BLUR;
  zIndex: typeof Z_INDEX;
}

// ================ EXPORT THEMES ================
export const themes: Record<'dark' | 'light', Theme> = {
  dark: {
    colors: DARK_COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    animation: ANIMATION,
    gradients: GRADIENTS,
    blur: BLUR,
    zIndex: Z_INDEX,
  },
  light: {
    colors: LIGHT_COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    animation: ANIMATION,
    gradients: GRADIENTS,
    blur: BLUR,
    zIndex: Z_INDEX,
  },
};

// Для обратной совместимости
export const COLORS = DARK_COLORS;