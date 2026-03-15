
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
import { motion, AnimatePresence } from "framer-motion";

interface WorkoutModalProps {
  onSuccess: () => void;
  userStats: { totalWorkouts: number; currentStreak: number };
}

export default function WorkoutModal({ onSuccess, userStats }: WorkoutModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<WorkoutType>('Strength');
  const [duration, setDuration] = useState(45);
  const [preview, setPreview] = useState<{ reward: number; breakdowns: string[] }>({ reward: 0, breakdowns: [] });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      toast({ variant: "destructive", title: "Wallet Missing", description: "Please connect your wallet first." });
      return;
    }

    setLoading(true);
    try {
      await rewardUser(address, preview.reward);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#18D156', '#BCFA22', '#ffffff']
      });

      toast({ title: "Workout Verified!", description: `Success! +${preview.reward} FIT tokens added to your wallet.` });
      
      const workouts = JSON.parse(localStorage.getItem(`fitcoin_history_${address}`) || "[]");
      workouts.unshift({ type, duration, date: new Date().toISOString(), tokens: preview.reward });
      localStorage.setItem(`fitcoin_history_${address}`, JSON.stringify(workouts.slice(0, 50)));
      
      setOpen(false);
      onSuccess();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transaction Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 animate-glow rounded-[1.5rem] border-2 border-white/50">
          <Dumbbell className="w-7 h-7 mr-2" />
          Log Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none">
        <div className="bg-gradient-to-b from-primary/10 to-background p-8 space-y-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline font-black text-foreground">Log Activity</DialogTitle>
            <p className="text-muted-foreground font-medium">Every minute counts toward your next reward.</p>
          </DialogHeader>
          
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-3">
              {types.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setType(t.label)}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all relative group ${
                    type === t.label 
                      ? "border-primary bg-white shadow-xl scale-105" 
                      : "border-muted bg-muted/30 hover:border-primary/20 hover:bg-white"
                  }`}
                >
                  <t.icon className={`w-6 h-6 mb-2 transition-colors ${type === t.label ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${type === t.label ? "text-primary" : "text-muted-foreground"}`}>
                    {t.label}
                  </span>
                  {type === t.label && (
                    <motion.div layoutId="active-badge" className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-primary/10">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Session Duration</p>
                  <p className="text-4xl font-black text-primary">
                    {duration} <span className="text-lg text-primary/60 font-medium">min</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Slider 
                value={[duration]} 
                onValueChange={(v) => setDuration(v[0])} 
                min={15} 
                max={180} 
                step={5}
                className="py-4"
              />
            </div>

            <div className="bg-primary text-white rounded-[2rem] p-6 shadow-xl shadow-primary/20 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-wider">Earned Today</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <motion.span 
                    key={preview.reward}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black"
                  >
                    {preview.reward}
                  </motion.span>
                  <span className="text-sm font-black text-white/70">FIT</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 relative z-10">
                {preview.breakdowns.map((b, i) => (
                  <span key={i} className="text-[9px] px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg font-black uppercase border border-white/10">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleConfirm} 
              disabled={loading} 
              className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <>
                  Confirm & Earn FIT
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <p className="text-center text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">
              Transactions secured by Ethereum Sepolia
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
