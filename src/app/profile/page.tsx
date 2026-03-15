
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Shield, Lock, ExternalLink, Award, Milestone, Calendar, Camera, Edit2 } from "lucide-react";
import { getBalance } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
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
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        username: formData.username,
        avatarUrl: formData.avatarUrl,
        bannerUrl: formData.bannerUrl
      });
      toast({ title: "Profile Updated", description: "Your changes have been saved to the ledger." });
      setEditOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not update profile." });
    }
  };

  const handleAction = (label: string) => {
    toast({ title: label, description: "Feature coming in next mainnet update." });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile */}
        <div className="relative">
          <div className="h-48 w-full bg-gradient-to-r from-primary to-accent rounded-3xl overflow-hidden relative">
            {formData.bannerUrl ? (
              <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            )}
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-4 right-4 rounded-xl opacity-70 hover:opacity-100"
              onClick={() => setEditOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" /> Change Cover
            </Button>
          </div>
          <div className="px-8 -mt-16 flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-card shadow-2xl transition-transform group-hover:scale-105">
                <AvatarImage src={formData.avatarUrl} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                onClick={() => setEditOpen(true)}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-card flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                {profile?.username || "My Account"}
                <Edit2 className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" onClick={() => setEditOpen(true)} />
              </h1>
              <p className="text-muted-foreground font-code text-xs flex items-center gap-2 mt-1">
                {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : "Wallet Not Connected"}
                {address && <ExternalLink className="w-3 h-3 cursor-pointer text-primary" />}
              </p>
            </div>
            <div className="flex gap-2 mb-2">
              <Button size="sm" onClick={() => setEditOpen(true)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10">Edit Profile</Button>
              <Button size="sm" variant="outline" onClick={() => handleAction("Settings")} className="rounded-xl h-10 w-10 p-0 bg-white dark:bg-card border-2">
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
                  { label: "Gym Sessions", value: profile?.totalWorkouts || "24", icon: Milestone },
                  { label: "Active Since", value: "Feb 2025", icon: Calendar },
                  { label: "On-Chain Bonus", value: "450 FIT", icon: Award }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 cursor-pointer hover:bg-muted/10 p-2 rounded-xl transition-colors" onClick={() => handleAction(s.label)}>
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
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ACHIEVEMENTS.map((a) => (
                    <div 
                      key={a.id} 
                      className={`flex flex-col items-center text-center group cursor-help p-3 rounded-2xl transition-all ${!a.unlocked ? 'grayscale opacity-20' : 'hover:bg-primary/5'}`}
                      onClick={() => toast({ title: a.title, description: a.desc })}
                    >
                      <div className={`w-16 h-16 rounded-3xl mb-2 flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${a.unlocked ? 'bg-primary/10 border-2 border-primary/20 shadow-lg' : 'bg-muted dark:bg-muted/10'}`}>
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
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Protocol Identity Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { label: "Account Visibility", value: "Athlete (Public)", icon: Shield },
                    { label: "Recovery Seed", value: "Biometric/Wallet", icon: Lock },
                    { label: "Sync Preferences", value: "Live On-Chain", icon: Settings }
                  ].map((s, i) => (
                    <div key={i} onClick={() => handleAction(s.label)} className="flex items-center justify-between p-6 hover:bg-muted/10 cursor-pointer transition-colors group">
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline font-black uppercase text-2xl">Edit My Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="How should we call you?"
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar Image URL</Label>
              <Input 
                id="avatar" 
                value={formData.avatarUrl} 
                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">Banner Image URL</Label>
              <Input 
                id="banner" 
                value={formData.bannerUrl} 
                onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})} 
                placeholder="https://..."
                className="rounded-xl h-12"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-14 rounded-xl font-black uppercase text-lg mt-4">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
