"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

// Extend ThemeProviderProps to include suppressHydrationWarning property
interface ExtendedThemeProviderProps extends ThemeProviderProps {
  suppressHydrationWarning?: boolean
}

export function ThemeProvider({
  children,
  suppressHydrationWarning, // Accept this property but don't use it
  ...props
}: ExtendedThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
