export const lightColors = {
  background: '#FDF3EF',
  card: '#FFFFFF',
  primary: '#F43F6D',
  primaryDark: '#E12F5C',
  gold: '#F5A623',
  textDark: '#22213A',
  textGray: '#8A8A9A',
  border: '#F1E4DE',
  success: '#2ECC71',
  black: '#000000',
  white: '#FFFFFF',
  chipBackground: '#F7F1EE',
  overlay: 'rgba(0,0,0,0.35)',
};

export const darkColors = {
  background: '#141320',
  card: '#1F1E2E',
  primary: '#F43F6D',
  primaryDark: '#FF6690',
  gold: '#F5A623',
  textDark: '#F1EFFA',
  textGray: '#A5A3B8',
  border: '#302E42',
  success: '#2ECC71',
  black: '#000000',
  white: '#FFFFFF',
  chipBackground: '#2A2839',
  overlay: 'rgba(0,0,0,0.5)',
};

// Back-compat default for any code that isn't theme-aware yet.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export default { colors, lightColors, darkColors, spacing, radius };
