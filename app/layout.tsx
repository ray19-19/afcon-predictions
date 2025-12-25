import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

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
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <Header />
        <main>
          {children}
        </main>
        <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© 2025 AFCON Predictions. Made for friends to compete!</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
