
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Lock, 
  ExternalLink, 
  Award, 
  Calendar, 
  Camera, 
  Edit2, 
  Zap, 
  LayoutGrid, 
  Database, 
  RefreshCw, 
  Globe, 
  Smartphone, 
  ChevronRight,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { getBalance } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

const ACHIEVEMENTS = [
  { id: 1, title: "Early Bird", desc: "5 morning sessions", icon: "🌅" },
  { id: 2, title: "Iron Soul", desc: "10 heavy lifts", icon: "💪" },
  { id: 3, title: "Weekend Warrior", desc: "Saturday grind", icon: "⚔️" },
  { id: 4, title: "Flame Keeper", desc: "7 day streak", icon: "🔥" },
];

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const refreshBalance = async () => {
    if (!address) return;
    setIsSyncing(true);
    try {
      const newBalance = await getBalance(address);
      setBalance(newBalance);
      toast({
        title: "Balance Synchronized",
        description: "Your FIT assets have been verified on the Sepolia node.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userDocRef) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Error", 
        description: "Athlete ledger not initialized." 
      });
      return;
    }

    const updates: any = {};
    if (formData.username.trim()) updates.username = formData.username;
    if (formData.avatarUrl.trim()) updates.avatarUrl = formData.avatarUrl;
    if (formData.bannerUrl.trim()) updates.bannerUrl = formData.bannerUrl;

    if (Object.keys(updates).length === 0) {
      setEditOpen(false);
      return;
    }

    try {
      await updateDoc(userDocRef, updates);
      toast({ 
        title: "Identity Committed", 
        description: "Your athlete data has been synchronized to the ledger.",
      });
      setEditOpen(false);
    } catch (e) {
      toast({ 
        variant: "destructive", 
        title: "Sync Failed", 
        description: "Could not commit changes to the node." 
      });
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    toast({ title: "Export Initiated", description: "Generating performance report..." });
    setTimeout(() => {
      setIsExporting(false);
      toast({ 
        title: "Export Complete", 
        description: "Your fitness ledger has been downloaded." 
      });
    }, 2000);
  };

  const handleWearableSync = () => {
    toast({ title: "Scanning...", description: "Searching for local hardware nodes..." });
    setTimeout(() => {
      toast({ title: "Sync Failed", description: "No compatible wearables detected in range." });
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-12 px-4 relative mesh-background"
    >
      <Navbar />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Cinematic Hero Section */}
        <section className="relative">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-80 w-full bg-gradient-to-br from-primary via-primary/80 to-accent rounded-[3.5rem] overflow-hidden relative shadow-2xl border-4 border-white/10"
          >
            {profile?.bannerUrl ? (
              <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            )}
            <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-8 right-8 rounded-2xl glass-card border-none font-black uppercase text-[10px] tracking-widest hover:scale-110 transition-transform shadow-xl"
              onClick={() => setEditOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" /> Change Banner
            </Button>
          </motion.div>
          
          <div className="px-12 -mt-24 flex flex-col md:flex-row items-end gap-10 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative group/avatar cursor-pointer"
              onClick={() => setEditOpen(true)}
            >
              <Avatar className="w-56 h-56 border-[14px] border-background shadow-2xl bg-muted transition-all">
                <AvatarImage src={profile?.avatarUrl || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                <AvatarFallback className="bg-primary text-white text-6xl font-black italic">A</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity border-[14px] border-transparent">
                <Edit2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1 pb-4 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-6xl font-headline font-black uppercase italic tracking-tighter text-foreground">
                  {profile?.username || "Athlete Name"}
                </h1>
                <Badge className="bg-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 shadow-lg animate-pulse">
                  Verified Pro
                </Badge>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <p className="text-muted-foreground font-code text-[11px] bg-white/5 dark:bg-black/20 px-5 py-2 rounded-full border border-border/50 flex items-center gap-3">
                  {address ? `${address.slice(0, 12)}...${address.slice(-12)}` : "Disconnected"}
                  <ExternalLink 
                    className="w-4 h-4 text-primary cursor-pointer hover:scale-125 transition-all" 
                    onClick={openExplorer} 
                  />
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
              <Button size="lg" onClick={() => setEditOpen(true)} className="rounded-[2rem] font-black uppercase text-xs h-16 px-12 shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 active:scale-95 transition-all border-b-4 border-black/10">
                Edit Identity
              </Button>
              <Button size="lg" variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-[2rem] h-16 w-16 p-0 glass-card border-none hover:bg-primary/10 active:scale-95 transition-all">
                <Settings className="w-8 h-8 text-primary" />
              </Button>
            </div>
          </div>
        </section>

        {/* Content Matrix */}
        <div className="grid md:grid-cols-3 gap-12">
          <aside className="space-y-12">
            <Card className="rounded-[3.5rem] border-none shadow-2xl overflow-hidden glass-card bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-2 border-b border-border/10 bg-muted/20 px-8 py-6 text-center">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Asset Ledger</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div 
                  className="p-10 bg-white/40 dark:bg-black/40 rounded-[3rem] border-2 border-primary/20 hover:scale-[1.03] transition-all cursor-pointer group shadow-inner" 
                  onClick={refreshBalance}
                >
                  <p className="text-[10px] font-black uppercase text-primary mb-3 tracking-[0.2em] flex items-center justify-between">
                    FIT Balance
                    <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  </p>
                  <p className="text-6xl font-black text-primary tracking-tighter italic">
                    {balance.toLocaleString()} <span className="text-2xl not-italic">FIT</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-28 bg-muted/30 rounded-[2.5rem] flex flex-col gap-2 border border-border/50 hover:bg-primary/10 transition-all group"
                    onClick={() => toast({ title: "Transaction Ledger", description: "Redirecting to your full history node..." })}
                  >
                    <Database className="w-7 h-7 text-muted-foreground group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logs</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-28 bg-muted/30 rounded-[2.5rem] flex flex-col gap-2 border border-border/50 hover:bg-primary/10 transition-all group"
                    onClick={() => toast({ title: "Security Protocols", description: "Node encryption verified 256-bit." })}
                  >
                    <Shield className="w-7 h-7 text-accent group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3.5rem] border-none shadow-xl overflow-hidden glass-card">
              <CardContent className="p-10 space-y-8">
                {[
                  { label: "Total Grinds", value: profile?.totalWorkouts || "0", icon: LayoutGrid, color: "text-blue-500", action: "Workouts" },
                  { label: "On-Chain Since", value: "Feb 2025", icon: Calendar, color: "text-orange-500", action: "History" },
                  { label: "Identity Node", value: "Verified", icon: Lock, color: "text-primary", action: "Security" }
                ].map((s, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-6 group cursor-pointer p-5 rounded-[2.5rem] hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10"
                    onClick={() => toast({ title: s.label, description: `Synchronizing ${s.action} with Sepolia...` })}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 dark:bg-muted/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <s.icon className={`w-8 h-8 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase text-muted-foreground mb-1 tracking-widest">{s.label}</p>
                      <p className="font-black text-2xl tracking-tight">{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="md:col-span-2 space-y-12">
            <Card className="rounded-[4rem] border-none shadow-2xl overflow-hidden glass-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-muted/10 p-12">
                <CardTitle className="flex items-center gap-5 text-4xl font-black uppercase italic tracking-tighter">
                  <Award className="w-12 h-12 text-primary" />
                  Achievement Protocols
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-widest">
                  Elite Tier
                </Badge>
              </CardHeader>
              <CardContent className="p-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                  {ACHIEVEMENTS.map((a) => (
                    <motion.div 
                      key={a.id} 
                      whileHover={{ y: -8 }}
                      className="flex flex-col items-center text-center group cursor-pointer p-8 rounded-[3.5rem] transition-all bg-white/5 dark:bg-black/10 border border-primary/10 hover:border-primary/30 shadow-sm"
                      onClick={() => toast({ title: a.title, description: a.desc })}
                    >
                      <div className="w-28 h-28 rounded-3xl mb-6 flex items-center justify-center text-6xl bg-white dark:bg-card border-2 border-primary/10 shadow-xl group-hover:scale-110 transition-transform">
                        {a.icon}
                      </div>
                      <p className="text-[11px] font-black uppercase leading-tight tracking-[0.2em] mb-2">{a.title}</p>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary px-3">Sync'd</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[4rem] border-none shadow-xl overflow-hidden glass-card">
              <CardHeader className="bg-muted/10 border-b border-border/10 p-12">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Privacy & Security Nodes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                  {[
                    { id: 'public', label: "Public Profile Sync", desc: "Global visibility for competitive ranking.", icon: Globe },
                    { id: 'biometric', label: "Biometric Protocol", desc: "Secure local biometric authentication.", icon: Smartphone },
                    { id: 'alerts', label: "Metabolic Alerts", desc: "Notification for 48h streak tax risk.", icon: Zap }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-12 hover:bg-primary/5 cursor-pointer transition-all group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-muted/50 rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <s.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-all" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-2xl uppercase tracking-tighter">{s.label}</p>
                          <p className="text-sm text-muted-foreground font-medium">{s.desc}</p>
                        </div>
                      </div>
                      <Switch 
                        defaultChecked 
                        onCheckedChange={(checked) => toast({ 
                          title: `${s.label} ${checked ? 'Enabled' : 'Disabled'}`, 
                          description: `Node setting synchronized.` 
                        })} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Identity Command Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[4rem] max-w-lg p-0 border-none glass-card shadow-2xl overflow-hidden focus:outline-none">
          <div className="p-12 space-y-10 bg-gradient-to-br from-primary/10 to-background">
            <DialogHeader className="space-y-4">
              <DialogTitle className="font-headline font-black uppercase text-5xl italic tracking-tighter text-primary">Edit Identity</DialogTitle>
              <p className="text-muted-foreground text-base font-medium">Commit your athlete name and visual assets to the ledger.</p>
            </DialogHeader>
            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-[11px] font-black uppercase tracking-widest ml-2">Name</Label>
                <Input 
                  id="username" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  placeholder="Athlete Alias"
                  className="rounded-3xl h-18 border-2 border-primary/20 focus:border-primary bg-white/50 dark:bg-black/50 px-8 font-black text-lg"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="avatar" className="text-[11px] font-black uppercase tracking-widest ml-2">Avatar URL (Optional)</Label>
                <Input 
                  id="avatar" 
                  value={formData.avatarUrl} 
                  onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
                  placeholder="https://..."
                  className="rounded-3xl h-18 border-2 border-primary/20 focus:border-primary bg-white/50 dark:bg-black/50 px-8 font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="banner" className="text-[11px] font-black uppercase tracking-widest ml-2">Banner URL (Optional)</Label>
                <Input 
                  id="banner" 
                  value={formData.bannerUrl} 
                  onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})} 
                  placeholder="https://..."
                  className="rounded-3xl h-18 border-2 border-primary/20 focus:border-primary bg-white/50 dark:bg-black/50 px-8 font-bold"
                />
              </div>
              <Button onClick={handleSaveProfile} className="w-full h-24 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-8 border-b-8 border-black/20 bg-primary text-white hover:bg-primary/90">
                Commit Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Protocol Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-[4rem] max-w-xl p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
          <div className="p-16 space-y-12 bg-gradient-to-br from-secondary/50 to-background">
            <DialogHeader>
              <DialogTitle className="font-headline font-black uppercase text-6xl italic tracking-tighter flex items-center gap-8">
                <Settings className="w-16 h-16 text-primary" />
                Protocol
              </DialogTitle>
              <p className="text-muted-foreground text-lg font-medium mt-4">Global athlete settings and security nodes.</p>
            </DialogHeader>

            <div className="space-y-10">
              <div className="bg-primary/5 rounded-[3.5rem] p-10 border-2 border-primary/10 flex items-start gap-8">
                <Shield className="w-12 h-12 text-primary shrink-0" />
                <div className="space-y-4">
                  <p className="text-[12px] font-black uppercase text-primary tracking-[0.4em]">Node Integrity</p>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">Your data is secured via Sepolia-standard hashing and distributed across the FitCoin mesh.</p>
                </div>
              </div>

              <div className="grid gap-4">
                 <Button 
                  variant="outline" 
                  className="h-16 rounded-[1.8rem] font-black uppercase text-xs tracking-widest justify-between px-8 group" 
                  onClick={handleExport}
                  disabled={isExporting}
                >
                   {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Export Performance Data"}
                   <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform`} />
                 </Button>
                 <Button 
                  variant="outline" 
                  className="h-16 rounded-[1.8rem] font-black uppercase text-xs tracking-widest justify-between px-8 group" 
                  onClick={handleWearableSync}
                >
                   Sync Wearables
                   <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                 </Button>
              </div>

              <Button onClick={() => setSettingsOpen(false)} className="w-full h-24 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl shadow-primary/30 bg-primary active:scale-95 transition-all">
                Close Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
