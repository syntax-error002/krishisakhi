export const theme = {
  colors: {
    primary: '#2E7D32', // Deep agricultural green
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    background: '#F5F9F6', // Off-white with a hint of green
    surface: '#FFFFFF',
    text: '#1C2826',
    textSecondary: '#5C706A',
    accent: '#FFB300', // Warning/highlight color (like wheat/sun)
    error: '#D32F2F',
    success: '#388E3C',
    inputBackground: '#E8F5E9',
    border: '#C8E6C9',
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700', color: '#1C2826' },
    h2: { fontSize: 24, fontWeight: '700', color: '#1C2826' },
    h3: { fontSize: 20, fontWeight: '600', color: '#1C2826' },
    body: { fontSize: 16, color: '#1C2826' },
    bodySecondary: { fontSize: 14, color: '#5C706A' },
    caption: { fontSize: 12, color: '#5C706A' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  }
};
