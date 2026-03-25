
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Zap, TrendingUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import ThreeFitLogo from "@/components/ThreeFitLogo";
import { connectWallet } from "@/blockchain";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import DecryptedText from "@/components/animations/DecryptedText";
import SplashCursor from "@/components/animations/SplashCursor";

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const addr = await connectWallet();
      localStorage.setItem('fitcoin_wallet_address', addr);
      
      if (auth) initiateAnonymousSignIn(auth);

      toast({ 
        title: "Welcome, Athlete!", 
        description: "Your session is ready. Let's move!" 
      });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Connection Failed", description: e.message || "Please check your wallet." });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Navbar />
      
      {/* High-End SplashCursor Hero Background Animation */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-60">
        <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
          <SplashCursor
            SIM_RESOLUTION={128}
            DYE_RESOLUTION={1440}
            DENSITY_DISSIPATION={3.5}
            VELOCITY_DISSIPATION={2}
            PRESSURE={0.1}
            CURL={3}
            SPLAT_RADIUS={0.2}
            SPLAT_FORCE={6000}
            COLOR_UPDATE_SPEED={10}
          />
        </div>
      </div>

      <section className="relative pt-32 pb-32 flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <ThreeFitLogo />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-headline font-black text-foreground max-w-5xl leading-tight uppercase italic"
        >
          Sweat is the new <span className="text-black dark:text-white not-italic underline decoration-primary font-black">
            <DecryptedText 
              text="Currency" 
              animateOn="view" 
              sequential 
              speed={50}
              maxIterations={15}
            />
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl text-muted-foreground max-w-2xl font-medium"
        >
          The smart reward plan for athletes. Earn FIT tokens for every workout and redeem them for premium gear.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row gap-6"
        >
          <Button size="lg" onClick={handleConnect} disabled={loading} className="h-16 px-12 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 animate-glow rounded-2xl border-b-4 border-black/10 active:scale-95">
            <Wallet className="w-6 h-6 mr-3" />
            {loading ? "Connecting..." : "Get Started"}
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-16 px-12 text-xl font-black border-2 rounded-2xl pro-glass active:scale-95">
            <Info className="w-6 h-6 mr-3" />
            Learn More
          </Button>
        </motion.div>
      </section>

      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Secure History", text: "Every session is saved and verified on the network for total transparency." },
            { icon: Zap, title: "Effort Rewards", text: "Earn based on time and intensity. More sweat equals more FIT tokens." },
            { icon: TrendingUp, title: "Redeem Gear", text: "FIT isn't just points. It's a real token you use in our store for actual gear." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[3rem] pro-glass border hover:scale-105 transition-all group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon className="w-10 h-10 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-headline font-black mb-4 uppercase tracking-tighter italic">{feature.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t text-center text-muted-foreground bg-secondary/10 relative z-10 backdrop-blur-md">
        <p className="font-black uppercase tracking-widest text-[10px] mb-2">FitCoin Reward Plan v1.0</p>
        <p className="text-[11px] font-medium opacity-60 italic">Created with love by @saarthidhamankar</p>
      </footer>
    </div>
  );
}
