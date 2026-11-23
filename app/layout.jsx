import { Tajawal } from 'next/font/google';
import './globals.css';
import Pwa from '../components/pwa';

const tajawal = Tajawal({ subsets: ['arabic'], weight: ['400', '500', '700', '800'], variable: '--font-tajawal' });

export const metadata = {
  title: 'مهام | إدارة مهام الاستوديو',
  description: 'نظام إدارة مهام لفريق الإنتاج الإعلامي',
  manifest: '/manifest.webmanifest',
};
export const viewport = { themeColor: '#0f172a' };

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body><Pwa />{children}</body>
    </html>
  );
}
