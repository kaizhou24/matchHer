// src/pages/_app.tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // Import Sonner's Toaster

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <SonnerToaster richColors position="top-right" /> {/* Add SonnerToaster here */}
    </>
  );
}

export default MyApp;