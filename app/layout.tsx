import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { ToastProvider } from "@/lib/toast-provider"
import { AppShell } from "@/components/app-shell"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Sistema de Ordens de Serviço</title>
        <meta name="description" content="Gerenciamento de ordens de serviço, clientes e equipamentos" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider defaultTheme="light">
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
