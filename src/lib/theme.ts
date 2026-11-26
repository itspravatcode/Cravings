/** Design tokens taken from the Cravings mockups: warm cream surfaces, orange primary. */
export const colors = {
  primary: '#F7801E',
  primaryDark: '#D9650A',
  primarySoft: '#FFEBD6',
  background: '#FFF9F2',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F1EA',
  text: '#1F1A17',
  textSecondary: '#6B635C',
  textMuted: '#A39A92',
  border: '#EFE6DC',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#16A34A',
  plan: '#16A34A',
  planSoft: '#DCFCE7',
  poll: '#7C3AED',
  pollSoft: '#EDE9FE',
  pickup: '#2563EB',
  pickupSoft: '#DBEAFE',
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const font = {
  title: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  subheading: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textSecondary },
  tiny: { fontSize: 11, color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#7A4A1A',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;
