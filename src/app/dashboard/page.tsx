
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
  AlertTriangle, 
  Target,
  ShieldCheck,
  Zap,
  Activity,
  History as HistoryIcon
} from "lucide-react";
import { getBalance } from "@/blockchain";
import WorkoutModal from "@/components/modals/WorkoutModal";
import { motion } from "framer-motion";
import { generateMotivation, GenerateMotivationOutput } from "@/ai/flows/generate-motivation";
import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "@/components/CountUp";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { WEEKLY_PLANS } from "@/lib/workout-rules";
import { cn } from "@/lib/utils";
import { startOfWeek, eachDayOfInterval, endOfWeek, isSameDay, startOfDay } from "date-fns";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [motivation, setMotivation] = useState<GenerateMotivationOutput | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const [todayDate, setTodayDate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setTodayDate(new Date());
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) setAddress(addr);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const workoutQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "workoutSessions"),
      orderBy("timestamp", "desc"),
      limit(50) 
    );
  }, [db, user?.uid]);

  const { data: workouts, isLoading: workoutsLoading } = useCollection(workoutQuery);

  const chartData = useMemo(() => {
    if (!isClient || !todayDate) return [];
    
    // START ON SUNDAY (weekStartsOn: 0)
    const start = startOfWeek(todayDate, { weekStartsOn: 0 });
    const end = endOfWeek(todayDate, { weekStartsOn: 0 });
    const daysInterval = eachDayOfInterval({ start, end });

    const data = daysInterval.map(date => ({
      date: startOfDay(date),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      duration: 0,
      tokens: 0,
      effort: 0
    }));
    
    if (workouts) {
      workouts.forEach(w => {
        // Use startTime fallback for immediate Sunday/Monday streak detection
        const workoutDate = w.timestamp?.toDate ? w.timestamp.toDate() : new Date(w.startTime || w.date || Date.now());
        const dayIdx = data.findIndex(d => isSameDay(d.date, workoutDate));
        
        if (dayIdx !== -1) {
          data[dayIdx].duration += w.durationMinutes || 0;
          data[dayIdx].tokens += w.totalTokensEarned || 0;
          data[dayIdx].effort += ((w.durationMinutes || 1) * (w.totalTokensEarned || 1)) / 100;
        }
      });
    }
    return data;
  }, [workouts, todayDate, isClient]);

  const radarData = useMemo(() => {
    const totalTokens = chartData.reduce((acc, d) => acc + d.tokens, 0);
    const totalDuration = chartData.reduce((acc, d) => acc + d.duration, 0);
    const effortDays = chartData.filter(d => d.effort > 0).length || 1;
    const avgEffort = chartData.reduce((acc, d) => acc + d.effort, 0) / effortDays;
    
    // Entry-level scaling: Lower denominators so progress is visible early
    return [
      { subject: 'Earnings', A: Math.min((totalTokens / 10) * 100, 100), fullMark: 100 },
      { subject: 'Time', A: Math.min((totalDuration / 30) * 100, 100), fullMark: 100 },
      { subject: 'Effort', A: Math.min(avgEffort * 80, 100), fullMark: 100 },
      { subject: 'Streak', A: Math.min(((profile?.currentStreakDays || 0) / 7) * 100, 100), fullMark: 100 },
      { subject: 'Goals', A: Math.min(((profile?.totalWorkoutsCompleted || 0) / 5) * 100, 100), fullMark: 100 },
    ];
  }, [chartData, profile]);

  useEffect(() => {
    if (address) {
      getBalance(address).then(setBalance);
    }
    if (profile && !motivation && !loadingMotivation && workouts) {
      setLoadingMotivation(true);
      generateMotivation({
        workoutHistory: workouts.slice(0, 3).map((w: any) => ({
          date: (w.startTime || w.date)?.split?.('T')?.[0] || new Date().toISOString().split('T')[0],
          type: w.workoutType || w.type,
          durationMinutes: w.durationMinutes,
          tokensEarned: w.totalTokensEarned
        })),
        currentStreak: profile.currentStreakDays || 0,
        totalWorkouts: profile.totalWorkoutsCompleted || 0,
        totalTokensEarned: balance
      }).then(setMotivation).catch(() => {
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' }) as keyof typeof WEEKLY_PLANS.MuscleGain;
        setMotivation({
          motivationalMessage: "Keep it up! Small steps lead to big changes.",
          workoutSuggestions: [WEEKLY_PLANS.MuscleGain[todayStr] || "Stay Active Today"],
          promoCode: (profile.currentStreakDays || 0) > 3 ? "STREAK3" : undefined
        });
      }).finally(() => setLoadingMotivation(false));
    }
  }, [profile, address, balance, workouts]);

  const handleWorkoutSuccess = () => {
    if (address) getBalance(address).then(setBalance);
  };

  if (!isClient) return null;

  const currentStreak = profile?.currentStreakDays || 0;
  const totalWorkouts = profile?.totalWorkoutsCompleted || 0;
  const monthlyProgress = Math.min((totalWorkouts / 20) * 100, 100);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative mesh-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-headline font-black uppercase italic tracking-tighter text-foreground">Active Rewards: <span className="text-primary not-italic">ON ⚡</span></h1>
            <p className="text-muted-foreground mt-1 font-medium tracking-tight">Your weekly history and earnings summary.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="pro-glass p-4 rounded-[2rem] flex items-center gap-4 group hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Wallet className="w-6 h-6 text-primary group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">My Wallet</p>
                <p className="text-2xl font-black text-primary">
                  <CountUp value={balance} /> FIT
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "My FIT", value: balance, icon: Wallet, suffix: "" },
            { label: "Day Streak", value: currentStreak, suffix: " Days", icon: Flame },
            { label: "Workouts", value: totalWorkouts, suffix: "", icon: Dumbbell },
            { label: "Monthly Goal", value: Math.round(monthlyProgress), suffix: "%", icon: Zap }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[2.5rem] border-none pro-glass hover:shadow-xl transition-all group overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-secondary mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-primary" />
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
              className="pro-glass rounded-[3rem] p-10 md:p-14 relative overflow-hidden group shadow-2xl"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8 text-center md:text-left">
                  <h2 className="text-5xl font-headline font-black leading-tight uppercase text-foreground">Log Your Next <span className="text-primary italic">Workout</span></h2>
                  <p className="text-lg text-muted-foreground max-w-md font-medium tracking-tight">Earn FIT tokens for every minute you move. Consistency is the key to success.</p>
                  <div className="max-w-xs mx-auto md:mx-0">
                    <WorkoutModal 
                      onSuccess={handleWorkoutSuccess} 
                      userStats={{ totalWorkouts, currentStreak }} 
                    />
                  </div>
                </div>
                <div className="hidden md:flex w-64 h-64 pro-glass rounded-[3rem] p-8 items-center justify-center flex-col text-center">
                  <Activity className="w-16 h-16 text-primary animate-pulse mb-4" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Workout Tracker</p>
                  <Badge className="bg-primary/20 text-primary border-none text-[8px] tracking-widest">ACTIVE</Badge>
                </div>
              </div>
            </motion.div>

            <Card className="rounded-[3rem] border-none pro-glass overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/10 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-3 text-xl uppercase font-black italic tracking-tighter text-foreground">
                      <Target className="w-6 h-6 text-primary" />
                      Weekly Balance
                    </CardTitle>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-9">Performance history for the current week</p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/20 px-4 py-1 text-[9px] font-black uppercase tracking-widest text-primary">Live Sync</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-10 h-[400px]">
                {workoutsLoading ? (
                  <div className="flex flex-col h-full items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
                              <div className="pro-glass p-4 rounded-2xl shadow-2xl">
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
            <Card className="rounded-[3rem] border-none shadow-2xl bg-primary text-white overflow-hidden relative group">
              <CardHeader className="relative z-10 pb-2 p-8">
                <CardTitle className="flex items-center gap-3 text-xl uppercase font-black italic tracking-tighter">
                  <Sparkles className="w-6 h-6 text-white/80" />
                  Today's Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10 p-8 pt-4">
                {loadingMotivation ? (
                  <div className="space-y-6">
                    <Skeleton className="h-28 w-full bg-white/20 rounded-3xl" />
                  </div>
                ) : motivation ? (
                  <>
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
                      <p className="text-base leading-relaxed font-bold italic tracking-tight">"{motivation.motivationalMessage}"</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 ml-1">Today's Tasks:</p>
                      {motivation.workoutSuggestions.map((s: string, i: number) => (
                        <div key={i} className="p-4 bg-white/20 rounded-2xl text-xs font-black border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                             {s}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-80 font-bold tracking-tight">Log your first workout to see your daily plan.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none pro-glass overflow-hidden">
              <CardHeader className="pb-4 p-8">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  My Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8 pt-2">
                <div className="grid grid-cols-7 gap-3">
                  {chartData.map((d, i) => {
                    const isToday = todayDate ? isSameDay(d.date, todayDate) : false;
                    const hasWorkout = d.duration > 0 || d.tokens > 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 flex items-center justify-center transition-all relative"
                        )}>
                          {hasWorkout ? (
                            <Avatar className="w-12 h-12 border-2 border-primary shadow-lg scale-110">
                              <AvatarFallback className="bg-primary relative overflow-visible">
                                <Flame className="w-6 h-6 text-white fill-white" />
                                <span className="absolute -top-3 -right-3 text-xl animate-bounce">🔥</span>
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center bg-muted/50 border border-muted",
                              isToday && "border-primary/40 bg-primary/5"
                            )}>
                              {isToday && <div className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isToday ? "text-primary scale-110" : "text-muted-foreground opacity-60"
                        )}>{d.day[0]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 bg-destructive/10 rounded-2xl border border-destructive/20 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest">Consistency Warning</p>
                    <p className="text-[11px] font-medium leading-tight text-destructive/80">
                      Missing your workout for more than 2 days will cost you -20 FIT tokens. Stay active!
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Goal</span>
                    <span className="text-[11px] font-black text-primary">{Math.round(monthlyProgress)}%</span>
                  </div>
                  <Progress value={monthlyProgress} className="h-4 rounded-full bg-muted/30" />
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                   <ShieldCheck className="w-5 h-5 text-primary" />
                   <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Verified History</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
