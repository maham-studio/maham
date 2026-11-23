import { Cairo } from 'next/font/google';
import './globals.css';
import Pwa from '../components/pwa';

const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '600', '700', '800', '900'], variable: '--font-cairo' });

export const metadata = {
  title: 'مهام | إدارة مهام الاستوديو',
  description: 'نظام إدارة مهام لفريق الإنتاج الإعلامي',
  manifest: '/manifest.webmanifest',
};
export const viewport = { themeColor: '#0f172a' };

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body><Pwa />{children}</body>
    </html>
  );
}
