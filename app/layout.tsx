import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0b0b0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Osama The Best',
  description: 'Osama The Best — Private offline-first workout, boxing, and nutrition system.',
  applicationName: 'Osama The Best',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Osama The Best',
  },
  icons: {
    icon: [
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Osama The Best',
    description: 'Osama The Best — Private offline-first workout, boxing, and nutrition system.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Osama The Best',
    description: 'Osama The Best — Private offline-first workout, boxing, and nutrition system.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <head />
      <body
        suppressHydrationWarning
        className="bg-[#0b0b0e] text-[#ededf0] antialiased min-h-screen selection:bg-[#d4b26f]/30 selection:text-[#fae5b5]"
      >
        {children}
      </body>
    </html>
  );
}
