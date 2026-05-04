import type { Metadata } from 'next';
import AppLayout from '../src/app/components/Layout';
import '../src/styles/index.css';

export const metadata: Metadata = {
  title: 'IT Support Ticket Form',
  description: 'ITFix support ticket portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
