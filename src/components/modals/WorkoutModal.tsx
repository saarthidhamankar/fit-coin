
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dumbbell, Timer, Flame, Bike, Waves, Zap, ChevronRight } from "lucide-react";
import { WorkoutType, calculateWorkoutReward } from "@/lib/workout-rules";
import { rewardUser } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

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
      
      // Update local streak and count (Simulated)
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
        <Button size="lg" className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl animate-glow rounded-2xl">
          <Dumbbell className="w-6 h-6 mr-2" />
          Log Workout session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline font-bold">Log Activity</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-3 gap-3">
            {types.map((t) => (
              <button
                key={t.label}
                onClick={() => setType(t.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  type === t.label ? "border-primary bg-primary/5 scale-105" : "border-muted hover:border-primary/20"
                }`}
              >
                <t.icon className={`w-6 h-6 mb-2 ${type === t.label ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Duration</span>
              <span className="text-2xl font-bold text-primary">{duration} min</span>
            </div>
            <Slider 
              value={[duration]} 
              onValueChange={(v) => setDuration(v[0])} 
              min={15} 
              max={180} 
              step={5}
            />
          </div>

          <div className="bg-secondary/50 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Reward</span>
              <div className="flex items-center gap-1">
                <span className="text-3xl font-bold text-primary">{preview.reward}</span>
                <span className="text-sm font-bold text-primary/70">FIT</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {preview.breakdowns.map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-white rounded-full font-bold uppercase text-primary/60 border border-primary/10">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleConfirm} 
            disabled={loading} 
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl"
          >
            {loading ? "Verifying On-chain..." : "Confirm & Earn"}
            {!loading && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
          
          <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Transactions occur on Sepolia Testnet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
