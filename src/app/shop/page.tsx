
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, ArrowRight, Truck, Loader2 } from "lucide-react";
import { spendTokens } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";

const PRODUCTS = [
  { id: "p1", name: "FitCoin Water Bottle", price: 80, emoji: "🍶", category: "Equipment" },
  { id: "p2", name: "Pro Yoga Mat", price: 120, emoji: "🧘", category: "Equipment" },
  { id: "p3", name: "Stealth Headphones", price: 500, emoji: "🎧", category: "Equipment" },
  { id: "p4", name: "Whey Protein (1kg)", price: 200, emoji: "🥛", category: "Nutrition" },
  { id: "p5", name: "Pre-Workout Boost", price: 150, emoji: "⚡", category: "Nutrition" },
  { id: "p6", name: "Resistance Bands", price: 50, emoji: "🎗️", category: "Equipment" },
  { id: "p7", name: "FitCoin Hoodie", price: 350, emoji: "👕", category: "Apparel" },
  { id: "p8", name: "Training Shorts", price: 100, emoji: "🩳", category: "Apparel" },
  { id: "p9", name: "1-on-1 Coaching", price: 1000, emoji: "👨‍🏫", category: "Training" },
];

export default function ShopPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [shipping, setShipping] = useState({ fullName: "", address: "", city: "", pincode: "", phone: "" });

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  useEffect(() => {
    setIsClient(true);
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) setAddress(addr);
    
    const saved = JSON.parse(localStorage.getItem('fitcoin_wishlist') || "[]");
    setWishlist(saved);
  }, []);

  const balance = profile?.totalFitEarned || 0;

  const handleRedeemInitiate = (product: any) => {
    if (!user) {
      toast({ variant: "destructive", title: "Account missing", description: "Please sign in to buy gear." });
      return;
    }
    if (balance < product.price) {
      toast({ variant: "destructive", title: "Low Earnings", description: `You need ${product.price - balance} more FIT. Log more workouts!` });
      return;
    }
    setCheckoutProduct(product);
  };

  const handleConfirmRedeem = async () => {
    if (!checkoutProduct || !user || !db) return;

    if (!shipping.fullName || !shipping.address || !shipping.pincode || !shipping.phone) {
      toast({ variant: "destructive", title: "Missing Info", description: "All shipping details are required." });
      return;
    }

    setLoading(true);
    try {
      // 1. Spend Simulation
      if (address) await spendTokens(address, checkoutProduct.price);

      // 2. Profile Update
      await updateDoc(doc(db, "users", user.uid), {
        totalFitEarned: increment(-checkoutProduct.price)
      });

      // 3. User Purchase History
      await addDoc(collection(db, "users", user.uid, "purchases"), {
        userId: user.uid,
        productId: checkoutProduct.id,
        productName: checkoutProduct.name,
        fitCoinsSpent: checkoutProduct.price,
        shippingDetails: shipping,
        status: 'order_confirmed',
        timestamp: serverTimestamp()
      });

      // 4. Global Orders (FOR ADMINS)
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email || "anonymous",
        productId: checkoutProduct.id,
        productName: checkoutProduct.name,
        fitCoinsSpent: checkoutProduct.price,
        shippingDetails: shipping,
        status: 'order_confirmed',
        timestamp: serverTimestamp()
      });

      // 5. Activity Log
      await addDoc(collection(db, "users", user.uid, "activityLogs"), {
        userId: user.uid,
        activityType: "PURCHASE_SPEND",
        description: `Redeemed: ${checkoutProduct.name}`,
        fitCoinsChange: -checkoutProduct.price,
        timestamp: serverTimestamp()
      });

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#18D156', '#BCFA22', '#ffffff'] });

      setCheckoutProduct(null);
      toast({ title: "Purchase Complete!", description: "Order confirmed. Your gear is on the way!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to process order." });
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('fitcoin_wishlist', JSON.stringify(next));
      return next;
    });
  };

  if (!isClient) return null;

  const categories = ["Equipment", "Nutrition", "Apparel", "Training"];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 relative mesh-background">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-5xl font-headline font-black uppercase tracking-tight italic">Reward <span className="text-primary not-italic">Vault</span></h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Redeem FIT tokens for premium fitness gear.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl border-b-4 border-black/10">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xl"><CountUp value={balance} /> FIT</span>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="Equipment" className="w-full">
          <TabsList className="pro-glass p-1 rounded-[2rem] shadow-sm mb-12 h-16 flex items-center max-w-2xl mx-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-1 h-12 rounded-[1.5rem] text-sm font-black tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-white">
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
                    <Card className="rounded-[2.5rem] border-none pro-glass hover:shadow-2xl transition-all flex flex-col h-full overflow-hidden">
                      <div className="h-64 bg-secondary/30 flex items-center justify-center text-8xl relative group">
                        <span className="group-hover:scale-125 transition-transform duration-500">{product.emoji}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 rounded-full h-10 w-10 bg-white/50 backdrop-blur-sm"
                          onClick={() => toggleWishlist(product.id)}
                        >
                          <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-primary text-primary" : ""}`} />
                        </Button>
                      </div>
                      <CardHeader className="flex-1">
                        <CardTitle className="text-2xl font-black">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">Fast shipping included. Verified item.</p>
                      </CardHeader>
                      <CardFooter className="p-6">
                        <div className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-3xl">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Price</span>
                            <span className="text-2xl font-black text-primary">{product.price} FIT</span>
                          </div>
                          <Button 
                            onClick={() => handleRedeemInitiate(product)} 
                            className={`rounded-2xl h-12 px-6 font-black ${balance >= product.price ? 'bg-primary' : 'bg-muted opacity-50 cursor-not-allowed'}`}
                          >
                            Redeem <ArrowRight className="w-4 h-4 ml-2" />
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

      <Dialog open={!!checkoutProduct} onOpenChange={(open) => { if (!open && !loading) setCheckoutProduct(null); }}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none pro-glass focus:outline-none">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-headline font-black uppercase text-2xl flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" /> Delivery Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Full Name</Label>
                <Input value={shipping.fullName} onChange={(e) => setShipping({...shipping, fullName: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Shipping Address</Label>
                <Input value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">City</Label>
                  <Input value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Pincode</Label>
                  <Input value={shipping.pincode} onChange={(e) => setShipping({...shipping, pincode: e.target.value})} className="rounded-xl h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Phone</Label>
                <Input value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="rounded-xl h-12" />
              </div>
            </div>
            <Button onClick={handleConfirmRedeem} disabled={loading} className="w-full h-16 rounded-2xl font-black uppercase text-lg">
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirm Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
