"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Flame, Dumbbell, Zap, Coffee, Utensils, Info, CheckCircle2, Leaf, Pill, Waves, HeartPulse, Banana } from "lucide-react";
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
      title: "Plan Activated",
      description: `Your ${type} ${goal} protocol has been synced to your profile.`,
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />
      <Navbar />

      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-black text-xs uppercase tracking-widest">
            <Apple className="w-4 h-4" /> Nutri-Protocol v3.0
          </div>
          <h1 className="text-5xl font-headline font-black uppercase tracking-tight italic">Dietary <span className="text-primary not-italic">Fuel</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Precision blueprints for your physique. High protein, essential micros, and zero beef.</p>
        </motion.div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Tabs value={activeGoal} onValueChange={setActiveGoal} className="w-full max-w-md">
              <TabsList className="bg-white dark:bg-card p-1 rounded-[2rem] shadow-sm border-2 border-primary/10 h-16 w-full">
                <TabsTrigger value="FatLoss" className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Flame className="w-4 h-4 mr-2" /> Fat Loss
                </TabsTrigger>
                <TabsTrigger value="MuscleGain" className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Dumbbell className="w-4 h-4 mr-2" /> Muscle Gain
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={dietType} onValueChange={(v) => setDietType(v as DietType)} className="w-full max-w-xs">
              <TabsList className="bg-white dark:bg-card p-1 rounded-[2rem] shadow-sm border-2 border-accent/10 h-16 w-full">
                <TabsTrigger value="Veg" className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Leaf className="w-4 h-4 mr-2" /> Veg
                </TabsTrigger>
                <TabsTrigger value="NonVeg" className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white">
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
              className="grid md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-1 space-y-8">
                <Card className={`rounded-[2.5rem] border-none shadow-xl overflow-hidden relative text-white ${dietType === 'NonVeg' ? 'bg-red-500' : 'bg-primary'}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader>
                    <CardTitle className="text-2xl font-black uppercase italic leading-none">
                      Protocol Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-70">Daily Energy</p>
                      <p className="text-4xl font-black tracking-tighter">{currentPlan.calories}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-70">Amino Baseline</p>
                      <p className="text-4xl font-black tracking-tighter">{currentPlan.protein}</p>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/10 rounded-2xl border border-white/20">
                      <Pill className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Multivitamin included</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleApplyPlan(activeGoal, dietType)}
                      className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-white text-foreground hover:bg-white/90"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Activate Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-card overflow-hidden">
                   <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expert Guidance</CardTitle>
                   </CardHeader>
                   <CardContent className="p-6">
                      <p className="text-sm font-bold leading-relaxed italic text-muted-foreground">
                        {dietType === "NonVeg" 
                          ? "Focus on lean chicken, eggs, and fish oil. Beef is strictly excluded to maintain protocol purity."
                          : "Harness Soya, Paneer, and mixed nuts for high-density plant protein. Essential for metabolic gain."}
                      </p>
                   </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="grid gap-4">
                  {meals.map((meal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white dark:bg-card">
                        <CardContent className="p-6 flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-colors ${
                            dietType === 'NonVeg' 
                              ? 'bg-red-50 border-red-100 group-hover:bg-red-500 group-hover:text-white' 
                              : 'bg-primary/5 border-primary/10 group-hover:bg-primary group-hover:text-white'
                          }`}>
                            <meal.icon className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                               <p className={`text-[10px] font-black uppercase ${dietType === 'NonVeg' ? 'text-red-500' : 'text-primary'}`}>{meal.time}</p>
                               <Badge variant="outline" className={`text-[8px] font-black uppercase ${dietType === 'NonVeg' ? 'text-red-500 border-red-200' : 'text-primary border-primary/20'}`}>
                                 Verified Protocol
                               </Badge>
                            </div>
                            <h4 className="text-xl font-black uppercase">{meal.title}</h4>
                            <p className="text-sm text-muted-foreground font-medium">{meal.detail}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="grid md:grid-cols-4 gap-4 mt-8">
                  {[
                    { title: "Hydration", text: "4-5L H2O daily", icon: Waves },
                    { title: "Micros", text: "Green Veggies", icon: Leaf },
                    { title: "Timing", text: "Pre-Workout", icon: Zap },
                    { title: "Vitamins", text: "Multi-Stash", icon: HeartPulse }
                  ].map((item, i) => (
                    <Card key={i} className="rounded-3xl border-none bg-white dark:bg-card p-4 text-center group hover:scale-105 transition-transform">
                      <div className="w-10 h-10 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <p className="text-[8px] font-black uppercase text-muted-foreground">{item.title}</p>
                      <p className="text-[10px] font-black">{item.text}</p>
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
