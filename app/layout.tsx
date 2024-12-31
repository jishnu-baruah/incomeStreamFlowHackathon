'use client';

import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add client-side only rendering
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom body component to handle dynamic attributes
  const Body = ({ children }: { children: React.ReactNode }) => {
    if (!mounted) {
      return null;
    }

    return (
      <body suppressHydrationWarning>
        {children}
      </body>
    );
  };

  return (
    <html lang="en">
      <Body>
        <AuthContextProvider>{children}</AuthContextProvider>
      </Body>
    </html>
  );
}