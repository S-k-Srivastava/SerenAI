import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { SSOProvider } from "@/providers/SSOProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SerenAI - AI Chat Platform",
  description: "Advanced AI Chatbot Management",
  icons: {
    icon: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <SSOProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                <ViewModeProvider>
                  {children}
                  <Toaster />
                </ViewModeProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </SSOProvider>
      </body>
    </html>
  );
}
