export const colors = {
  primary: '#F97316',      // orange (matches mockups)
  primaryDark: '#C2410C',
  secondary: '#e74c3c',
  accent: '#f39c12',
  amber: '#FEF3C7',        // greeting card background (lighter)
  amberDark: '#F59E0B',
  background: '#FFFFFF',   // white background (matches mockups)
  backgroundAlt: '#FFF7ED', // cream background for splash
  card: '#ffffff',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  border: '#E2E8F0',
  shadow: '#000000',
  inputBg: '#F8FAFC',
} as const;

export type ThemeColors = typeof colors;