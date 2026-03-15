"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dumbbell, Timer, Flame, Bike, Waves, Zap, ChevronRight, Trophy } from "lucide-react";
import { WorkoutType, calculateWorkoutReward } from "@/lib/workout-rules";
import { rewardUser } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

interface WorkoutModalProps {
  onSuccess: () => void;
  userStats: { totalWorkouts: number; currentStreak: number };
}

export default function WorkoutModal({ onSuccess, userStats }: WorkoutModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<WorkoutType>('Gym/Strength');
  const [duration, setDuration] = useState(60);
  const [preview, setPreview] = useState<{ reward: number; breakdowns: string[] }>({ reward: 0, breakdowns: [] });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  const types: { icon: any; label: WorkoutType }[] = [
    { icon: Dumbbell, label: 'Gym/Strength' },
    { icon: Flame, label: 'HIIT' },
    { icon: Timer, label: 'Cardio' },
    { icon: Bike, label: 'Cycling' },
    { icon: Waves, label: 'Swimming' },
    { icon: Zap, label: 'Yoga' },
  ];

  useEffect(() => {
    setPreview(calculateWorkoutReward(duration, new Date(), userStats));
  }, [duration, userStats]);

  const handleConfirm = async () => {
    const address = localStorage.getItem('fitcoin_wallet_address');
    if (!address) {
      toast({ variant: "destructive", title: "Wallet Missing", description: "Please connect your wallet first." });
      return;
    }

    setLoading(true);
    try {
      // 1. Calculate new streak logic
      let newStreak = 1;
      if (profile?.lastWorkoutDate) {
        const lastWorkout = new Date(profile.lastWorkoutDate);
        const today = new Date();
        
        // Normalize dates to check day difference
        const lastDate = new Date(lastWorkout.getFullYear(), lastWorkout.getMonth(), lastWorkout.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          newStreak = profile.currentStreakDays || 1;
        } else if (diffDays === 1) {
          newStreak = (profile.currentStreakDays || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      // 2. Blockchain Reward (Mocked)
      await rewardUser(address, preview.reward);
      
      // 3. Firestore Sync if logged in
      if (user?.uid && db) {
        // Aligned with backend.json schema for WorkoutSession
        const sessionRef = collection(db, "users", user.uid, "workoutSessions");
        await addDoc(sessionRef, {
          userId: user.uid,
          workoutType: type,
          durationMinutes: duration,
          startTime: new Date().toISOString(),
          endTime: new Date(new Date().getTime() + duration * 60000).toISOString(),
          totalTokensEarned: preview.reward,
          appliedBonuses: preview.breakdowns,
          timestamp: serverTimestamp()
        });

        const logRef = collection(db, "users", user.uid, "activityLogs");
        await addDoc(logRef, {
          userId: user.uid,
          activityType: "WORKOUT_EARN",
          description: `${type} session completed (${duration} mins)`,
          fitCoinsChange: preview.reward,
          timestamp: new Date().toISOString()
        });

        // Update profile aggregates as defined in backend.json User entity
        const profileRef = doc(db, "users", user.uid);
        await updateDoc(profileRef, {
          totalWorkoutsCompleted: increment(1),
          totalFitEarned: increment(preview.reward),
          lastWorkoutDate: new Date().toISOString(),
          currentStreakDays: newStreak,
          lastActivityAt: new Date().toISOString()
        });
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#18D156', '#BCFA22', '#ffffff']
      });

      toast({ title: "Session Verified", description: `You earned ${preview.reward} FIT tokens. Streak: ${newStreak} Days!` });
      
      setOpen(false);
      onSuccess();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Verification Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 animate-glow rounded-[1.5rem] border-2 border-white/50 transition-all active:scale-95">
          <Dumbbell className="w-7 h-7 mr-2" />
          Log Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none focus:outline-none">
        <div className="bg-gradient-to-b from-primary/10 to-background p-8 space-y-8 max-h-[90vh] overflow-y-auto scroll-smooth">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline font-black text-foreground uppercase italic tracking-tighter">Verified Grind</DialogTitle>
            <p className="text-muted-foreground font-medium text-sm">Select your gym activity and swipe the timer to sync your FIT tokens.</p>
          </DialogHeader>
          
          <div className="space-y-8 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {types.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setType(t.label)}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all relative group ${
                    type === t.label 
                      ? "border-primary bg-white shadow-xl scale-105 z-10" 
                      : "border-muted bg-muted/30 hover:border-primary/20 hover:bg-white"
                  }`}
                >
                  <t.icon className={`w-8 h-8 mb-3 transition-colors ${type === t.label ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-none ${type === t.label ? "text-primary" : "text-muted-foreground"}`}>
                    {t.label}
                  </span>
                  {type === t.label && (
                    <motion.div layoutId="active-badge" className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-6 bg-white dark:bg-card p-8 rounded-[2rem] shadow-sm border-2 border-primary/10">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Sync Duration</p>
                  <p className="text-5xl font-black text-primary">
                    {duration}<span className="text-lg text-primary/60 font-black ml-1 uppercase">min</span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center border-2 border-white">
                  <Timer className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="px-2">
                <Slider 
                  value={[duration]} 
                  onValueChange={(v) => setDuration(v[0])} 
                  min={15} 
                  max={180} 
                  step={5}
                  className="py-6 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest px-1">
                <span>15m</span>
                <span>90m</span>
                <span>180m</span>
              </div>
            </div>

            <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-2xl shadow-primary/30 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <span className="text-xs font-black uppercase tracking-[0.1em]">On-Chain Reward</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <motion.span 
                    key={preview.reward}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-black italic"
                  >
                    {preview.reward}
                  </motion.span>
                  <span className="text-sm font-black text-white/80 uppercase">FIT</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 relative z-10">
                {preview.breakdowns.map((b, i) => (
                  <span key={i} className="text-[9px] px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-xl font-black uppercase border border-white/20">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleConfirm} 
              disabled={loading} 
              className="w-full h-20 text-2xl font-black bg-primary hover:bg-primary/90 rounded-[1.5rem] shadow-xl shadow-primary/20 group border-b-8 border-black/10 active:border-b-0 active:translate-y-1 transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <>
                  Earn FIT Tokens
                  <ChevronRight className="w-7 h-7 ml-2 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}