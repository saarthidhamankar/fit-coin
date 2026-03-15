
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Check, AlertCircle } from "lucide-react";
import { getBalance, spendTokens } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PRODUCTS = [
  { id: 1, name: "Whey Protein (1kg)", price: 200, emoji: "🥛", category: "Nutrition" },
  { id: 2, name: "Pre-Workout Boost", price: 150, emoji: "⚡", category: "Nutrition" },
  { id: 3, name: "Resistance Bands", price: 80, emoji: "🎗️", category: "Equipment" },
  { id: 4, name: "Lifting Straps", price: 50, emoji: "🧤", category: "Equipment" },
  { id: 5, name: "FitCoin Hoodie", price: 350, emoji: "👕", category: "Apparel" },
  { id: 6, name: "Training Shorts", price: 120, emoji: "🩳", category: "Apparel" },
  { id: 7, name: "1-on-1 Coaching", price: 1000, emoji: "👨‍🏫", category: "Training" },
  { id: 8, name: "Custom Meal Plan", price: 500, emoji: "🥗", category: "Training" },
  { id: 9, name: "Creatine Monohydrate", price: 180, emoji: "💊", category: "Nutrition" },
  { id: 10, name: "Leather Lifting Belt", price: 400, emoji: "ベルト", category: "Equipment" },
  { id: 11, name: "Gym Towel Pro", price: 40, emoji: "🧣", category: "Apparel" },
  { id: 12, name: "Yoga Mat Ultra", price: 110, emoji: "🧘", category: "Equipment" },
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
      toast({ variant: "destructive", title: "Wallet not connected", description: "Connect MetaMask to buy rewards." });
      return;
    }

    if (balance < product.price) {
      toast({ variant: "destructive", title: "Insufficient Balance", description: `You need ${product.price - balance} more FIT to buy this.` });
      return;
    }

    setLoading(product.id);
    try {
      const newBalance = await spendTokens(address, product.price);
      setBalance(newBalance);
      setSuccessProduct(product);
      toast({ title: "Purchase Successful!", description: `${product.name} has been added to your collection.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transaction Failed", description: e.message });
    } finally {
      setLoading(null);
    }
  };

  const categories = ["Nutrition", "Equipment", "Apparel", "Training"];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold">Rewards Shop</h1>
            <p className="text-muted-foreground mt-1">Spend your FIT tokens on premium gear and supplements.</p>
          </div>
          <div className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg">
            <ShoppingBag className="w-5 h-5" />
            {balance.toLocaleString()} FIT Available
          </div>
        </div>

        <Tabs defaultValue="Nutrition" className="w-full">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border mb-8 h-14 flex items-center">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-1 h-12 rounded-xl text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRODUCTS.filter(p => p.category === cat).map(product => (
                  <Card key={product.id} className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full group overflow-hidden">
                    <div className="h-48 bg-secondary/30 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                      {product.emoji}
                    </div>
                    <CardHeader className="flex-1">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold ml-1">4.9</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Premium quality {cat.toLowerCase()} to boost your results.</p>
                    </CardHeader>
                    <CardFooter className="p-6 pt-0 border-t bg-muted/20">
                      <div className="flex items-center justify-between w-full mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-primary">{product.price}</span>
                          <span className="text-xs font-bold text-primary/70">FIT</span>
                        </div>
                        <Button 
                          onClick={() => handleBuy(product)} 
                          disabled={loading === product.id}
                          variant={balance >= product.price ? "default" : "outline"}
                          className={`rounded-xl font-bold ${balance >= product.price ? 'bg-primary hover:bg-primary/90' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          {loading === product.id ? "Buying..." : "Buy Now"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!successProduct} onOpenChange={() => setSuccessProduct(null)}>
        <DialogContent className="max-w-sm rounded-3xl text-center">
          <div className="py-8 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Check className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Transaction Complete</h2>
              <p className="text-muted-foreground">You've successfully purchased {successProduct?.name}.</p>
            </div>
            <Button className="w-full bg-primary" onClick={() => setSuccessProduct(null)}>
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
