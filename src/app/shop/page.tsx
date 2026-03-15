
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Check } from "lucide-react";
import { getBalance, spendTokens } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";

const PRODUCTS = [
  { id: 1, name: "FitCoin Water Bottle", price: 80, emoji: "🍶", category: "Equipment", rating: 4.9 },
  { id: 2, name: "Pro Yoga Mat", price: 120, emoji: "🧘", category: "Equipment", rating: 4.8 },
  { id: 3, name: "Stealth Headphones", price: 500, emoji: "🎧", category: "Equipment", rating: 5.0 },
  { id: 4, name: "Whey Protein (1kg)", price: 200, emoji: "🥛", category: "Nutrition", rating: 4.9 },
  { id: 5, name: "Pre-Workout Boost", price: 150, emoji: "⚡", category: "Nutrition", rating: 4.8 },
  { id: 6, name: "Resistance Bands", price: 50, emoji: "🎗️", category: "Equipment", rating: 4.7 },
  { id: 7, name: "FitCoin Hoodie", price: 350, emoji: "👕", category: "Apparel", rating: 5.0 },
  { id: 8, name: "Training Shorts", price: 100, emoji: "🩳", category: "Apparel", rating: 4.8 },
  { id: 9, name: "1-on-1 Coaching", price: 1000, emoji: "👨‍🏫", category: "Training", rating: 5.0 },
];

export default function ShopPage() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [successProduct, setSuccessProduct] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      getBalance(addr).then(setBalance);
    }
  }, []);

  const handleBuy = async (product: any) => {
    if (!address) {
      toast({ variant: "destructive", title: "Wallet missing", description: "Connect your wallet to buy rewards." });
      return;
    }

    if (balance < product.price) {
      toast({ variant: "destructive", title: "Low Balance", description: `You need ${product.price - balance} more FIT. Log more workouts!` });
      return;
    }

    setLoading(product.id);
    try {
      const newBalance = await spendTokens(address, product.price);
      setBalance(newBalance);
      setSuccessProduct(product);
      toast({ title: "Purchase Complete!", description: `${product.name} is now in your inventory.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transaction Error", description: e.message });
    } finally {
      setLoading(null);
    }
  };

  const categories = ["Equipment", "Nutrition", "Apparel", "Training"];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-5xl font-headline font-black uppercase tracking-tight">Reward Store</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Redeem your sweat for physical and digital assets.</p>
          </div>
          <div className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-primary/30 border-b-4 border-black/10">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xl">
              <CountUp value={balance} /> FIT
            </span>
          </div>
        </motion.div>

        <Tabs defaultValue="Equipment" className="w-full">
          <TabsList className="bg-white dark:bg-card p-1 rounded-[2rem] shadow-sm border-2 border-primary/10 mb-12 h-16 flex items-center max-w-2xl mx-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-1 h-12 rounded-[1.5rem] text-sm font-black tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {PRODUCTS.filter(p => p.category === cat).map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-primary/20 bg-white dark:bg-card">
                      <div className="h-64 bg-gradient-to-br from-secondary/50 to-primary/5 flex items-center justify-center text-9xl relative overflow-hidden">
                        <motion.span whileHover={{ scale: 1.2, rotate: 5 }}>
                          {product.emoji}
                        </motion.span>
                        <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-primary/10">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-[10px] font-black">{product.rating}</span>
                        </div>
                      </div>
                      <CardHeader className="flex-1 pb-2">
                        <CardTitle className="text-2xl font-black">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">High-performance gear for consistent athletes.</p>
                      </CardHeader>
                      <CardFooter className="p-6 pt-2">
                        <div className="flex items-center justify-between w-full p-4 bg-muted/30 rounded-3xl border border-muted">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Price</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-primary">{product.price}</span>
                              <span className="text-[10px] font-black text-primary/60">FIT</span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleBuy(product)} 
                            disabled={loading === product.id}
                            className={`rounded-2xl h-14 px-8 font-black transition-all ${
                              balance >= product.price 
                                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {loading === product.id ? "Syncing..." : "Redeem"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!successProduct} onOpenChange={() => setSuccessProduct(null)}>
        <DialogContent className="max-w-sm rounded-[3rem] p-0 overflow-hidden border-none text-center">
          <div className="bg-gradient-to-b from-primary/20 to-background p-10 space-y-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white mx-auto shadow-2xl"
            >
              <Check className="w-12 h-12" />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-3xl font-headline font-black">Redeemed!</h2>
              <p className="text-muted-foreground font-medium">You've successfully claimed your <span className="text-foreground font-black">{successProduct?.name}</span>.</p>
            </div>
            <Button className="w-full h-14 bg-primary text-lg font-black rounded-2xl" onClick={() => setSuccessProduct(null)}>
              Keep Grinding
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
