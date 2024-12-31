'use client';

import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <AuthContextProvider>
          <main className="flex-grow overflow-y-auto">
            {children}
          </main>
        </AuthContextProvider>
      </body>
    </html>
  );
}

