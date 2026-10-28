import { Nunito } from 'next/font/google';
import './globals.css';

// Memanggil font Nunito dengan berbagai ketebalan
const nunito = Nunito({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800', '900'] 
});

export const metadata = {
  title: 'Android Smart Choice',
  description: 'Panduan Memilih HP Android Terbaik',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
