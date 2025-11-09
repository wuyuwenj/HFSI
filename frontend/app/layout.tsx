import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Evidex: AI Judicial Decision Support',
  description: 'An AI-powered judicial assistant that analyzes case documents to highlight critical inconsistencies, eliminate redundancies, and surface key evidence patterns, presenting judges with a clear, concise decision-making dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-dark text-brand-light`}>
        {children}
      </body>
    </html>
  )
}
