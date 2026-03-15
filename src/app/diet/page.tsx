"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Flame, Dumbbell, Zap, Coffee, Utensils, Info, CheckCircle2, Leaf, Pill, Waves, HeartPulse, Banana, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type DietType = "Veg" | "NonVeg";

const DIET_DATA = {
  FatLoss: {
    title: "Metabolic Cut Protocol",
    description: "Optimizing calorie deficit with high-fiber veggies, seeds, and micronutrients for fat oxidation.",
    calories: "1800-2000 kcal",
    protein: "160g+",
    NonVeg: [
      { time: "Breakfast", icon: Coffee, title: "Egg White & Green Forge", detail: "5 egg whites, steamed baby spinach, 1 banana, 1 Multivitamin capsule." },
      { time: "Lunch", icon: Utensils, title: "Lean Chicken & Seeds", detail: "200g grilled chicken, mix of beans and broccoli, 1 tbsp pumpkin seeds." },
      { time: "Snack", icon: Apple, title: "Nut & Berry Blend", detail: "Handful of almonds & walnuts, mixed berries, 2000mg Fish Oil supplement." },
      { time: "Dinner", icon: Utensils, title: "Baked Fish & Fiber", detail: "Tilapia/Cod, 1 cup cooked black beans, steamed green veggies, 1 apple." }
    ],
    Veg: [
      { time: "Breakfast", icon: Coffee, title: "Soya & Fruit Start", detail: "Tofu/Soya scramble, mixed fruits, 1 glass milk/soy milk, 1 Multivitamin." },
      { time: "Lunch", icon: Utensils, title: "Paneer & Bean Bowl", detail: "150g low-fat paneer, boiled kidney beans, kale salad, flax seeds." },
      { time: "Snack", icon: Apple, title: "Dry Fruit Crunch", detail: "Roasted chickpeas, 5 cashews, 3 dry figs, 1 small banana." },
      { time: "Dinner", icon: Utensils, title: "Lentil & Veggie Power", detail: "1 cup thick yellow dal, stir-fried beans and carrots, cauliflower rice." }
    ]
  },
  MuscleGain: {
    title: "Anabolic Bulk Protocol",
    description: "Surplus calories optimized for hypertrophy with complex carbs, healthy fats, and high-protein superfoods.",
    calories: "3000-3200 kcal",
    protein: "200g+",
    NonVeg: [
      { time: "Breakfast", icon: Coffee, title: "Power Oats & Eggs", detail: "1 cup oats with milk, 1 banana, 3 whole eggs, handful of mixed dry fruits." },
      { time: "Lunch", icon: Utensils, title: "Chicken, Rice & Beans", detail: "250g grilled chicken, 1.5 cups brown rice, 1 cup black beans, avocado." },
      { time: "Post-Gym", icon: Zap, title: "Hyper-Fuel Shake", detail: "500ml milk, 1 scoop protein, 1 tbsp peanut butter, 1 tbsp chia seeds." },
      { time: "Dinner", icon: Utensils, title: "Salmon & Greens", detail: "Grilled salmon, whole wheat pasta, large portion of green veggies, sunflower seeds." }
    ],
    Veg: [
      { time: "Breakfast", icon: Coffee, title: "Paneer & Nut Blast", detail: "200g Paneer bhurji, 1 glass milk, 1 banana, 10 almonds, 5 walnuts." },
      { time: "Lunch", icon: Utensils, title: "Soya & Quinoa Feast", detail: "1 cup cooked soya chunks, 1 cup quinoa, mixed bean salad, hemp seeds." },
      { time: "Post-Gym", icon: Zap, title: "Veggie Protein", detail: "Soy milk shake with 1 scoop protein, 1 tbsp almond butter, mixed dry fruits." },
      { time: "Dinner", icon: Utensils, title: "Tofu & Nut Stir-fry", detail: "250g firm tofu, mixed veggies (broccoli/beans), cashews, brown rice." }
    ]
  }
};

export default function DietPage() {
  const [activeGoal, setActiveGoal] = useState("MuscleGain");
  const [dietType, setDietType] = useState<DietType>("NonVeg");
  const { toast } = useToast();

  const handleApplyPlan = (goal: string, type: string) => {
    toast({
      title: "Protocol Activated",
      description: `Your ${type} ${goal} performance blueprint has been synced.`,
    });
  };

  const currentPlan = DIET_DATA[activeGoal as keyof typeof DIET_DATA];
  const meals = currentPlan[dietType];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-24 pb-12 px-4 relative overflow-hidden"
    >
      <Navbar />

      <div className="max-w-6xl mx-auto space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-full border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
            <Apple className="w-4 h-4" /> Nutri-Protocol v4.0
          </div>
          <h1 className="text-6xl font-headline font-black uppercase tracking-tighter italic">Dietary <span className="text-primary not-italic">Fuel</span></h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">Precision benchmarks for metabolic dominance. High-density protein, zero beef, maximum rep recovery.</p>
        </motion.div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Tabs value={activeGoal} onValueChange={setActiveGoal} className="w-full max-w-md">
              <TabsList className="bg-white/40 dark:bg-card/40 p-1.5 rounded-[2.5rem] shadow-xl border-2 border-primary/10 h-18 w-full backdrop-blur-md">
                <TabsTrigger value="FatLoss" className="flex-1 h-14 rounded-[1.8rem] text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm">
                  <Flame className="w-4 h-4 mr-2" /> Fat Loss
                </TabsTrigger>
                <TabsTrigger value="MuscleGain" className="flex-1 h-14 rounded-[1.8rem] text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm">
                  <Dumbbell className="w-4 h-4 mr-2" /> Muscle Gain
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={dietType} onValueChange={(v) => setDietType(v as DietType)} className="w-full max-w-xs">
              <TabsList className="bg-white/40 dark:bg-card/40 p-1.5 rounded-[2.5rem] shadow-xl border-2 border-accent/10 h-18 w-full backdrop-blur-md">
                <TabsTrigger value="Veg" className="flex-1 h-14 rounded-[1.8rem] text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm">
                  <Leaf className="w-4 h-4 mr-2" /> Veg
                </TabsTrigger>
                <TabsTrigger value="NonVeg" className="flex-1 h-14 rounded-[1.8rem] text-xs font-black uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white shadow-sm">
                  <Utensils className="w-4 h-4 mr-2" /> Non-Veg
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeGoal}-${dietType}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-3 gap-10"
            >
              <div className="md:col-span-1 space-y-10">
                <Card className={`rounded-[3.5rem] border-none shadow-2xl overflow-hidden relative text-white ${dietType === 'NonVeg' ? 'bg-red-500' : 'bg-primary'}`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-3xl font-black uppercase italic leading-none tracking-tighter">
                      Protocol Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-4 space-y-8">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Daily Burn Goal</p>
                      <p className="text-5xl font-black tracking-tighter">{currentPlan.calories}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Macro Baseline (P)</p>
                      <p className="text-5xl font-black tracking-tighter">{currentPlan.protein}</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/20">
                      <Pill className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Recovery Micronutrients</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleApplyPlan(activeGoal, dietType)}
                      className="w-full h-20 rounded-[1.8rem] font-black uppercase text-sm tracking-[0.2em] bg-white text-foreground hover:bg-white/90 shadow-xl border-b-8 border-black/10 active:border-b-0 active:translate-y-1 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-3" /> Commit Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[3rem] border-none shadow-sm glass-card overflow-hidden">
                   <CardHeader className="bg-muted/30 border-b border-border/10 p-8">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Expert Protocol Guide</CardTitle>
                   </CardHeader>
                   <CardContent className="p-8">
                      <p className="text-sm font-bold leading-relaxed italic text-muted-foreground">
                        {dietType === "NonVeg" 
                          ? "Protocol focused on avian lean protein (Chicken), omega-synthesis (Fish Oil), and whole eggs. Bovine products are strictly excluded for metabolic purity."
                          : "Harnessing plant-based density through Soya isolate, low-fat Paneer, and activated nuts. Engineered for maximum hypertrophy and fiber baseline."}
                      </p>
                   </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div className="grid gap-6">
                  {meals.map((meal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden glass-card">
                        <CardContent className="p-8 flex items-center gap-8">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all group-hover:scale-110 ${
                            dietType === 'NonVeg' 
                              ? 'bg-red-50 border-red-100 group-hover:bg-red-500 group-hover:text-white' 
                              : 'bg-primary/5 border-primary/10 group-hover:bg-primary group-hover:text-white'
                          }`}>
                            <meal.icon className="w-10 h-10" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${dietType === 'NonVeg' ? 'text-red-500' : 'text-primary'}`}>{meal.time}</p>
                               <Badge variant="outline" className={`text-[9px] font-black uppercase px-3 py-0.5 ${dietType === 'NonVeg' ? 'text-red-500 border-red-200' : 'text-primary border-primary/20'}`}>
                                 Verified Protocol
                               </Badge>
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tight">{meal.title}</h4>
                            <p className="text-base text-muted-foreground font-medium mt-1">{meal.detail}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                  {[
                    { title: "Hydration", text: "4-5L H2O Synthesis", icon: Waves },
                    { title: "Micros", text: "Dense Green Veggies", icon: Leaf },
                    { title: "Timing", text: "Pre-Rep Activation", icon: Zap },
                    { title: "Vitamins", text: "Multistack Daily", icon: HeartPulse }
                  ].map((item, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-none glass-card p-6 text-center group hover:-translate-y-2 transition-all">
                      <div className="w-12 h-12 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{item.title}</p>
                      <p className="text-[11px] font-black uppercase tracking-tight">{item.text}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}