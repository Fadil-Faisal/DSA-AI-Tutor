import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'LhamaLearns — Adaptive AI Tutor Agent',
  description:
    'An autonomous AI agent that builds a real-time cognitive model of each student. Tracks every answer, hesitation, and wrong turn — then decides what to teach next.',
  keywords: ['DSA', 'AI Tutor', 'Algorithm', 'Data Structures', 'Adaptive Learning', 'AAYAM 2026'],
  openGraph: {
    title: 'LhamaLearns — Adaptive AI Tutor Agent',
    description: 'Your personal AI-powered DSA coach',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="neural-bg min-h-dvh antialiased">{children}</body>
    </html>
  );
}
