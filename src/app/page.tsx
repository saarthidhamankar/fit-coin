
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import ThreeFitLogo from "@/components/ThreeFitLogo";
import { connectWallet } from "@/blockchain";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const addr = await connectWallet();
      localStorage.setItem('fitcoin_wallet_address', addr);
      toast({ title: "Connected", description: "Taking you to your dashboard..." });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center justify-center text-center px-4">
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
          className="text-5xl md:text-7xl font-headline font-bold text-foreground max-w-4xl leading-tight"
        >
          Every <span className="text-primary italic">Rep</span> Earns.<br />
          Every <span className="text-accent italic">Set</span> Pays.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl text-muted-foreground max-w-2xl"
        >
          The world's first decentralized gym reward platform. Turn your sweat into FIT tokens on the Ethereum Sepolia network.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" onClick={handleConnect} disabled={loading} className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl animate-glow">
            <Wallet className="w-5 h-5 mr-2" />
            {loading ? "Connecting..." : "Connect Wallet"}
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2" asChild>
            <Link href="#how-it-works">How it Works</Link>
          </Button>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Tamper Proof", text: "Your workout logs and rewards are stored on-chain, ensuring complete transparency and security." },
            { icon: Zap, title: "Instant Rewards", text: "Complete a session and see your FIT balance update instantly via smart contract automation." },
            { icon: TrendingUp, title: "Yield Growth", text: "Hold FIT to unlock exclusive gym memberships or trade them in our verified rewards shop." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl glass-morphism border hover:scale-105 transition-transform"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-headline font-bold text-center mb-16">Proof of Sweat in 4 Steps</h2>
          <div className="space-y-12 relative">
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-primary/20 hidden md:block" />
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your MetaMask wallet on the Sepolia Testnet to start your journey." },
              { step: "02", title: "Log Your Workout", desc: "Start your session. From Yoga to Heavy Lifting, every minute counts towards your reward." },
              { step: "03", title: "Validate On-Chain", desc: "Our smart contract verifies your activity and calculates bonuses based on streak and timing." },
              { step: "04", title: "Spend in Shop", desc: "Redeem your hard-earned FIT tokens for real supplements, gear, and training programs." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-8 items-start relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-headline font-bold text-2xl shadow-lg shrink-0 z-10">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-muted-foreground">
        <p>© 2024 FitCoin Decentralized Gym Rewards. Powered by Sepolia Testnet.</p>
      </footer>
    </div>
  );
}
