import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { ChatAssistant } from "@/components/chat-assistant";

export const metadata: Metadata = {
  title: {
    default: "EmailForge — AI-Powered HTML Email Development Platform",
    template: "%s — EmailForge",
  },
  description:
    "Create, analyze, optimize and validate HTML emails with AI and a deterministic email rule engine. Vision → Convert → Validate.",
  applicationName: "EmailForge",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </div>
            <ChatAssistant />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-body text-muted-foreground sm:flex-row">
        <p>
          EmailForge — Deterministic rule engine + AI analysis for HTML email.
        </p>
        <p className="text-xs">Vision → Convert → Validate</p>
      </div>
    </footer>
  );
}
