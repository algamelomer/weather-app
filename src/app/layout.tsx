import "./globals.css";

export const metadata = {
  title: "Weather Glass",
  description: "7-day forecast with premium glassmorphism design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <html lang="en">
      {/* <head>
        {client ? (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head> */}
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}