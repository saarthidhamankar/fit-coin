"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, Flame, Dumbbell, History, Sparkles, Calendar as CalendarIcon, Info, Tag } from "lucide-react";
import { getBalance } from "@/blockchain";
import WorkoutModal from "@/components/modals/WorkoutModal";
import { motion } from "framer-motion";
import { generateMotivation, GenerateMotivationOutput } from "@/ai/flows/generate-motivation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import CountUp from "@/components/CountUp";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ totalWorkouts: 0, currentStreak: 0, monthlyProgress: 0, weeklyTokens: 0 });
  const [motivation, setMotivation] = useState<GenerateMotivationOutput | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const { toast } = useToast();

  const activityQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "activityLogs"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [db, user?.uid]);

  const { data: activityLogs, isLoading: loadingLogs } = useCollection(activityQuery);

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      refreshData(addr);
    }
  }, [user]);

  const refreshData = async (addr: string) => {
    const bal = await getBalance(addr);
    setBalance(bal);

    const workouts = JSON.parse(localStorage.getItem(`fitcoin_history_${addr}`) || "[]");
    
    const total = workouts.length;
    const streak = total > 0 ? (total % 7 || 7) : 0; 
    const progress = Math.min((total / 30) * 100, 100);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyTokens = workouts
      .filter((w: any) => new Date(w.date) >= lastWeek)
      .reduce((acc: number, w: any) => acc + w.tokens, 0);

    setStats({ totalWorkouts: total, currentStreak: streak, monthlyProgress: progress, weeklyTokens });

    if (!motivation) {
      setLoadingMotivation(true);
      try {
        const result = await generateMotivation({
          workoutHistory: workouts.slice(0, 3).map((w: any) => ({
            date: w.date.split('T')[0],
            type: w.type,
            durationMinutes: w.duration,
            tokensEarned: w.tokens
          })),
          currentStreak: streak,
          totalWorkouts: total,
          totalTokensEarned: bal
        });
        setMotivation(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMotivation(false);
      }
    }
  };

  const handleStatClick = (label: string) => {
    toast({
      title: label,
      description: `Your fitness progress is synchronized with the FitCoin protocol.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-headline font-black uppercase italic">Earn Mode: <span className="text-primary not-italic">Active ⚡</span></h1>
            <p className="text-muted-foreground mt-1 font-medium">Tracking your gains on the FitCoin network.</p>
          </div>
          <div 
            onClick={() => handleStatClick("Wallet Info")}
            className="bg-white dark:bg-card p-4 rounded-[2rem] shadow-xl border-2 border-primary/20 flex items-center gap-4 hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Wallet className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">FIT Balance</p>
              <p className="text-2xl font-black text-primary">
                <CountUp value={balance} /> FIT
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Balance", value: balance, icon: Wallet, color: "text-primary", isCountUp: true },
            { label: "Streak", value: stats.currentStreak, suffix: " Days", icon: Flame, color: "text-orange-500", isCountUp: true },
            { label: "Workouts", value: stats.totalWorkouts, icon: Dumbbell, color: "text-blue-500", isCountUp: true },
            { label: "Weekly Tokens", value: stats.weeklyTokens, prefix: "+", icon: Sparkles, color: "text-accent", isCountUp: true }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleStatClick(stat.label)}
              className="cursor-pointer"
            >
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow group bg-white dark:bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-secondary mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-black">
                    <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-[2.5rem] p-8 md:p-12 border-2 border-white dark:border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <h2 className="text-4xl font-headline font-black leading-tight uppercase">Crush Your Next <span className="text-primary italic">Session</span></h2>
                  <p className="text-lg text-muted-foreground max-w-md font-medium">Log your gym time to earn FIT. Every minute counts towards your monthly streak!</p>
                  <div className="max-w-xs mx-auto md:mx-0">
                    <WorkoutModal 
                      onSuccess={() => address && refreshData(address)} 
                      userStats={stats} 
                    />
                  </div>
                </div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-48 bg-white dark:bg-card rounded-[2.5rem] shadow-2xl flex items-center justify-center border-4 border-primary/20"
                >
                  <Dumbbell className="w-24 h-24 text-primary" />
                </motion.div>
              </div>
            </motion.div>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg uppercase font-black">
                  <History className="w-5 h-5 text-primary" />
                  Live Activity Ledger
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toast({ title: "Ledger", description: "This ledger tracks all earnings and redemptions in real-time." })} className="text-[10px] font-black uppercase">
                  <Info className="w-3 h-3 mr-1" /> Help
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {loadingLogs ? (
                    <div className="p-12 space-y-4">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  ) : activityLogs && activityLogs.length > 0 ? (
                    activityLogs.map((h, i) => (
                      <motion.div 
                        key={h.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => toast({ title: h.activityType, description: h.description })}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary border border-primary/10 uppercase">
                            {h.activityType[0]}
                          </div>
                          <div>
                            <p className="font-black text-foreground">{h.description}</p>
                            <p className="text-xs text-muted-foreground font-medium">{format(new Date(h.timestamp), 'MMMM do, h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-lg ${h.fitCoinsChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            {h.fitCoinsChange >= 0 ? '+' : ''}{h.fitCoinsChange} FIT
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground space-y-2">
                      <Sparkles className="w-8 h-8 mx-auto opacity-20" />
                      <p className="font-bold uppercase text-xs tracking-widest">No activity found. Start earning today!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary to-accent text-white overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg uppercase font-black">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  AI Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                {loadingMotivation ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full bg-white/20 rounded-2xl" />
                    <Skeleton className="h-10 w-full bg-white/20 rounded-2xl" />
                  </div>
                ) : motivation ? (
                  <>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <p className="text-sm leading-relaxed font-bold italic">"{motivation.motivationalMessage}"</p>
                    </div>
                    {motivation.promoCode && (
                      <div className="p-4 bg-accent/20 backdrop-blur-sm rounded-2xl border-2 border-accent border-dashed flex flex-col items-center gap-2 animate-in zoom-in-95 duration-500">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-foreground">Achievement Reward Unlocked!</p>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-accent" />
                          <span className="text-xl font-black tracking-tighter uppercase">{motivation.promoCode}</span>
                        </div>
                        <p className="text-[8px] opacity-70">Use this code in the Reward Vault.</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Suggested for today:</p>
                      {motivation.workoutSuggestions.map((s: string, i: number) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 5 }}
                          onClick={() => toast({ title: "New Goal", description: `Target: ${s}` })}
                          className="p-3 bg-white/20 rounded-xl text-xs font-black border border-white/10 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          {s}
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-80 font-bold">Log a session to unlock your personal AI coaching companion!</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  Weekly Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-7 gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${i < stats.currentStreak ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-muted text-muted-foreground'}`}>
                        {i < stats.currentStreak ? '✓' : ''}
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                
                <div 
                  className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 cursor-pointer group hover:bg-primary/10 transition-colors"
                  onClick={() => toast({ title: "Monthly Goal", description: `You've completed ${Math.round(stats.monthlyProgress)}% of the monthly 30-session challenge!` })}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black uppercase text-muted-foreground">30-Day Score</span>
                    <span className="text-xs font-black text-primary bg-white px-2 py-0.5 rounded-full border border-primary/20">
                      {Math.round(stats.monthlyProgress)}%
                    </span>
                  </div>
                  <Progress value={stats.monthlyProgress} className="h-3 rounded-full bg-muted" />
                  <p className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-tight">Complete 30 sessions for <span className="text-primary">+250 FIT</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
