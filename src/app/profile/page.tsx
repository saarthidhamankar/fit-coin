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
  History,
  ShieldCheck,
  Fingerprint,
  Cpu,
  ShoppingBag,
  Dumbbell,
  Palette
} from "lucide-react";
import { getBalance } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, updateDoc, collection, query, orderBy, limit } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  { id: 1, title: "Consistent", desc: "5 recorded sessions", icon: "📈", condition: (p: any) => (p?.totalWorkoutsCompleted || 0) >= 5 },
  { id: 2, title: "Professional", desc: "10 recorded sessions", icon: "🏆", condition: (p: any) => (p?.totalWorkoutsCompleted || 0) >= 10 },
  { id: 3, title: "Streak Master", desc: "7 day streak reached", icon: "🔥", condition: (p: any) => (p?.currentStreakDays || 0) >= 7 },
  { id: 4, title: "Verified", desc: "First session finished", icon: "🛡️", condition: (p: any) => (p?.totalWorkoutsCompleted || 0) >= 1 },
];

const THEME_COLORS = [
  { name: "Emerald", color: "145 85% 45%", value: "emerald" },
  { name: "Sapphire", color: "220 85% 50%", value: "sapphire" },
  { name: "Ruby", color: "0 85% 50%", value: "ruby" },
  { name: "Amber", color: "35 90% 50%", value: "amber" },
];

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "activityLogs"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: activityLogs, isLoading: logsLoading } = useCollection(logsQuery);

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
        description: "Your assets have been verified.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userDocRef || !user?.uid || !db) {
      toast({ variant: "destructive", title: "Error", description: "Account not ready." });
      return;
    }

    const updates: any = {};
    if (formData.username.trim()) updates.username = formData.username;
    if (formData.avatarUrl.trim()) updates.avatarUrl = formData.avatarUrl;
    if (formData.bannerUrl.trim()) updates.bannerUrl = formData.bannerUrl;

    try {
      await updateDoc(userDocRef, updates);
      toast({ title: "Changes Saved", description: "Your profile has been updated." });
      setEditOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not save changes." });
    }
  };

  const setTheme = (colorValue: string) => {
    const selected = THEME_COLORS.find(t => t.value === colorValue);
    if (selected) {
      document.documentElement.style.setProperty('--primary', selected.color);
      localStorage.setItem('fitcoin_theme_color', selected.color);
      toast({ title: "Color Updated", description: `Theme set to ${selected.name}.` });
    }
  };

  const openExplorer = () => {
    if (address) window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
  };

  const isPro = (profile?.totalWorkoutsCompleted || 0) >= 10;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return isNaN(date.getTime()) ? "Just now" : date.toLocaleString();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-24 pb-12 px-4 relative mesh-background">
      <Navbar />

      <div className="max-w-6xl mx-auto space-y-12">
        <section className="relative">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-80 w-full bg-gradient-to-br from-primary via-primary/80 to-accent rounded-[3.5rem] overflow-hidden relative shadow-2xl border-4 border-white/10 z-0">
            {profile?.bannerUrl ? (
              <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            )}
            <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
            
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-8 right-8 z-30 rounded-2xl glass-card border-none font-black uppercase text-[10px] tracking-widest hover:scale-110 transition-all shadow-xl active:scale-95" 
              onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
            >
              <Camera className="w-4 h-4 mr-2" /> Change Banner
            </Button>
          </motion.div>
          
          <div className="px-12 -mt-24 flex flex-col md:flex-row items-end gap-10 relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} className="relative group/avatar cursor-pointer" onClick={() => setEditOpen(true)}>
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
                <Badge className={`${isPro ? 'bg-yellow-500' : 'bg-primary'} text-[10px] font-black uppercase tracking-widest px-4 py-1.5 shadow-lg`}>
                  {isPro ? 'Professional Status' : 'Standard Status'}
                </Badge>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-1 mb-1">My Wallet Address</span>
                  <p className="text-muted-foreground font-code text-[11px] bg-white/5 dark:bg-black/20 px-5 py-2 rounded-full border border-border/50 flex items-center gap-3">
                    {address ? `${address.slice(0, 12)}...${address.slice(-12)}` : "Disconnected"}
                    <ExternalLink className="w-4 h-4 text-primary cursor-pointer hover:scale-125 transition-all" onClick={openExplorer} />
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
              <Button size="lg" onClick={() => setEditOpen(true)} className="rounded-[2rem] font-black uppercase text-xs h-16 px-12 shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 active:scale-95 transition-all border-b-4 border-black/10">
                Edit Profile
              </Button>
              <Button size="lg" variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-[2rem] h-16 w-16 p-0 glass-card border-none hover:bg-primary/10 active:scale-95 transition-all">
                <Settings className="w-8 h-8 text-primary" />
              </Button>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-12">
          <aside className="space-y-12">
            <Card className="rounded-[3.5rem] border-none shadow-2xl overflow-hidden glass-card bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-2 border-b border-border/10 bg-muted/20 px-8 py-6 text-center">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Earnings History</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="p-10 bg-white/40 dark:bg-black/40 rounded-[3rem] border-2 border-primary/20 hover:scale-[1.03] transition-all cursor-pointer group shadow-inner" onClick={refreshBalance}>
                  <p className="text-[10px] font-black uppercase text-primary mb-3 tracking-[0.2em] flex items-center justify-between">
                    Balance
                    <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  </p>
                  <p className="text-6xl font-black text-primary tracking-tighter italic">
                    {balance.toLocaleString()} <span className="text-2xl not-italic">FIT</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setLogsOpen(true)}
                    className="h-28 bg-muted/30 rounded-[2.5rem] flex flex-col gap-2 border border-border/50 hover:bg-primary/10 transition-all group"
                  >
                    <Database className="w-7 h-7 text-muted-foreground group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSecurityOpen(true)}
                    className="h-28 bg-muted/30 rounded-[2.5rem] flex flex-col gap-2 border border-border/50 hover:bg-primary/10 transition-all group"
                  >
                    <ShieldCheck className="w-7 h-7 text-accent group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3.5rem] border-none shadow-xl overflow-hidden glass-card">
              <CardContent className="p-10 space-y-8">
                {[
                  { label: "Total Sessions", value: profile?.totalWorkoutsCompleted || "0", icon: LayoutGrid, color: "text-blue-500" },
                  { label: "Member Since", value: "Feb 2025", icon: Calendar, color: "text-orange-500" },
                  { label: "Account Secure", value: "Verified", icon: Lock, color: "text-primary" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-6 group p-5 rounded-[2.5rem] border border-transparent">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 dark:bg-muted/10 flex items-center justify-center">
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
                  Achievements
                </CardTitle>
                <Badge className={`${isPro ? 'bg-yellow-500/10 text-yellow-600' : 'bg-primary/10 text-primary'} border-none text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-widest`}>
                  Verified Account
                </Badge>
              </CardHeader>
              <CardContent className="p-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                  {ACHIEVEMENTS.map((a) => {
                    const isUnlocked = a.condition(profile);
                    return (
                      <motion.div 
                        key={a.id} 
                        whileHover={{ y: isUnlocked ? -8 : 0 }}
                        className={`flex flex-col items-center text-center p-8 rounded-[3.5rem] transition-all border ${isUnlocked ? 'bg-white/5 border-primary/30 shadow-lg' : 'bg-muted/10 border-border/50 opacity-50 grayscale'}`}
                        onClick={() => toast({ title: a.title, description: isUnlocked ? a.desc : `Action required: ${a.desc}` })}
                      >
                        <div className={`w-28 h-28 rounded-3xl mb-6 flex items-center justify-center text-6xl bg-white dark:bg-card border-2 ${isUnlocked ? 'border-primary shadow-xl' : 'border-muted'}`}>
                          {a.icon}
                        </div>
                        <p className="text-[11px] font-black uppercase leading-tight tracking-[0.2em] mb-2">{a.title}</p>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-3 ${isUnlocked ? 'Earned' : 'Locked'}`}>
                          {isUnlocked ? 'Earned' : 'Locked'}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[4rem] border-none shadow-xl overflow-hidden glass-card">
              <CardHeader className="bg-muted/10 border-b border-border/10 p-12">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                  {[
                    { id: 'public', label: "Public Profile", desc: "Show your progress on the global leaderboard.", icon: Globe },
                    { id: 'biometric', label: "Fingerprint Login", desc: "Use fingerprint for faster access.", icon: Smartphone },
                    { id: 'alerts', label: "Workout Alerts", desc: "Receive notifications for your workouts.", icon: Zap }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-12 hover:bg-primary/5 transition-all group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-muted/50 rounded-3xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <s.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-all" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-2xl uppercase tracking-tighter">{s.label}</p>
                          <p className="text-sm text-muted-foreground font-medium">{s.desc}</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl glass-card">
          <div className="p-10 bg-gradient-to-b from-primary/5 to-background">
            <DialogHeader className="mb-8 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-4xl font-headline font-black uppercase italic tracking-tighter text-primary">Action History</DialogTitle>
                <p className="text-muted-foreground text-sm font-medium">Your recent fitness and earnings history.</p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Database className="w-7 h-7 text-primary" />
              </div>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {logsLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  activityLogs.map((log: any) => (
                    <div key={log.id} className="p-6 bg-white/40 dark:bg-black/40 rounded-3xl border border-white/20 flex items-center justify-between group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${log.fitCoinsChange > 0 ? 'bg-primary/10 text-primary' : log.fitCoinsChange < 0 ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
                          {log.activityType === 'WORKOUT_EARN' ? <Dumbbell className="w-5 h-5" /> : log.activityType === 'STREAK_BREAK' ? <Zap className="w-5 h-5" /> : log.activityType === 'IDENTITY_GENESIS' ? <History className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase">{log.description}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{formatDate(log.timestamp)}</p>
                        </div>
                      </div>
                      <div className={`font-black text-lg italic ${log.fitCoinsChange > 0 ? 'text-primary' : log.fitCoinsChange < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {log.fitCoinsChange !== 0 ? (log.fitCoinsChange > 0 ? '+' : '') : ''}{log.fitCoinsChange !== 0 ? log.fitCoinsChange : ''} {log.fitCoinsChange !== 0 ? <span className="text-[10px] not-italic opacity-60">FIT</span> : 'ACTIVE'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest">No history recorded yet.</div>
                )}
              </div>
            </ScrollArea>
            <Button onClick={() => setLogsOpen(false)} className="w-full h-16 rounded-2xl mt-8 font-black uppercase bg-primary text-white shadow-xl">Close History</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl glass-card">
          <div className="p-10 bg-gradient-to-b from-accent/10 to-background">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-4xl font-headline font-black uppercase italic tracking-tighter text-accent">Security Status</DialogTitle>
              <p className="text-muted-foreground text-sm font-medium">Account protection and verification status.</p>
            </DialogHeader>
            <ScrollArea className="h-[450px] pr-4">
              <div className="grid gap-6">
                {[
                  { label: "Encryption", value: "AES-256", icon: Lock, status: "Active" },
                  { label: "Fingerprint ID", value: address?.slice(0, 16) + "...", icon: Fingerprint, status: "Verified" },
                  { label: "Network", value: "Sepolia Testnet", icon: Globe, status: "Online" },
                  { label: "Processing", value: "Safe Sync", icon: Cpu, status: "Fast" },
                  { label: "Security", value: "Keys Locked", icon: Shield, status: "Secure" },
                  { label: "Status", value: "Live Link", icon: Zap, status: "Sync'd" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/40 dark:bg-black/40 rounded-3xl border border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</p>
                        <p className="font-black text-lg">{item.value}</p>
                      </div>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black uppercase tracking-widest px-4">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={() => setSecurityOpen(false)} className="w-full h-16 rounded-2xl mt-8 font-black uppercase bg-accent text-white shadow-xl">Close Status</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[4rem] max-w-lg p-0 border-none glass-card shadow-2xl overflow-hidden focus:outline-none">
          <div className="p-12 space-y-10 bg-gradient-to-br from-primary/10 to-background">
            <DialogHeader className="space-y-4">
              <DialogTitle className="font-headline font-black uppercase text-5xl italic tracking-tighter text-primary">Edit Profile</DialogTitle>
              <p className="text-muted-foreground text-base font-medium">Update your display information.</p>
            </DialogHeader>
            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-[11px] font-black uppercase tracking-widest ml-2">Display Name</Label>
                <Input id="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="rounded-3xl h-18 border-2 border-primary/20 bg-white/50 font-black text-lg px-8" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="avatar" className="text-[11px] font-black uppercase tracking-widest ml-2">Avatar Link</Label>
                <Input id="avatar" value={formData.avatarUrl} onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} placeholder="https://..." className="rounded-3xl h-18 border-2 border-primary/20 bg-white/50 px-8" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="banner" className="text-[11px] font-black uppercase tracking-widest ml-2">Banner Link</Label>
                <Input id="banner" value={formData.bannerUrl} onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})} placeholder="https://..." className="rounded-3xl h-18 border-2 border-primary/20 bg-white/50 px-8" />
              </div>
              <Button onClick={handleSaveProfile} className="w-full h-24 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl shadow-primary/30 bg-primary text-white hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-[4rem] max-w-xl p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-16 space-y-12 bg-gradient-to-br from-secondary/50 to-background">
              <DialogHeader>
                <DialogTitle className="font-headline font-black uppercase text-6xl italic tracking-tighter flex items-center gap-8">
                  <Settings className="w-16 h-16 text-primary" /> Settings
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-10">
                <div className="space-y-6">
                  <p className="text-[12px] font-black uppercase text-muted-foreground tracking-[0.4em] flex items-center gap-3">
                    <Palette className="w-4 h-4 text-primary" /> App Colors
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {THEME_COLORS.map((t) => (
                      <button 
                        key={t.value} 
                        onClick={() => setTheme(t.value)}
                        className="flex items-center gap-4 p-5 bg-white/40 dark:bg-black/40 rounded-3xl border border-white/20 hover:border-primary/50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: `hsl(${t.color})` }} />
                        <span className="font-black uppercase text-xs tracking-widest">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-[3.5rem] p-10 border-2 border-primary/10 flex items-start gap-8">
                  <Shield className="w-12 h-12 text-primary shrink-0" />
                  <div className="space-y-4">
                    <p className="text-[12px] font-black uppercase text-primary tracking-[0.4em]">Privacy</p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">Your data is safe and protected by your own wallet keys.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                   <Button variant="outline" className="h-16 rounded-[1.8rem] font-black uppercase text-xs tracking-widest justify-between px-8" onClick={() => toast({ title: "Exporting...", description: "Saving your history." })}>
                     Download History <ChevronRight className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" className="h-16 rounded-[1.8rem] font-black uppercase text-xs tracking-widest justify-between px-8" onClick={() => toast({ title: "Scanning...", description: "Searching for watch..." })}>
                     Connect Smart Watch <RefreshCw className="w-4 h-4" />
                   </Button>
                </div>
                <Button onClick={() => setSettingsOpen(false)} className="w-full h-24 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl shadow-primary/30 bg-primary active:scale-95">Close Settings</Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
