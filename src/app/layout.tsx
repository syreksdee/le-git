import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lé Git — Artisanal Homemade Cookies',
  description: 'Product catalog for Lé Git artisanal cookies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
