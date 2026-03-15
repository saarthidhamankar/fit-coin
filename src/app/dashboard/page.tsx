
"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Wallet, 
  Flame, 
  Dumbbell, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Tag, 
  ChevronRight, 
  AlertTriangle, 
  Target,
  ShieldCheck,
  Zap
} from "lucide-react";
import { getBalance, penalizeUser } from "@/blockchain";
import WorkoutModal from "@/components/modals/WorkoutModal";
import { motion } from "framer-motion";
import { generateMotivation, GenerateMotivationOutput } from "@/ai/flows/generate-motivation";
import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "@/components/CountUp";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, addDoc } from "firebase/firestore";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { REWARD_RULES, WEEKLY_PLANS } from "@/lib/workout-rules";
import { cn } from "@/lib/utils";
import { startOfWeek, eachDayOfInterval, endOfWeek, isSameDay, startOfDay } from "date-fns";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ totalWorkouts: 0, currentStreak: 0, monthlyProgress: 0, goal: "MuscleGain" as "MuscleGain" | "FatLoss" });
  const [motivation, setMotivation] = useState<GenerateMotivationOutput | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const [matrixDelays, setMatrixDelays] = useState<number[]>([]);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const workoutQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "workoutSessions"),
      orderBy("startTime", "desc"),
      limit(100) 
    );
  }, [db, user?.uid]);

  const { data: workouts, isLoading: workoutsLoading } = useCollection(workoutQuery);

  const chartData = useMemo(() => {
    const today = new Date();
    // Sunday start (weekStartsOn: 0) to ensure Sunday and Monday show together
    const start = startOfWeek(today, { weekStartsOn: 0 });
    const end = endOfWeek(today, { weekStartsOn: 0 });
    const daysInterval = eachDayOfInterval({ start, end });

    const data = daysInterval.map(date => ({
      date: startOfDay(date),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      duration: 0,
      tokens: 0,
      intensity: 0
    }));
    
    if (workouts) {
      workouts.forEach(w => {
        const workoutDate = w.startTime?.toDate ? w.startTime.toDate() : new Date(w.startTime || w.date || Date.now());
        const dayIdx = data.findIndex(d => isSameDay(d.date, workoutDate));
        
        if (dayIdx !== -1) {
          data[dayIdx].duration += w.durationMinutes || 0;
          data[dayIdx].tokens += w.totalTokensEarned || 0;
          data[dayIdx].intensity += ((w.durationMinutes || 1) * (w.totalTokensEarned || 1)) / 100;
        }
      });
    }
    return data;
  }, [workouts]);

  const radarData = useMemo(() => {
    const totalTokens = chartData.reduce((acc, d) => acc + d.tokens, 0);
    const totalDuration = chartData.reduce((acc, d) => acc + d.duration, 0);
    const intensityDays = chartData.filter(d => d.intensity > 0).length || 1;
    const avgIntensity = chartData.reduce((acc, d) => acc + d.intensity, 0) / intensityDays;
    
    // Aggressive scaling targets: 20 tokens, 60 mins per week
    return [
      { subject: 'Tokens', A: Math.min((totalTokens / 20) * 100, 100), fullMark: 100 },
      { subject: 'Time', A: Math.min((totalDuration / 60) * 100, 100), fullMark: 100 },
      { subject: 'Effort', A: Math.min(avgIntensity * 50, 100), fullMark: 100 },
      { subject: 'Streak', A: Math.min(((stats.currentStreak || (workouts?.length ? 1 : 0)) / 7) * 100, 100), fullMark: 100 },
      { subject: 'Goal', A: Math.min(stats.monthlyProgress || ((workouts?.length || 0) / 10) * 100, 100), fullMark: 100 },
    ];
  }, [chartData, stats, workouts]);

  const checkStreakIntegrity = async (addr: string, currentProfile: any) => {
    if (!currentProfile?.lastWorkoutDate || currentProfile.currentStreakDays === 0) return;

    const lastWorkout = new Date(currentProfile.lastWorkoutDate);
    const now = new Date();
    const diffHours = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) {
      const penalty = REWARD_RULES.PENALTIES.STREAK_BREAK;
      
      toast({
        variant: "destructive",
        title: "Streak Warning!",
        description: `Deduction applied for inactivity: -${penalty} FIT tokens.`,
      });

      const newBalance = await penalizeUser(addr, penalty);
      setBalance(newBalance);

      if (user?.uid && db) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
          currentStreakDays: 0,
          totalFitEarned: (currentProfile.totalFitEarned || 0) - penalty
        });

        const logRef = collection(db, "users", user.uid, "activityLogs");
        addDoc(logRef, {
          userId: user.uid,
          activityType: "STREAK_BREAK",
          description: `Penalty for missing workout (>48h)`,
          fitCoinsChange: -penalty,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  useEffect(() => {
    setMatrixDelays(Array.from({ length: 64 }, () => Math.random() * 2));
    
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      refreshData(addr);
    }
  }, [user, profile, workouts]);

  const refreshData = async (addr: string) => {
    const bal = await getBalance(addr);
    setBalance(bal);

    if (profile) {
      await checkStreakIntegrity(addr, profile);
      const total = profile.totalWorkoutsCompleted || 0;
      const streak = profile.currentStreakDays || 0;
      setStats(prev => ({ 
        ...prev, 
        totalWorkouts: total, 
        currentStreak: streak, 
        monthlyProgress: Math.min((total / 30) * 100, 100) 
      }));

      if (!motivation && !loadingMotivation) {
        setLoadingMotivation(true);
        generateMotivation({
          workoutHistory: workouts?.slice(0, 3).map((w: any) => ({
            date: (w.startTime || w.date)?.split?.('T')?.[0] || new Date().toISOString().split('T')[0],
            type: w.workoutType || w.type,
            durationMinutes: w.durationMinutes,
            tokensEarned: w.totalTokensEarned
          })),
          currentStreak: streak,
          totalWorkouts: total,
          totalTokensEarned: bal
        }).then(setMotivation).catch(() => {
          const todayString = new Date().toLocaleDateString('en-US', { weekday: 'short' }) as keyof typeof WEEKLY_PLANS.MuscleGain;
          setMotivation({
            motivationalMessage: "Stay focused: Consistency is the best way to see results.",
            workoutSuggestions: [WEEKLY_PLANS[stats.goal][todayString] || "Daily Workout Session"],
            promoCode: streak > 5 ? "KEEPGOING" : undefined
          });
        }).finally(() => setLoadingMotivation(false));
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative mesh-background overflow-hidden">
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-headline font-black uppercase italic tracking-tighter text-foreground">Earn Mode: <span className="text-primary not-italic">On ⚡</span></h1>
            <p className="text-muted-foreground mt-1 font-medium tracking-tight">Your verified fitness history on the network.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/40 dark:bg-card/40 backdrop-blur-md p-4 rounded-[2rem] shadow-xl border border-white/20 dark:border-white/5 flex items-center gap-4 hover:scale-105 transition-all cursor-pointer group" onClick={() => toast({ title: "My FIT Balance", description: "Your tokens are safe and secure." })}>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Wallet className="w-6 h-6 text-primary group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">My FIT Balance</p>
                <p className="text-2xl font-black text-primary">
                  <CountUp value={balance} /> FIT
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "My FIT Total", value: balance, icon: Wallet, color: "text-primary" },
            { label: "Day Streak", value: stats.currentStreak, suffix: " Days", icon: Flame, color: "text-primary" },
            { label: "Total Workouts", value: stats.totalWorkouts, icon: Dumbbell, color: "text-primary" },
            { label: "Monthly Goal", value: Math.round(stats.monthlyProgress), suffix: "%", icon: Zap, color: "text-primary" }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden hover:shadow-md transition-all group glass-card hover:border-primary/20 cursor-help" onClick={() => toast({ title: stat.label, description: `Current status: ${stat.value}${stat.suffix || ''}` })}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-secondary mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
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
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-[3rem] p-10 md:p-14 border-2 border-white/20 relative overflow-hidden group shadow-2xl glass-card"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8 text-center md:text-left">
                  <h2 className="text-5xl font-headline font-black leading-tight uppercase text-foreground">Log Your Next <span className="text-primary italic">Workout</span></h2>
                  <p className="text-lg text-muted-foreground max-w-md font-medium tracking-tight">Save your workout to earn FIT tokens. Every session counts. Don't miss more than 2 days to keep your streak alive!</p>
                  <div className="max-w-xs mx-auto md:mx-0">
                    <WorkoutModal 
                      onSuccess={() => address && refreshData(address)} 
                      userStats={stats} 
                    />
                  </div>
                </div>
                <div className="hidden md:flex w-64 h-64 bg-white/20 dark:bg-card/40 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 border-4 border-primary/20 items-center justify-center flex-col text-center group cursor-pointer" onClick={() => toast({ title: "Live Sync", description: "Your workout history is updating." })}>
                  <div className="grid grid-cols-8 gap-1.5 w-full mb-6">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-2 w-2 bg-primary/20 rounded-full animate-matrix-dot" 
                        style={{ animationDelay: matrixDelays[i] ? `${matrixDelays[i]}s` : '0s' }} 
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Live Sync</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-primary italic">UPDATING</span>
                    <Badge className="bg-primary/20 text-primary border-none text-[8px] tracking-widest animate-pulse">ACTIVE</Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="bg-muted/30 border-b border-border/10 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-3 text-xl uppercase font-black italic tracking-tighter text-foreground">
                      <Target className="w-6 h-6 text-primary" />
                      Weekly Fitness Balance
                    </CardTitle>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-9">How you're doing this week</p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/20 px-4 py-1 text-[9px] font-black uppercase tracking-widest text-primary">Live Update</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-10 h-[400px] flex items-center justify-center">
                {workoutsLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Syncing Results...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="hsl(var(--muted))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Weekly Stats"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-card border-2 border-primary/20 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                                <p className="text-[10px] font-black uppercase text-primary mb-1">{payload[0].payload.subject}</p>
                                <p className="text-2xl font-black">{Math.round(payload[0].value as number)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CardHeader className="relative z-10 pb-2 p-8">
                <CardTitle className="flex items-center gap-3 text-xl uppercase font-black italic tracking-tighter">
                  <Sparkles className="w-6 h-6 animate-pulse text-white/80" />
                  Fitness Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10 p-8 pt-4">
                {loadingMotivation ? (
                  <div className="space-y-6">
                    <Skeleton className="h-28 w-full bg-white/20 rounded-3xl" />
                    <Skeleton className="h-12 w-full bg-white/20 rounded-2xl" />
                  </div>
                ) : motivation ? (
                  <>
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-inner">
                      <p className="text-base leading-relaxed font-bold italic tracking-tight">"{motivation.motivationalMessage}"</p>
                    </div>
                    {motivation.promoCode && (
                      <div className="p-4 bg-white/20 text-white rounded-2xl border-2 border-white/50 flex items-center justify-between shadow-xl backdrop-blur-md">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Bonus Code</p>
                          <p className="text-lg font-black tracking-widest">{motivation.promoCode}</p>
                        </div>
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 ml-1">Today's Plan:</p>
                      {motivation.workoutSuggestions.map((s: string, i: number) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 8 }}
                          onClick={() => toast({ title: "Workout Details", description: s })}
                          className="p-4 bg-white/20 rounded-2xl text-xs font-black border border-white/10 flex items-center justify-between cursor-pointer transition-all hover:bg-white/30"
                        >
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                             {s}
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-80 font-bold tracking-tight">Save a workout to see your daily fitness plan.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden glass-card">
              <CardHeader className="pb-4 p-8">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  Weekly Workout Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8 pt-2">
                <div className="grid grid-cols-7 gap-3">
                  {chartData.map((d, i) => {
                    const isToday = isSameDay(d.date, new Date());
                    const hasWorkout = d.duration > 0 || d.tokens > 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <motion.div 
                          whileHover={{ scale: 1.15 }}
                          className={cn(
                            "w-12 h-12 flex items-center justify-center transition-all relative group",
                            isToday && !hasWorkout && "ring-4 ring-primary/20 rounded-2xl"
                          )}
                        >
                          {hasWorkout ? (
                            <Avatar className="w-12 h-12 border-2 border-primary shadow-xl shadow-primary/30 scale-110">
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 via-primary to-accent relative overflow-visible">
                                <Flame className="w-6 h-6 text-white fill-white animate-pulse" />
                                <span className="absolute -top-3 -right-3 text-xl filter drop-shadow-md animate-bounce">🔥</span>
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center bg-muted/50 border border-muted",
                              isToday && "border-primary/40 bg-primary/5"
                            )}>
                              {isToday && (
                                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                              )}
                            </div>
                          )}
                          
                          {isToday && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
                          )}
                        </motion.div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isToday ? "text-primary scale-110 font-black" : "text-muted-foreground opacity-60"
                        )}>{d.day[0]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 bg-destructive/10 rounded-2xl border border-destructive/20 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest">Streak Warning: Don't miss a day!</p>
                    <p className="text-[11px] font-medium leading-tight text-destructive/80">
                      Missing your workout for more than 2 days will cost you -20 FIT tokens. Stay consistent to keep your earnings!
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Progress</span>
                    </div>
                    <span className="text-[11px] font-black text-primary bg-white dark:bg-card px-3 py-1 rounded-full border border-primary/20 tracking-widest">
                      {Math.round(stats.monthlyProgress)}%
                    </span>
                  </div>
                  <Progress value={stats.monthlyProgress} className="h-4 rounded-full bg-muted/30" />
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => toast({ title: "Safe Connection", description: "Your workout data is saved on the secure network." })}>
                   <ShieldCheck className="w-5 h-5 text-primary" />
                   <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-tight">Securely Saving Progress to the Network</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
