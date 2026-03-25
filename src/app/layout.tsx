import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import ThemeColorSynchronizer from "@/components/ThemeColorSynchronizer";
import LiquidEther from "@/components/animations/LiquidEther";

export const metadata: Metadata = {
  title: 'FitCoin | Decentralized Fitness Rewards',
  description: 'Earn FIT tokens for every rep on the Sepolia testnet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 min-h-screen relative">
        <FirebaseClientProvider>
          <ThemeColorSynchronizer />
          {/* Global background for inner pages, placed at -z-20 to allow hero animations at -z-10 to be visible */}
          <LiquidEther 
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            colors={["#5227FF","#FF9FFC","#B19EEF"]}
            autoDemo
            autoSpeed={0.5}
            autoIntensity={2.2}
            isBounce={false}
            resolution={0.5}
          />
          <div className="relative z-10">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
