import type { Metadata } from "next";
import { MantineProvider, createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import "./globals.css";

const theme = mergeMantineTheme(DEFAULT_THEME, createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  headings: { fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: '700' },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 2px 8px rgba(0,0,0,0.06)',
    lg: '0 4px 24px rgba(0,0,0,0.1)',
  },
  components: {
    Paper: { defaultProps: { radius: 'md', shadow: 'sm', p: 'md' } },
    Card: { defaultProps: { radius: 'md', shadow: 'sm', withBorder: true, padding: 'md' } },
    Table: { defaultProps: { verticalSpacing: 'xs', horizontalSpacing: 'sm', withTableBorder: false } },
    Button: { defaultProps: { size: 'sm', radius: 'md' } },
    ActionIcon: { defaultProps: { variant: 'subtle', size: 'md', radius: 'md' } },
    Badge: { defaultProps: { variant: 'light', size: 'sm', radius: 'xl' } },
    TextInput: { defaultProps: { radius: 'md', size: 'sm' } },
    NativeSelect: { defaultProps: { radius: 'md', size: 'sm' } },
    Select: { defaultProps: { radius: 'md', size: 'sm' } },
    Modal: { defaultProps: { radius: 'md' } },
    Tabs: { defaultProps: { radius: 'md' } },
    Tooltip: { defaultProps: { radius: 'md' } },
  },
}));

export const metadata: Metadata = {
  title: "Calificar Grupos",
  description: "Sistema para Calificacion de grupos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
