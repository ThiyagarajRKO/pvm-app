import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClientProviders } from '@/components/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PVM - Pawn Shop Management',
  description:
    'Comprehensive pawn shop management system for tracking records, inventory, and customer data',
  manifest: '/manifest.json',
  themeColor: '#262083',
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PVM',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'PVM',
    title: 'PVM - Pawn Shop Management',
    description: 'Comprehensive pawn shop management system',
  },
  twitter: {
    card: 'summary',
    title: 'PVM - Pawn Shop Management',
    description: 'Comprehensive pawn shop management system',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon-32x32.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PVM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#262083" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#262083" />
      </head>
      <body className={`${inter.className} h-full overflow-hidden`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
