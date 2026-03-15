
"use client";

import { useState } from "react";
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

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const addr = await connectWallet();
      localStorage.setItem('fitcoin_wallet_address', addr);
      
      // Connect to Firebase Backend
      if (auth) {
        initiateAnonymousSignIn(auth);
      }

      toast({ 
        title: "Protocol Connected", 
        description: addr.startsWith('0xDemo') ? "Demo Mode Active - Welcome!" : "Wallet and Backend synchronized successfully!" 
      });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Connection Failed", description: e.message || "Please check your wallet." });
    } finally {
      setLoading(false);
    }
  };

  const handleHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFeatureClick = (title: string) => {
    toast({
      title: title,
      description: "Our protocol ensures all fitness data is verified and immutable on the blockchain.",
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-32 pb-32 flex flex-col items-center justify-center text-center px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        
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
          Sweat is the new <span className="text-primary not-italic">Currency.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl text-muted-foreground max-w-2xl font-medium"
        >
          The decentralized reward protocol for athletes. Earn FIT tokens for every workout and redeem them for premium gear.
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
          <Button size="lg" variant="outline" onClick={handleHowItWorks} className="h-16 px-12 text-xl font-black border-2 rounded-2xl bg-white/50 backdrop-blur-sm active:scale-95">
            <Info className="w-6 h-6 mr-3" />
            Learn More
          </Button>
        </motion.div>
      </section>

      <section className="py-24 bg-white/50 dark:bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "On-Chain Logs", text: "Every session is cryptographically signed and stored on the Sepolia ledger for total transparency." },
            { icon: Zap, title: "Proof of Sweat", text: "Our algorithm calculates rewards based on duration, intensity, and consistency. No cheating." },
            { icon: TrendingUp, title: "Trade FIT", text: "FIT isn't just a point system. It's a token you can use in our store for real fitness products." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleFeatureClick(feature.title)}
              className="p-10 rounded-[3rem] glass-morphism border hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon className="w-10 h-10 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-headline font-black mb-4 uppercase">{feature.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-32 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-headline font-black text-center mb-24 uppercase italic">The Cycle of Gain</h2>
          <div className="grid md:grid-cols-2 gap-16">
            {[
              { step: "01", title: "Sync Wallet", desc: "Connect MetaMask or use our Demo Mode to start your journey." },
              { step: "02", title: "Sweat & Log", desc: "Start any workout. The longer you go, the more FIT you generate." },
              { step: "03", title: "Earn FIT", desc: "Rewards are minted to your profile instantly after verification." },
              { step: "04", title: "Redeem Gear", desc: "Visit the shop to get mats, bottles, and high-end tech." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => handleFeatureClick(item.title)}
                className="flex gap-8 items-center cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center font-headline font-black text-3xl shadow-xl shadow-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase mb-1">{item.title}</h4>
                  <p className="text-muted-foreground text-lg font-medium leading-tight">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t text-center text-muted-foreground bg-secondary/10">
        <p className="font-black uppercase tracking-widest text-[10px]">FitCoin Protocol v1.0 • Decentralized Physical Rewards</p>
      </footer>
    </div>
  );
}
