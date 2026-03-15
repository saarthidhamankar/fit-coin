"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Lock, ExternalLink, Award, Milestone, Calendar } from "lucide-react";
import { getBalance } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";

const ACHIEVEMENTS = [
  { id: 1, title: "Early Bird", desc: "5 morning workouts", icon: "🌅", unlocked: true },
  { id: 2, title: "Iron Soul", desc: "First 10 sessions", icon: "💪", unlocked: true },
  { id: 3, title: "Socialite", desc: "Share on Twitter", icon: "🐦", unlocked: true },
  { id: 4, title: "Century Club", desc: "100 workouts", icon: "💯", unlocked: false },
  { id: 5, title: "Whale", desc: "Hold 10,000 FIT", icon: "🐋", unlocked: false },
  { id: 6, title: "Weekend Warrior", desc: "Workout on Saturday", icon: "⚔️", unlocked: true },
  { id: 7, title: "Flame Keeper", desc: "7 day streak", icon: "🔥", unlocked: true },
  { id: 8, title: "Gym Legend", desc: "Rank #1 weekly", icon: "🥇", unlocked: false },
  { id: 9, title: "Eco Athlete", desc: "Cycle 50km", icon: "🚲", unlocked: false },
  { id: 10, title: "Welcome Home", desc: "First connection", icon: "🏠", unlocked: true },
];

export default function ProfilePage() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      getBalance(addr).then(setBalance);
    }
  }, []);

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile customization will be available after the next smart contract update.",
    });
  };

  const handleSettingsClick = () => {
    toast({
      title: "Security Settings",
      description: "Encryption keys and notification preferences are managed via your wallet.",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile */}
        <div className="relative">
          <div className="h-48 w-full bg-gradient-to-r from-primary to-accent rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>
          <div className="px-8 -mt-16 flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-card shadow-2xl">
                <AvatarImage src={`https://picsum.photos/seed/${address}/200/200`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-card flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-headline font-black uppercase tracking-tight">
                {address ? `My Account: ${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Not Connected"}
              </h1>
              <p className="text-muted-foreground font-code text-xs flex items-center gap-2 mt-1">
                {address || "Please connect your wallet"}
                {address && <ExternalLink className="w-3 h-3 cursor-pointer text-primary" />}
              </p>
            </div>
            <div className="flex gap-2 mb-2">
              <Button size="sm" onClick={handleEditProfile} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10">Edit</Button>
              <Button size="sm" variant="outline" onClick={handleSettingsClick} className="rounded-xl h-10 w-10 p-0 bg-white dark:bg-card border-2">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FIT Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
                  <p className="text-[10px] font-black uppercase text-primary/60 mb-1">Total Balance</p>
                  <p className="text-4xl font-black text-primary">{balance.toLocaleString()} <span className="text-sm">FIT</span></p>
                </div>
                <div className="p-4 bg-muted/50 dark:bg-muted/10 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Active Network</p>
                  <p className="text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Sepolia Mainnet v1
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardContent className="p-6 space-y-6">
                {[
                  { label: "Gym Sessions", value: "24", icon: Milestone },
                  { label: "Active Since", value: "Oct 2023", icon: Calendar },
                  { label: "On-Chain Bonus", value: "450 FIT", icon: Award }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-secondary/20 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">{s.label}</p>
                      <p className="font-black text-sm">{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-black uppercase">
                  <Award className="w-5 h-5 text-primary" />
                  Performance Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {ACHIEVEMENTS.map((a) => (
                    <div key={a.id} className={`flex flex-col items-center text-center group cursor-help p-2 rounded-2xl transition-all ${!a.unlocked ? 'grayscale opacity-30' : 'hover:bg-primary/5'}`}>
                      <div className={`w-16 h-16 rounded-2xl mb-2 flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${a.unlocked ? 'bg-primary/10 border-2 border-primary/20' : 'bg-muted dark:bg-muted/10'}`}>
                        {a.icon}
                      </div>
                      <p className="text-[9px] font-black uppercase leading-tight tracking-tighter">{a.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Protocol Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { label: "Visibility", value: "Public/Athlete", icon: Shield },
                    { label: "Ledger Connection", value: "Biometric/Wallet", icon: Lock },
                    { label: "Sync Prefs", value: "Live On-Chain", icon: Settings }
                  ].map((s, i) => (
                    <div key={i} onClick={handleSettingsClick} className="flex items-center justify-between p-6 hover:bg-muted/10 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-4">
                        <s.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-black text-sm uppercase tracking-wide">{s.label}</span>
                      </div>
                      <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
