import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { Toaster } from "react-hot-toast";
import { LoadingProvider } from "@/context/LoadingContext"; // 👈 1. Import LoadingProvider

export const metadata: Metadata = {
  title: "FabDecor | E-Commerce Platform & Admin Dashboard",
  description: "Pixel-perfect e-commerce platform with dynamic RTK Query API layer, NestJS backend, MongoDB, and real-time Socket.IO sales alerts.",
  icons: {
    icon: [
      { url: '/icon.png?v=3', type: 'image/png' },
      { url: '/favicon.ico?v=3' },
    ],
    shortcut: '/icon.png?v=3',
    apple: '/icon.png?v=3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black min-h-screen">
        <ReduxProvider>
          <LoadingProvider> {/* 👈 2. Wrap children and toaster inside LoadingProvider */}
            {children}
            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                style: { fontFamily: 'Rubik, sans-serif', fontSize: '13px' },
                success: { duration: 3500 },
                error: { duration: 4000 },
              }}
            />
          </LoadingProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}