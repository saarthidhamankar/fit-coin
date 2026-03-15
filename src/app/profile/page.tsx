"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Lock, ExternalLink, Award, Calendar, Camera, Edit2, Zap, LayoutGrid, Database, RefreshCw, Globe, Smartphone } from "lucide-react";
import { getBalance } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

const ACHIEVEMENTS = [
  { id: 1, title: "Early Bird", desc: "5 morning workouts", icon: "🌅", unlocked: true },
  { id: 2, title: "Iron Soul", desc: "First 10 sessions", icon: "💪", unlocked: true },
  { id: 3, title: "Weekend Warrior", desc: "Workout on Saturday", icon: "⚔️", unlocked: true },
  { id: 4, title: "Flame Keeper", desc: "7 day streak", icon: "🔥", unlocked: true },
  { id: 5, title: "Welcome Home", desc: "First connection", icon: "🏠", unlocked: true },
];

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    username: "",
    avatarUrl: "",
    bannerUrl: ""
  });

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      getBalance(addr).then(setBalance);
    }
    if (profile) {
      setFormData({
        username: profile.username || "",
        avatarUrl: profile.avatarUrl || "",
        bannerUrl: profile.bannerUrl || ""
      });
    }
    if (searchParams.get('tab') === 'settings') {
      setSettingsOpen(true);
    }
  }, [profile, user, searchParams]);

  const handleSaveProfile = async () => {
    if (!userDocRef) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Ledger reference not initialized." });
      return;
    }

    // Smart Identity Commit: Supports partial updates. If name is entered but URLs are empty,
    // only the name is updated in the Firestore document.
    const updates: any = {};
    if (formData.username.trim()) {
      updates.username = formData.username;
    }
    if (formData.avatarUrl.trim()) {
      updates.avatarUrl = formData.avatarUrl;
    }
    if (formData.bannerUrl.trim()) {
      updates.bannerUrl = formData.bannerUrl;
    }

    if (Object.keys(updates).length === 0) {
      toast({ title: "No Changes Detected", description: "Fill out the name field to sync identity." });
      setEditOpen(false);
      return;
    }

    try {
      await updateDoc(userDocRef, updates);
      toast({ 
        title: "Identity Committed", 
        description: "Your athlete name and identity have been synchronized to the Firestore ledger.",
      });
      setEditOpen(false);
    } catch (e) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Error", 
        description: "Failed to synchronize identity changes. Check network connection." 
      });
    }
  };

  const handleInteractiveClick = (label: string) => {
    toast({
      title: "Interactive Ledger",
      description: `Synchronizing ${label} protocol with decentralized node...`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-12 px-4 relative mesh-background"
    >
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Designer Banner */}
        <div className="relative group">
          <div className="h-64 w-full bg-gradient-to-r from-primary to-accent rounded-[3.5rem] overflow-hidden relative shadow-2xl">
            {profile?.bannerUrl ? (
              <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-8 right-8 rounded-2xl glass-card border-none font-black uppercase text-[10px] tracking-widest hover:scale-110 transition-transform"
              onClick={() => setEditOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" /> Update Banner
            </Button>
          </div>
          
          <div className="px-10 -mt-24 flex flex-col md:flex-row md:items-end gap-8 relative z-10">
            <div className="relative group/avatar">
              <Avatar className="w-48 h-48 border-[12px] border-background shadow-2xl transition-transform group-hover/avatar:scale-105">
                <AvatarImage src={profile?.avatarUrl || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                <AvatarFallback className="bg-primary text-white text-5xl font-black">A</AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity border-[12px] border-transparent"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-headline font-black uppercase italic tracking-tighter">
                  {profile?.username || "Athlete Name"}
                </h1>
                <Badge className="bg-primary text-[10px] font-black uppercase tracking-widest px-3 py-1">Verified Pro</Badge>
              </div>
              <p className="text-muted-foreground font-code text-xs flex items-center gap-2 mt-3 bg-white/5 dark:bg-black/20 w-fit px-4 py-1.5 rounded-full border border-border/50">
                {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : "Not Connected"}
                <ExternalLink className="w-3.5 h-3.5 text-primary cursor-pointer hover:scale-125 transition-all" onClick={() => handleInteractiveClick("Blockchain Explorer")} />
              </p>
            </div>
            
            <div className="flex gap-4 mb-6">
              <Button size="lg" onClick={() => setEditOpen(true)} className="rounded-3xl font-black uppercase text-xs h-16 px-12 shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 active:scale-95 transition-all">
                Edit Identity
              </Button>
              <Button size="lg" variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-3xl h-16 w-16 p-0 glass-card border-none active:scale-95 transition-all hover:bg-primary/10">
                <Settings className="w-8 h-8 text-primary" />
              </Button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="pb-2 border-b border-border/10 bg-muted/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">FIT Ledger Sync</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="p-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] border-2 border-primary/20 hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => handleInteractiveClick("Live Balance Sync")}>
                  <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest flex items-center justify-between">
                    Liquid Assets
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                  </p>
                  <p className="text-5xl font-black text-primary tracking-tighter">{balance.toLocaleString()} <span className="text-xl">FIT</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="ghost" className="h-24 bg-muted/30 rounded-[2.5rem] flex flex-col gap-2 border border-border/50 hover:bg-primary/10 transition-all group" onClick={() => handleInteractiveClick("Transaction History")}>
                    <Database className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                  </Button>
                  <Button variant="ghost" className="h-24 bg-muted/30 rounded-[2.5rem] flex flex-col gap-2 border border-border/50 hover:bg-primary/10 transition-all group" onClick={() => handleInteractiveClick("Node Integrity")}>
                    <Zap className="w-6 h-6 text-accent group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden glass-card">
              <CardContent className="p-8 space-y-6">
                {[
                  { label: "Total Sessions", value: profile?.totalWorkouts || "0", icon: LayoutGrid, color: "text-blue-500" },
                  { label: "Athlete Since", value: "Feb 2025", icon: Calendar, color: "text-orange-500" },
                  { label: "Identity Hash", value: "Verified", icon: Shield, color: "text-primary" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-6 group cursor-pointer p-4 rounded-3xl hover:bg-white/10 transition-all" onClick={() => handleInteractiveClick(s.label)}>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-muted/50 dark:bg-muted/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <s.icon className={`w-8 h-8 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase text-muted-foreground leading-none mb-1.5 tracking-widest">{s.label}</p>
                      <p className="font-black text-2xl tracking-tight">{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[3.5rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-muted/10 p-12">
                <CardTitle className="flex items-center gap-4 text-3xl font-black uppercase italic tracking-tighter">
                  <Award className="w-10 h-10 text-primary" />
                  Unlocked Protocols
                </CardTitle>
                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-5 py-2 rounded-full tracking-widest">5 Active Badges</span>
              </CardHeader>
              <CardContent className="p-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {ACHIEVEMENTS.map((a) => (
                    <div 
                      key={a.id} 
                      className="flex flex-col items-center text-center group cursor-pointer p-6 rounded-[3rem] transition-all bg-primary/5 hover:bg-primary/10 hover:-translate-y-2 border border-primary/10 shadow-sm"
                      onClick={() => toast({ title: a.title, description: a.desc })}
                    >
                      <div className="w-24 h-24 rounded-[2rem] mb-5 flex items-center justify-center text-5xl bg-white dark:bg-card border-2 border-primary/20 shadow-xl group-hover:scale-110 transition-transform">
                        {a.icon}
                      </div>
                      <p className="text-[10px] font-black uppercase leading-tight tracking-[0.2em] mb-1.5">{a.title}</p>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">Activated</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3.5rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="bg-muted/10 border-b border-border/10 p-10">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Athlete Settings & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                  {[
                    { label: "Global Visibility", value: "Public", icon: Globe },
                    { label: "Biometric Protocol", value: "Active", icon: Smartphone },
                    { label: "On-Chain Privacy", value: "End-to-End", icon: Lock }
                  ].map((s, i) => (
                    <div key={i} onClick={() => setSettingsOpen(true)} className="flex items-center justify-between p-12 hover:bg-primary/5 cursor-pointer transition-all group">
                      <div className="flex items-center gap-8">
                        <div className="w-14 h-14 bg-muted/50 rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <s.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-all" />
                        </div>
                        <span className="font-black text-xl uppercase tracking-tighter">{s.label}</span>
                      </div>
                      <Badge className="h-10 px-6 rounded-full font-black uppercase text-[10px] tracking-widest">{s.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Identity Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[3.5rem] max-w-md p-10 border-none glass-card shadow-2xl overflow-hidden focus:outline-none">
          <DialogHeader className="mb-10">
            <DialogTitle className="font-headline font-black uppercase text-4xl italic tracking-tighter">Edit Identity</DialogTitle>
            <p className="text-muted-foreground text-sm font-medium mt-2">Modify your name and visual ledger presence.</p>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest ml-1">Athlete Name</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="Enter your name..."
                className="rounded-3xl h-16 border-2 focus:border-primary bg-white/50 dark:bg-black/50 px-6 font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="avatar" className="text-[10px] font-black uppercase tracking-widest ml-1">Avatar Ledger URL (Optional)</Label>
              <Input 
                id="avatar" 
                value={formData.avatarUrl} 
                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-3xl h-16 border-2 focus:border-primary bg-white/50 dark:bg-black/50 px-6 font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="banner" className="text-[10px] font-black uppercase tracking-widest ml-1">Banner Texture URL (Optional)</Label>
              <Input 
                id="banner" 
                value={formData.bannerUrl} 
                onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-3xl h-16 border-2 focus:border-primary bg-white/50 dark:bg-black/50 px-6 font-bold"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-20 rounded-[2rem] font-black uppercase text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-6 border-b-8 border-black/20 bg-primary text-white hover:bg-primary/90">
              Commit Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-[4rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
          <div className="p-12 space-y-12 bg-gradient-to-br from-secondary/50 to-background">
            <DialogHeader>
              <DialogTitle className="font-headline font-black uppercase text-5xl italic tracking-tighter flex items-center gap-6">
                <Settings className="w-12 h-12 text-primary" />
                Athlete Protocol
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium mt-2">Reconfigure your physical/digital athlete preferences.</p>
            </DialogHeader>

            <div className="space-y-10 pb-6">
              <div className="space-y-10 bg-white/50 dark:bg-black/40 p-12 rounded-[3.5rem] shadow-sm border-2 border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="font-black text-lg uppercase tracking-tight">Public Presence</p>
                    <p className="text-xs text-muted-foreground">Visible in global leaderboard sync.</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => toast({ title: "Settings Updated", description: "Global visibility reconfigured." })} />
                </div>
                <Separator className="bg-border/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="font-black text-lg uppercase tracking-tight">Metabolic Alerts</p>
                    <p className="text-xs text-muted-foreground">Maintain your 48h streak integrity.</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => toast({ title: "Settings Updated", description: "Daily prompts enabled." })} />
                </div>
                <Separator className="bg-border/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="font-black text-lg uppercase tracking-tight">Biometric Vault</p>
                    <p className="text-xs text-muted-foreground">Secure local identity storage.</p>
                  </div>
                  <Switch onCheckedChange={() => toast({ title: "Security Protocol", description: "Biometric verification active." })} />
                </div>
              </div>

              <div className="bg-primary/5 rounded-[2.5rem] p-8 border-2 border-primary/20 flex items-start gap-6">
                <Shield className="w-10 h-10 text-primary shrink-0" />
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Protocol Assurance</p>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">Your performance data is encrypted and distributed across the decentralized hardware mesh for maximum integrity.</p>
                </div>
              </div>

              <Button onClick={() => setSettingsOpen(false)} className="w-full h-20 rounded-[2rem] font-black uppercase text-2xl shadow-2xl shadow-primary/30 bg-primary active:scale-95 transition-all">
                Update Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}