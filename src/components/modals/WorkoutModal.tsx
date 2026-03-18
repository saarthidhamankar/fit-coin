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
  const [type, setType] = useState<WorkoutType>('Strength');
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
    { icon: Dumbbell, label: 'Strength' },
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
      toast({ variant: "destructive", title: "Wallet Missing", description: "Connect your wallet first." });
      return;
    }

    setLoading(true);
    try {
      const today = new Date();
      const todayDateStr = today.toISOString().split('T')[0];
      let newStreak = 1;

      // Robust Streak Logic
      if (profile?.lastWorkoutDate) {
        const lastDateStr = profile.lastWorkoutDate.split('T')[0];
        const lastDate = new Date(lastDateStr);
        const todayDate = new Date(todayDateStr);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak = (profile.currentStreakDays || 0) + 1;
        } else if (diffDays === 0) {
          newStreak = profile.currentStreakDays || 1;
        } else {
          newStreak = 1;
        }
      }

      // 1. Blockchain Reward
      await rewardUser(address, preview.reward);
      
      // 2. Firebase Updates (Non-blocking but executed in order)
      if (user?.uid && db) {
        const timestampStr = today.toISOString();
        
        // Save Session
        await addDoc(collection(db, "users", user.uid, "workoutSessions"), {
          userId: user.uid,
          workoutType: type,
          durationMinutes: duration,
          totalTokensEarned: preview.reward,
          timestamp: serverTimestamp(),
          startTime: timestampStr
        });

        // Update Profile Stats
        await updateDoc(doc(db, "users", user.uid), {
          totalWorkoutsCompleted: increment(1),
          totalFitEarned: increment(preview.reward),
          lastWorkoutDate: timestampStr,
          currentStreakDays: newStreak,
          lastActivityAt: serverTimestamp()
        });

        // Log Action
        await addDoc(collection(db, "users", user.uid, "activityLogs"), {
          userId: user.uid,
          activityType: "WORKOUT_EARN",
          description: `Finished: ${type} session`,
          fitCoinsChange: preview.reward,
          timestamp: serverTimestamp()
        });
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#18D156', '#BCFA22', '#ffffff']
      });

      toast({ 
        title: "Session Saved!", 
        description: `You earned ${preview.reward} FIT. Current Streak: ${newStreak} Days!` 
      });
      
      setOpen(false);
      onSuccess();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message || "Could not save session." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 animate-glow rounded-[1.5rem] border-2 border-white/50 transition-all active:scale-95">
          <Dumbbell className="w-7 h-7 mr-2" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none focus:outline-none">
        <div className="bg-gradient-to-b from-primary/10 to-background p-8 space-y-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline font-black text-foreground uppercase italic tracking-tighter">New Workout</DialogTitle>
            <p className="text-muted-foreground font-medium text-sm">Pick your session and set the time to earn FIT.</p>
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
                </button>
              ))}
            </div>

            <div className="space-y-6 bg-white dark:bg-card p-8 rounded-[2rem] shadow-sm border-2 border-primary/10">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Session Time</p>
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
            </div>

            <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-2xl shadow-primary/30 space-y-4 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <span className="text-xs font-black uppercase tracking-[0.1em]">Estimated Earnings</span>
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
            </div>

            <Button 
              onClick={handleConfirm} 
              disabled={loading} 
              className="w-full h-20 text-2xl font-black bg-primary hover:bg-primary/90 rounded-[1.5rem] shadow-xl shadow-primary/20 group border-b-8 border-black/10 active:border-b-0 active:translate-y-1 transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </div>
              ) : (
                <>
                  Earn FIT Now
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