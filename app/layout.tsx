import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live Stack AI",
  description: "AI-powered live collaboration workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{
        theme: dark,
        variables: {
          // Map Clerk appearance vars to the app's CSS custom properties
          colorBackground: "var(--background)",
          colorInputForeground: "var(--foreground)",
          colorForeground: "var(--foreground)",
          colorMutedForeground: "var(--muted-foreground)",
          colorPrimary: "var(--primary)",
          colorDanger: "var(--destructive)",
          borderRadius: "var(--radius)",
        },
      }}
    >
        <html
          lang="en"
          className={`${robotoSlab.variable} dark h-full antialiased`}
          suppressHydrationWarning
        >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
