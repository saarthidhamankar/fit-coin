
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, Flame, Dumbbell, History, Sparkles, Trophy } from "lucide-react";
import { getBalance } from "@/blockchain";
import WorkoutModal from "@/components/modals/WorkoutModal";
import { motion } from "framer-motion";
import { generateMotivation } from "@/ai/flows/generate-motivation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, currentStreak: 0, monthlyProgress: 0 });
  const [motivation, setMotivation] = useState<any>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      fetchData(addr);
    }
  }, []);

  const fetchData = async (addr: string) => {
    const bal = await getBalance(addr);
    setBalance(bal);

    const workouts = JSON.parse(localStorage.getItem(`fitcoin_history_${addr}`) || "[]");
    setHistory(workouts);
    
    // Calculate stats
    const total = workouts.length;
    const streak = total > 0 ? 5 : 0; // Simulated streak
    const progress = Math.min((total / 30) * 100, 100);
    
    const s = { totalWorkouts: total, currentStreak: streak, monthlyProgress: progress };
    setStats(s);

    // AI Motivation
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
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold">Good morning, Champ! 🚀</h1>
            <p className="text-muted-foreground mt-1">Your decentralized fitness stats are ready.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">FIT Balance</p>
              <p className="text-2xl font-bold text-primary">{balance.toLocaleString()} FIT</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Streak", value: `${stats.currentStreak} Days`, icon: Flame, color: "text-orange-500" },
            { label: "Sessions", value: stats.totalWorkouts, icon: Dumbbell, color: "text-blue-500" },
            { label: "Monthly Goal", value: `${Math.round(stats.monthlyProgress)}%`, icon: Trophy, color: "text-yellow-500" },
            { label: "Tokens Earned", value: `+${history.reduce((a, b) => a + b.tokens, 0)}`, icon: Sparkles, color: "text-primary" }
          ].map((stat, i) => (
            <Card key={i} className="rounded-2xl border-none shadow-sm overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full bg-secondary mb-3 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Main Action */}
            <div className="bg-primary/5 rounded-3xl p-8 border-2 border-primary/10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h2 className="text-3xl font-headline font-bold">Ready for the Next Set?</h2>
                  <p className="text-muted-foreground">Log your session now and secure your rewards on-chain. Bonuses available for morning workouts!</p>
                  <div className="max-w-xs mx-auto md:mx-0">
                    <WorkoutModal 
                      onSuccess={() => address && fetchData(address)} 
                      userStats={stats} 
                    />
                  </div>
                </div>
                <div className="w-48 h-48 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-bounce duration-3000">
                  <Dumbbell className="w-24 h-24 text-primary" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.length > 0 ? (
                    history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors border">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold">
                            {h.type[0]}
                          </div>
                          <div>
                            <p className="font-bold">{h.type}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(h.date), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">+{h.tokens} FIT</p>
                          <p className="text-[10px] font-code text-muted-foreground">{h.duration} mins</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No workouts logged yet. Start today!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* AI Coach */}
            <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-primary to-accent text-white overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Workout Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingMotivation ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full bg-white/20" />
                    <Skeleton className="h-4 w-2/3 bg-white/20" />
                  </div>
                ) : motivation ? (
                  <>
                    <p className="text-sm leading-relaxed font-medium">"{motivation.motivationalMessage}"</p>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Suggested for today:</p>
                      {motivation.workoutSuggestions.map((s: string, i: number) => (
                        <div key={i} className="p-3 bg-white/10 rounded-xl text-xs border border-white/10">
                          {s}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-80">Log a workout to get personalized AI coaching advice!</p>
                )}
              </CardContent>
            </Card>

            {/* Streak Calendar */}
            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Weekly Progress</防控
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${i < 4 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        {i < 4 ? '✓' : ''}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold">Monthly Challenge</span>
                    <span className="text-xs font-bold text-primary">{Math.round(stats.monthlyProgress)}%</span>
                  </div>
                  <Progress value={stats.monthlyProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
