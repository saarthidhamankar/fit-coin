"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Flame, Dumbbell, Zap, Coffee, Utensils, Info, CheckCircle2, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type DietType = "Veg" | "NonVeg";

const DIET_DATA = {
  FatLoss: {
    title: "Loose Fat Protocol",
    description: "Prioritizing calorie deficit with high satiety whole foods.",
    calories: "1800-2000 kcal",
    protein: "160g+",
    NonVeg: [
      { time: "Breakfast", icon: Coffee, title: "Egg White Omelette", detail: "5 egg whites, spinach, feta, 1 slice whole wheat toast." },
      { time: "Lunch", icon: Utensils, title: "Grilled Chicken Salad", detail: "200g chicken breast, mixed greens, lemon vinaigrette." },
      { time: "Snack", icon: Apple, title: "Boiled Eggs & Berries", detail: "2 whole eggs, handful of blueberries." },
      { time: "Dinner", icon: Utensils, title: "Baked White Fish", detail: "Tilapia or Cod, steamed broccoli, half sweet potato." }
    ],
    Veg: [
      { time: "Breakfast", icon: Coffee, title: "Tofu Scramble", detail: "200g firm tofu, turmeric, nutritional yeast, spinach, toast." },
      { time: "Lunch", icon: Utensils, title: "Lentil & Kale Bowl", detail: "1 cup cooked lentils, massaged kale, cucumber, tahini dressing." },
      { time: "Snack", icon: Apple, title: "Roasted Chickpeas", detail: "50g air-fried chickpeas with sea salt and paprika." },
      { time: "Dinner", icon: Utensils, title: "Low-Fat Paneer Grill", detail: "150g grilled paneer, mixed bell peppers, cauliflower rice." }
    ]
  },
  MuscleGain: {
    title: "Hypertrophy Fuel",
    description: "Surplus calories optimized for muscle repair and recovery.",
    calories: "3000-3200 kcal",
    protein: "200g+",
    NonVeg: [
      { time: "Breakfast", icon: Coffee, title: "Protein Power Oats", detail: "1 cup oats, 2 boiled eggs on the side, 1 tbsp peanut butter." },
      { time: "Lunch", icon: Utensils, title: "Chicken & Brown Rice", detail: "250g grilled chicken, 1.5 cups rice, avocado, asparagus." },
      { time: "Pre-Gym", icon: Zap, title: "Energy Boost", detail: "Rice cakes with honey and 1000mg Fish Oil supplement." },
      { time: "Dinner", icon: Utensils, title: "Salmon & Pasta", detail: "Grilled salmon fillet, whole wheat pasta, olive oil, broccoli." }
    ],
    Veg: [
      { time: "Breakfast", icon: Coffee, title: "Oatmeal Nut Blast", detail: "1.5 cups oats, soy milk, 2 tbsp almond butter, hemp seeds." },
      { time: "Lunch", icon: Utensils, title: "Quinoa & Bean Burrito", detail: "1 cup quinoa, black beans, guacamole, salsa, spinach wrap." },
      { time: "Pre-Gym", icon: Zap, title: "Tempeh Power", detail: "100g seared tempeh with soy sauce and honey." },
      { time: "Dinner", icon: Utensils, title: "Tofu & Cashew Stir-fry", detail: "250g tofu, snap peas, carrots, cashews, brown rice." }
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
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />

      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-black text-xs uppercase tracking-widest">
            <Apple className="w-4 h-4" /> Metabolic Forge
          </div>
          <h1 className="text-5xl font-headline font-black uppercase tracking-tight italic">Dietary <span className="text-primary not-italic">Fuel</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Optimize your recovery with science-backed nutrition plans. No beef. Only pure performance fuel.</p>
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
                <TabsTrigger value="Veg" className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white">
                  <Leaf className="w-4 h-4 mr-2" /> Veg
                </TabsTrigger>
                <TabsTrigger value="NonVeg" className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
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
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader>
                    <CardTitle className="text-2xl font-black uppercase italic leading-none">
                      Daily Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-70">Energy Intake</p>
                      <p className="text-4xl font-black tracking-tighter">{currentPlan.calories}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-70">Protein Benchmark</p>
                      <p className="text-4xl font-black tracking-tighter">{currentPlan.protein}</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleApplyPlan(activeGoal, dietType)}
                      className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-white text-primary"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Activate Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-card overflow-hidden">
                   <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nutrition Note</CardTitle>
                   </CardHeader>
                   <CardContent className="p-6">
                      <p className="text-sm font-bold leading-relaxed italic">
                        {dietType === "NonVeg" 
                          ? "Focus on high-quality chicken and fish. Don't forget your daily 2000mg Fish Oil for joint health."
                          : "Soy, tempeh, and lentils are your primary amino acid sources. Supplement with B12 for optimal energy."}
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
                            dietType === 'Veg' 
                              ? 'bg-accent/5 border-accent/10 group-hover:bg-accent group-hover:text-white' 
                              : 'bg-primary/5 border-primary/10 group-hover:bg-primary group-hover:text-white'
                          }`}>
                            <meal.icon className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                               <p className="text-[10px] font-black uppercase text-muted-foreground">{meal.time}</p>
                               <Badge variant="outline" className={`text-[8px] font-black uppercase ${dietType === 'Veg' ? 'text-accent border-accent/30' : 'text-primary border-primary/30'}`}>
                                 {dietType === 'Veg' ? 'Plant Based' : 'Protein Rich'}
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

                <div className="bg-accent/10 rounded-[2.5rem] p-8 border-2 border-accent/20 flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shrink-0 mt-1 shadow-lg">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-lg font-black uppercase italic mb-1 text-accent-foreground">Protocol Tip</h5>
                    <p className="text-sm text-accent-foreground/80 font-medium leading-relaxed">
                      Always prioritize whole foods. If you're on the Non-Veg plan, ensure chicken is grilled or baked, and fish is rich in Omega-3s.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
