"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, Flame, Dumbbell, History, Sparkles, Calendar as CalendarIcon, Info, Tag, BarChart3, ChevronRight, Activity, ShieldCheck, Zap } from "lucide-react";
import { getBalance, penalizeUser } from "@/blockchain";
import WorkoutModal from "@/components/modals/WorkoutModal";
import { motion, AnimatePresence } from "framer-motion";
import { generateMotivation, GenerateMotivationOutput } from "@/ai/flows/generate-motivation";
import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "@/components/CountUp";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, addDoc, getDocs } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { REWARD_RULES, WEEKLY_PLANS } from "@/lib/workout-rules";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ totalWorkouts: 0, currentStreak: 0, monthlyProgress: 0, goal: "MuscleGain" as "MuscleGain" | "FatLoss" });
  const [motivation, setMotivation] = useState<GenerateMotivationOutput | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const workoutQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "workouts"),
      orderBy("date", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: workouts } = useCollection(workoutQuery);

  const chartData = useMemoFirebase(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({ day, duration: 0 }));
    
    if (workouts) {
      workouts.forEach(w => {
        const date = new Date(w.date);
        const dayIdx = (date.getDay() + 6) % 7;
        data[dayIdx].duration += w.durationMinutes;
      });
    }
    return data;
  }, [workouts]);

  const checkStreakIntegrity = async (addr: string, currentProfile: any) => {
    if (!currentProfile?.lastWorkoutDate || currentProfile.currentDailyStreak === 0) return;

    const lastWorkout = new Date(currentProfile.lastWorkoutDate);
    const now = new Date();
    const diffHours = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) {
      const penalty = REWARD_RULES.PENALTIES.STREAK_BREAK;
      
      toast({
        variant: "destructive",
        title: "Protocol Violation: Streak Broken",
        description: `Metabolic tax applied: -${penalty} FIT tokens.`,
      });

      const newBalance = await penalizeUser(addr, penalty);
      setBalance(newBalance);

      if (user?.uid && db) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
          currentDailyStreak: 0,
          totalFitCoinsSpent: (currentProfile.totalFitCoinsSpent || 0) + penalty
        });

        const logRef = collection(db, "users", user.uid, "activityLogs");
        addDoc(logRef, {
          userId: user.uid,
          activityType: "STREAK_BREAK",
          description: `Penalty for breaking streak (>48h)`,
          fitCoinsChange: -penalty,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      refreshData(addr);
    }
  }, [user, profile]);

  const refreshData = async (addr: string) => {
    const bal = await getBalance(addr);
    setBalance(bal);

    if (profile) {
      await checkStreakIntegrity(addr, profile);
      const total = profile.totalWorkouts || 0;
      const streak = profile.currentDailyStreak || 0;
      setStats(prev => ({ ...prev, totalWorkouts: total, currentStreak: streak, monthlyProgress: Math.min((total / 30) * 100, 100) }));

      if (!motivation && !loadingMotivation) {
        setLoadingMotivation(true);
        generateMotivation({
          workoutHistory: workouts?.slice(0, 3).map((w: any) => ({
            date: w.date.split('T')[0],
            type: w.type,
            durationMinutes: w.durationMinutes,
            tokensEarned: w.fitCoinsEarnedTotal
          })),
          currentStreak: streak,
          totalWorkouts: total,
          totalTokensEarned: bal
        }).then(setMotivation).catch(() => {
          // Fallback if AI quota exceeded
          const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }) as keyof typeof WEEKLY_PLANS.MuscleGain;
          setMotivation({
            motivationalMessage: "Protocol update: Consistency is the only path to the blockchain high-ground.",
            workoutSuggestions: [WEEKLY_PLANS[stats.goal][today] || "Intense Cardio Session"],
            promoCode: streak > 5 ? "GRIND7" : undefined
          });
        }).finally(() => setLoadingMotivation(false));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-headline font-black uppercase italic tracking-tighter">Earn Mode: <span className="text-primary not-italic">Active ⚡</span></h1>
            <p className="text-muted-foreground mt-1 font-medium">Tracking metabolic effort on the FitCoin ledger.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-card p-4 rounded-[2rem] shadow-xl border-2 border-primary/20 flex items-center gap-4 hover:scale-105 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Wallet className="w-6 h-6 text-primary group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">FIT Balance</p>
                <p className="text-2xl font-black text-primary">
                  <CountUp value={balance} /> FIT
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Assets", value: balance, icon: Wallet, color: "text-primary" },
            { label: "Streak", value: stats.currentStreak, suffix: " Days", icon: Flame, color: "text-orange-500" },
            { label: "Grinds", value: stats.totalWorkouts, icon: Dumbbell, color: "text-blue-500" },
            { label: "Goal", value: Math.round(stats.monthlyProgress), suffix: "%", icon: Zap, color: "text-accent" }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden hover:shadow-md transition-all group bg-white dark:bg-card border-2 border-transparent hover:border-primary/20">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-secondary mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-black">
                    <CountUp value={stat.value} suffix={stat.suffix} />
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
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-[2.5rem] p-8 md:p-12 border-2 border-white dark:border-white/5 relative overflow-hidden group shadow-2xl"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <h2 className="text-4xl font-headline font-black leading-tight uppercase">Commit Your Next <span className="text-primary italic">Rep</span></h2>
                  <p className="text-lg text-muted-foreground max-w-md font-medium">Log your effort to mint FIT. Every minute counts. 48-hour inactivity triggers the metabolic tax.</p>
                  <div className="max-w-xs mx-auto md:mx-0">
                    <WorkoutModal 
                      onSuccess={() => address && refreshData(address)} 
                      userStats={stats} 
                    />
                  </div>
                </div>
                <div className="hidden md:flex w-48 h-48 bg-white dark:bg-card rounded-[2.5rem] shadow-2xl p-6 border-4 border-primary/20 items-center justify-center flex-col text-center">
                  <Activity className="w-12 h-12 text-primary mb-2 animate-pulse" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Pulse Sync</p>
                  <p className="text-xl font-black text-primary uppercase">Protocol Online</p>
                  <div className="mt-4 flex gap-1">
                    {[1,2,3,4].map(i => <div key={i} className="w-1 h-4 bg-primary/20 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}} />)}
                  </div>
                </div>
              </div>
            </motion.div>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg uppercase font-black">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Proof of Sweat Distribution
                </CardTitle>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={() => setStats(prev => ({...prev, goal: "FatLoss"}))} className={`text-[8px] font-black uppercase rounded-full ${stats.goal === 'FatLoss' ? 'bg-primary text-white' : ''}`}>Fat Loss</Button>
                   <Button variant="ghost" size="sm" onClick={() => setStats(prev => ({...prev, goal: "MuscleGain"}))} className={`text-[8px] font-black uppercase rounded-full ${stats.goal === 'MuscleGain' ? 'bg-primary text-white' : ''}`}>Gain</Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border-2 border-primary/20 p-3 rounded-2xl shadow-xl">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{payload[0].payload.day}</p>
                              <p className="text-xl font-black text-primary">{payload[0].value} <span className="text-xs">mins</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.duration > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary to-accent text-white overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CardHeader className="relative z-10 pb-0">
                <CardTitle className="flex items-center gap-2 text-lg uppercase font-black">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  AI Daily Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10 pt-4">
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
                      <div className="p-3 bg-yellow-400 text-black rounded-xl border-2 border-white/50 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-black uppercase">Protocol Bonus Unlocked</p>
                          <p className="text-sm font-black tracking-widest">{motivation.promoCode}</p>
                        </div>
                        <Tag className="w-5 h-5" />
                      </div>
                    )}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Today's Exercises:</p>
                      {motivation.workoutSuggestions.map((s: string, i: number) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 5 }}
                          className="p-3 bg-white/20 rounded-xl text-xs font-black border border-white/10 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-white" />
                             {s}
                          </div>
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-80 font-bold">Synchronize a session to unlock your daily AI protocol.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  Consistency Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-7 gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                    const hasWorkout = chartData[i]?.duration > 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${hasWorkout ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-muted text-muted-foreground'}`}>
                          {hasWorkout ? '✓' : ''}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground">{day}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black uppercase text-muted-foreground">Monthly Protocol</span>
                    <span className="text-xs font-black text-primary bg-white px-2 py-0.5 rounded-full border border-primary/20">
                      {Math.round(stats.monthlyProgress)}%
                    </span>
                  </div>
                  <Progress value={stats.monthlyProgress} className="h-3 rounded-full bg-muted" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                   <ShieldCheck className="w-4 h-4 text-primary" />
                   <p className="text-[8px] font-black uppercase text-muted-foreground">Admin verified ledger sync active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
