// src/app/layout.tsx
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider'; // Importe seu ThemeProvider
// Importe AuthProvider removido
// import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from "@/components/ui/toaster"; // Importe Toaster (se estiver usando)


// ... imports

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <html lang="pt-br" suppressHydrationWarning><body>{/* Sem espaços */}
      {/* AuthProvider removido */}
      {/* <AuthProvider> */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      {/* </AuthProvider> */}
    </body></html> // Sem espaços
  );
}

