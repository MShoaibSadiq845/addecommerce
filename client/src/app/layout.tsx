import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { Toaster } from "react-hot-toast";
import { LoadingProvider } from "@/context/LoadingContext"; // 👈 1. Import LoadingProvider
import Script from "next/script";

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
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '994425453654094');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/profile.php?id=61593723817051"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
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