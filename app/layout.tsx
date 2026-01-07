import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'AFCON 2025 Predictions',
  description: 'Predict AFCON 2025 match scores and compete with friends',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <Toaster />
        <Header />
        <main>
          {children}
        </main>
        <footer className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-white">
            <p className="font-bold text-lg">⚽ AFCON 2025 Predictions</p>
            <p className="text-sm opacity-90 mt-2">Predict. Compete. and be the arabesque king.</p>
            <p className="text-xs opacity-75 mt-3">© {new Date().getFullYear()} • Made with ❤️ for arabesque friends</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
