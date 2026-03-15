"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Lock, ExternalLink, Award, Milestone, Calendar, Camera, Edit2, Bell, Smartphone, Globe, Ruler, CheckCircle2, Zap, LayoutGrid, Database, RefreshCw } from "lucide-react";
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
  { id: 6, title: "Century Club", desc: "100 workouts", icon: "💯", unlocked: false },
  { id: 7, title: "Gym Legend", desc: "Rank #1 weekly", icon: "🥇", unlocked: false },
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
        description: "Your physical identity has been successfully synchronized to the athlete ledger.",
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

  const handleSettingChange = (label: string) => {
    toast({ 
      title: "Protocol Updated", 
      description: `${label} has been reconfigured for your profile.` 
    });
  };

  const handleInteractiveClick = (label: string) => {
    toast({
      title: "Interactive Ledger",
      description: `Accessing ${label} protocol. Verification in progress...`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-24 pb-12 px-4 relative overflow-hidden"
    >
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner Section */}
        <div className="relative group">
          <div className="h-64 w-full bg-gradient-to-r from-primary to-accent rounded-[3rem] overflow-hidden relative shadow-2xl">
            {profile?.bannerUrl ? (
              <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-6 right-6 rounded-2xl glass-card border-none font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform"
              onClick={() => setEditOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" /> Update Cover
            </Button>
          </div>
          
          <div className="px-10 -mt-24 flex flex-col md:flex-row md:items-end gap-8 relative z-10">
            <div className="relative group/avatar">
              <Avatar className="w-44 h-44 border-[12px] border-background shadow-2xl transition-transform group-hover/avatar:scale-105">
                <AvatarImage src={profile?.avatarUrl || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                <AvatarFallback className="bg-primary text-white text-5xl font-black">A</AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity border-[12px] border-transparent"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-2xl border-[6px] border-background flex items-center justify-center text-white shadow-xl">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-headline font-black uppercase italic tracking-tighter">
                  {profile?.username || "Athlete"}
                </h1>
                <Badge className="bg-primary text-[10px] font-black uppercase tracking-widest px-3 py-1">Verified Pro</Badge>
              </div>
              <p className="text-muted-foreground font-code text-xs flex items-center gap-2 mt-3 bg-white/5 dark:bg-black/20 w-fit px-4 py-1.5 rounded-full border border-border/50">
                {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : "Not Connected"}
                <ExternalLink className="w-3.5 h-3.5 text-primary cursor-pointer hover:scale-110 transition-all" onClick={() => handleInteractiveClick("Explorer Sync")} />
              </p>
            </div>
            
            <div className="flex gap-4 mb-6">
              <Button size="lg" onClick={() => setEditOpen(true)} className="rounded-2xl font-black uppercase text-xs h-16 px-10 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 active:scale-95 transition-all">
                Edit Identity
              </Button>
              <Button size="lg" variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-2xl h-16 w-16 p-0 glass-card border-none active:scale-95 transition-all hover:bg-primary/10">
                <Settings className="w-7 h-7 text-primary" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="pb-2 border-b border-border/10 bg-muted/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">FIT Ledger Sync</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="p-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2.5rem] border-2 border-primary/20 hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => handleInteractiveClick("Balance Sync")}>
                  <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest flex items-center justify-between">
                    Liquid Assets
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  </p>
                  <p className="text-5xl font-black text-primary tracking-tighter">{balance.toLocaleString()} <span className="text-xl">FIT</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="ghost" className="h-20 bg-muted/30 rounded-3xl flex flex-col gap-1 border border-border/50 hover:bg-primary/10 transition-colors" onClick={() => handleInteractiveClick("Global Ledger")}>
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                  </Button>
                  <Button variant="ghost" className="h-20 bg-muted/30 rounded-3xl flex flex-col gap-1 border border-border/50 hover:bg-primary/10 transition-colors" onClick={() => handleInteractiveClick("Node Status")}>
                    <Zap className="w-5 h-5 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden glass-card">
              <CardContent className="p-8 space-y-6">
                {[
                  { label: "Sessions", value: profile?.totalWorkouts || "0", icon: LayoutGrid, color: "text-blue-500" },
                  { label: "Joined", value: "Feb 2025", icon: Calendar, color: "text-orange-500" },
                  { label: "Badges", value: "5/12", icon: Award, color: "text-yellow-500" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-5 group cursor-pointer p-4 rounded-3xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10" onClick={() => handleInteractiveClick(s.label)}>
                    <div className={`w-14 h-14 rounded-2xl bg-muted/50 dark:bg-muted/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <s.icon className={`w-7 h-7 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1.5 tracking-widest">{s.label}</p>
                      <p className="font-black text-xl tracking-tight">{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[3.5rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-muted/10 p-10">
                <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <Award className="w-8 h-8 text-primary" />
                  Hall of Badges
                </CardTitle>
                <span className="text-xs font-black uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full tracking-widest">5 Protocols Unlocked</span>
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {ACHIEVEMENTS.map((a) => (
                    <div 
                      key={a.id} 
                      className={`flex flex-col items-center text-center group cursor-help p-5 rounded-[2.5rem] transition-all ${!a.unlocked ? 'grayscale opacity-30 bg-muted/10' : 'bg-primary/5 hover:bg-primary/10 hover:-translate-y-2 shadow-sm border border-primary/10'}`}
                      onClick={() => toast({ title: a.title, description: a.desc })}
                    >
                      <div className={`w-24 h-24 rounded-[2.5rem] mb-4 flex items-center justify-center text-5xl transition-transform group-hover:scale-110 ${a.unlocked ? 'bg-white dark:bg-card border-2 border-primary/20 shadow-xl' : 'bg-muted/50'}`}>
                        {a.icon}
                      </div>
                      <p className="text-[10px] font-black uppercase leading-tight tracking-[0.2em] mb-1.5">{a.title}</p>
                      <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-widest">{a.unlocked ? 'Activated' : 'Locked'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3.5rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="bg-muted/10 border-b border-border/10 p-8">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Identity Verification</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                  {[
                    { label: "Protocol Visibility", value: "Public Athlete", icon: Globe },
                    { label: "Biometric Auth", value: "Enabled", icon: Smartphone },
                    { label: "Data Integrity", value: "Immutable", icon: Lock }
                  ].map((s, i) => (
                    <div key={i} onClick={() => setSettingsOpen(true)} className="flex items-center justify-between p-10 hover:bg-primary/5 cursor-pointer transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <s.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all" />
                        </div>
                        <span className="font-black text-lg uppercase tracking-tighter">{s.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-5 py-2.5 rounded-full uppercase border border-primary/20 tracking-widest">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Identity Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[3rem] max-w-md p-10 border-none glass-card shadow-2xl overflow-hidden">
          <DialogHeader className="mb-8">
            <DialogTitle className="font-headline font-black uppercase text-3xl italic tracking-tighter">Edit Identity</DialogTitle>
            <p className="text-muted-foreground text-sm font-medium">Update your alias or appearance on the ledger.</p>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest ml-1">Athlete Alias</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="New handle..."
                className="rounded-2xl h-16 border-2 focus:border-primary bg-white/50 dark:bg-black/50"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="avatar" className="text-[10px] font-black uppercase tracking-widest ml-1">Avatar Ledger URL (Optional)</Label>
              <Input 
                id="avatar" 
                value={formData.avatarUrl} 
                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-2xl h-16 border-2 focus:border-primary bg-white/50 dark:bg-black/50"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="banner" className="text-[10px] font-black uppercase tracking-widest ml-1">Banner Texture URL (Optional)</Label>
              <Input 
                id="banner" 
                value={formData.bannerUrl} 
                onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-2xl h-16 border-2 focus:border-primary bg-white/50 dark:bg-black/50"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-20 rounded-3xl font-black uppercase text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4 border-b-8 border-black/20">
              Commit Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-[3.5rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-10 space-y-10 bg-gradient-to-br from-secondary/50 to-background">
            <DialogHeader>
              <DialogTitle className="font-headline font-black uppercase text-4xl italic tracking-tighter flex items-center gap-4">
                <Settings className="w-10 h-10 text-primary" />
                Athlete Settings
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium">Reconfigure your physical/digital protocol preferences.</p>
            </DialogHeader>

            <div className="space-y-10 pb-6">
              <div className="space-y-8 bg-white/50 dark:bg-black/40 p-10 rounded-[3rem] shadow-sm border-2 border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="font-black text-sm uppercase tracking-tight">Public Athlete Status</p>
                    <p className="text-xs text-muted-foreground">Visible in global performance charts.</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleSettingChange("Visibility")} />
                </div>
                <Separator className="bg-border/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="font-black text-sm uppercase tracking-tight">Metabolic Prompts</p>
                    <p className="text-xs text-muted-foreground">Daily alerts to maintain streak integrity.</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleSettingChange("Notifications")} />
                </div>
                <Separator className="bg-border/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="font-black text-sm uppercase tracking-tight">Biometric Sync</p>
                    <p className="text-xs text-muted-foreground">Secure local athlete vault.</p>
                  </div>
                  <Switch onCheckedChange={() => handleSettingChange("Biometrics")} />
                </div>
              </div>

              <div className="bg-primary/5 rounded-[2.5rem] p-8 border-2 border-primary/20 flex items-start gap-5">
                <Shield className="w-8 h-8 text-primary shrink-0" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Protocol Assurance</p>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">Your performance data is encrypted and distributed across the decentralized hardware mesh.</p>
                </div>
              </div>

              <Button onClick={() => setSettingsOpen(false)} className="w-full h-20 rounded-3xl font-black uppercase text-xl shadow-2xl shadow-primary/30 bg-primary active:scale-95 transition-all">
                Update Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}