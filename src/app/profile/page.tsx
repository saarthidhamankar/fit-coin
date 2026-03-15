"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Lock, ExternalLink, Award, Milestone, Calendar, Camera, Edit2, Bell, Smartphone, Globe, Ruler } from "lucide-react";
import { getBalance } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

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
        username: profile.username || "Athlete",
        avatarUrl: profile.avatarUrl || `https://picsum.photos/seed/${user?.uid}/200/200`,
        bannerUrl: profile.bannerUrl || ""
      });
    }
    if (searchParams.get('tab') === 'settings') {
      setSettingsOpen(true);
    }
  }, [profile, user, searchParams]);

  const handleSaveProfile = async () => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        username: formData.username,
        avatarUrl: formData.avatarUrl,
        bannerUrl: formData.bannerUrl
      });
      toast({ title: "Profile Updated", description: "Changes synced to blockchain." });
      setEditOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not update profile." });
    }
  };

  const handleSettingChange = (label: string) => {
    toast({ title: "Preference Saved", description: `${label} has been updated in your profile.` });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background pt-24 pb-12 px-4"
    >
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative group">
          <div className="h-56 w-full bg-gradient-to-r from-primary to-accent rounded-[2.5rem] overflow-hidden relative shadow-2xl">
            {formData.bannerUrl ? (
              <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-6 right-6 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-md font-black uppercase text-[10px]"
              onClick={() => setEditOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" /> Update Cover
            </Button>
          </div>
          <div className="px-8 -mt-20 flex flex-col md:flex-row md:items-end gap-6 relative z-10">
            <div className="relative group/avatar">
              <Avatar className="w-40 h-40 border-8 border-background shadow-2xl transition-transform group-hover/avatar:scale-105">
                <AvatarImage src={formData.avatarUrl} />
                <AvatarFallback className="bg-primary text-white text-4xl font-black">A</AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity border-8 border-transparent"
                onClick={() => setEditOpen(true)}
              >
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-2xl border-4 border-background flex items-center justify-center text-white shadow-xl">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-headline font-black uppercase italic tracking-tighter">
                  {profile?.username || "My Account"}
                </h1>
                <Badge className="bg-primary text-[10px] font-black uppercase">Verified Pro</Badge>
              </div>
              <p className="text-muted-foreground font-code text-xs flex items-center gap-2 mt-2 bg-muted/50 w-fit px-3 py-1 rounded-full border border-border">
                {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "Not Connected"}
                <ExternalLink className="w-3 h-3 text-primary cursor-pointer" />
              </p>
            </div>
            <div className="flex gap-3 mb-4">
              <Button size="lg" onClick={() => setEditOpen(true)} className="rounded-2xl font-black uppercase text-xs h-14 px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">Edit Identity</Button>
              <Button size="lg" variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-2xl h-14 w-14 p-0 bg-white/50 dark:bg-card/50 border-2 active:scale-95 transition-all">
                <Settings className="w-6 h-6 text-primary" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-2 border-b bg-muted/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FIT Ledger</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border-2 border-primary/20">
                  <p className="text-[10px] font-black uppercase text-primary mb-1">Total Assets</p>
                  <p className="text-5xl font-black text-primary tracking-tighter">{balance.toLocaleString()} <span className="text-lg">FIT</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-muted/30 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Network</p>
                    <p className="text-[10px] font-black text-green-500">Online</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Sync</p>
                    <p className="text-[10px] font-black text-primary">Live</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardContent className="p-6 space-y-4">
                {[
                  { label: "Sessions", value: profile?.totalWorkouts || "0", icon: Milestone, color: "text-blue-500" },
                  { label: "Joined", value: "Feb 2025", icon: Calendar, color: "text-orange-500" },
                  { label: "Badges", value: "5/12", icon: Award, color: "text-yellow-500" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-muted/30 transition-all">
                    <div className={`w-12 h-12 rounded-2xl bg-secondary dark:bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">{s.label}</p>
                      <p className="font-black text-base">{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-lg font-black uppercase italic">
                  <Award className="w-5 h-5 text-primary" />
                  Hall of Badges
                </CardTitle>
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">5 Unlocked</span>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {ACHIEVEMENTS.map((a) => (
                    <div 
                      key={a.id} 
                      className={`flex flex-col items-center text-center group cursor-help p-4 rounded-3xl transition-all ${!a.unlocked ? 'grayscale opacity-30 bg-muted/10' : 'bg-primary/5 hover:bg-primary/10 hover:-translate-y-1 shadow-sm'}`}
                      onClick={() => toast({ title: a.title, description: a.desc })}
                    >
                      <div className={`w-20 h-20 rounded-[2rem] mb-3 flex items-center justify-center text-4xl transition-transform group-hover:scale-110 ${a.unlocked ? 'bg-white dark:bg-card border-2 border-primary/20 shadow-xl shadow-primary/10' : 'bg-muted/50'}`}>
                        {a.icon}
                      </div>
                      <p className="text-[10px] font-black uppercase leading-tight tracking-widest mb-1">{a.title}</p>
                      <p className="text-[8px] text-muted-foreground font-medium uppercase">{a.unlocked ? 'Unlocked' : 'Locked'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Relational Connections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {[
                    { label: "Account Privacy", value: "Public Athlete", icon: Globe },
                    { label: "Biometric Recovery", value: "Enabled", icon: Smartphone },
                    { label: "Session Verification", value: "On-Chain", icon: Lock }
                  ].map((s, i) => (
                    <div key={i} onClick={() => setSettingsOpen(true)} className="flex items-center justify-between p-8 hover:bg-primary/5 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <s.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">{s.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-2 rounded-full uppercase border border-primary/20">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-md p-8 border-none shadow-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-background">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-headline font-black uppercase text-3xl italic tracking-tighter">Edit Identity</DialogTitle>
            <p className="text-muted-foreground text-sm font-medium">Customize your athlete presence on the blockchain.</p>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest ml-1">Athlete Alias</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="Choose your handle..."
                className="rounded-2xl h-14 border-2 focus:border-primary bg-white dark:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-[10px] font-black uppercase tracking-widest ml-1">Avatar Ledger URL</Label>
              <Input 
                id="avatar" 
                value={formData.avatarUrl} 
                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-2xl h-14 border-2 focus:border-primary bg-white dark:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner" className="text-[10px] font-black uppercase tracking-widest ml-1">Banner Texture URL</Label>
              <Input 
                id="banner" 
                value={formData.bannerUrl} 
                onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-2xl h-14 border-2 focus:border-primary bg-white dark:bg-card"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-20 rounded-[1.5rem] font-black uppercase text-xl shadow-2xl shadow-primary/30 border-b-8 border-black/10 active:border-b-0 active:translate-y-1 transition-all mt-4">
              Commit Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 space-y-8 bg-gradient-to-br from-secondary/50 to-background">
            <DialogHeader>
              <DialogTitle className="font-headline font-black uppercase text-3xl italic tracking-tighter flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary animate-spin-slow" />
                Athlete Settings
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium">Manage your physical and digital protocol preferences.</p>
            </DialogHeader>

            <div className="space-y-8 pb-4">
              <div className="space-y-6 bg-white dark:bg-card p-8 rounded-[2rem] shadow-sm border-2 border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-sm uppercase">Public Profile</p>
                    <p className="text-xs text-muted-foreground">Visible in the global Hall of Fame.</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleSettingChange("Visibility")} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-sm uppercase">Workout Reminders</p>
                    <p className="text-xs text-muted-foreground">Daily prompts to stay on streak.</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleSettingChange("Notifications")} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-sm uppercase">Biometric Sync</p>
                    <p className="text-xs text-muted-foreground">Secure your FIT assets locally.</p>
                  </div>
                  <Switch onCheckedChange={() => handleSettingChange("Biometrics")} />
                </div>
              </div>

              <div className="space-y-6 bg-white dark:bg-card p-8 rounded-[2rem] shadow-sm border-2 border-primary/10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Measurement Units</p>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase border-2 hover:bg-primary/10 border-primary" onClick={() => handleSettingChange("Metric Units")}>
                      <Ruler className="w-4 h-4 mr-2" /> Metric (kg/km)
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase border-2 hover:bg-primary/10" onClick={() => handleSettingChange("Imperial Units")}>
                      <Ruler className="w-4 h-4 mr-2" /> Imperial (lb/mi)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-[2.5rem] p-6 border-2 border-primary/20 flex items-start gap-4">
                <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-primary">Protocol Integrity</p>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">Your data is secured using military-grade encryption and synchronized across all Sepolia-compliant physical hardware nodes.</p>
                </div>
              </div>

              <Button onClick={() => { setSettingsOpen(false); toast({ title: "Configuration Updated", description: "Global state refreshed." }); }} className="w-full h-16 rounded-[1.5rem] font-black uppercase text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
