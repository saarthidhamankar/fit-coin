
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Check, MapPin, Truck, Phone, Package } from "lucide-react";
import { getBalance, spendTokens } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRODUCTS = [
  { id: "p1", name: "FitCoin Water Bottle", price: 80, emoji: "🍶", category: "Equipment", rating: 4.9 },
  { id: "p2", name: "Pro Yoga Mat", price: 120, emoji: "🧘", category: "Equipment", rating: 4.8 },
  { id: "p3", name: "Stealth Headphones", price: 500, emoji: "🎧", category: "Equipment", rating: 5.0 },
  { id: "p4", name: "Whey Protein (1kg)", price: 200, emoji: "🥛", category: "Nutrition", rating: 4.9 },
  { id: "p5", name: "Pre-Workout Boost", price: 150, emoji: "⚡", category: "Nutrition", rating: 4.8 },
  { id: "p6", name: "Resistance Bands", price: 50, emoji: "🎗️", category: "Equipment", rating: 4.7 },
  { id: "p7", name: "FitCoin Hoodie", price: 350, emoji: "👕", category: "Apparel", rating: 5.0 },
  { id: "p8", name: "Training Shorts", price: 100, emoji: "🩳", category: "Apparel", rating: 4.8 },
  { id: "p9", name: "1-on-1 Coaching", price: 1000, emoji: "👨‍🏫", category: "Training", rating: 5.0 },
];

export default function ShopPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [successProduct, setSuccessProduct] = useState<any>(null);
  const { toast } = useToast();

  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    pincode: "",
    phone: ""
  });

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      getBalance(addr).then(setBalance);
    }
  }, []);

  const handleRedeemInitiate = (product: any) => {
    if (!address) {
      toast({ variant: "destructive", title: "Wallet missing", description: "Connect your wallet to buy rewards." });
      return;
    }
    if (balance < product.price) {
      toast({ variant: "destructive", title: "Low Balance", description: `You need ${product.price - balance} more FIT. Log more workouts!` });
      return;
    }
    setCheckoutProduct(product);
  };

  const handleConfirmRedeem = async () => {
    if (!user?.uid || !checkoutProduct || !address) return;

    if (!shipping.fullName || !shipping.address || !shipping.pincode) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide shipping details for your gear." });
      return;
    }

    setLoading(true);
    try {
      // 1. Update blockchain balance (mocked locally)
      const newBalance = await spendTokens(address, checkoutProduct.price);
      setBalance(newBalance);

      // 2. Log purchase in Firestore
      const purchaseRef = collection(db, "users", user.uid, "purchases");
      await addDoc(purchaseRef, {
        userId: user.uid,
        productId: checkoutProduct.id,
        productName: checkoutProduct.name,
        purchaseDate: new Date().toISOString(),
        fitCoinsSpent: checkoutProduct.price,
        shippingDetails: shipping
      });

      // 3. Log to activity ledger
      const logRef = collection(db, "users", user.uid, "activityLogs");
      await addDoc(logRef, {
        userId: user.uid,
        activityType: "PURCHASE_SPEND",
        description: `Redeemed: ${checkoutProduct.name}`,
        fitCoinsChange: -checkoutProduct.price,
        timestamp: new Date().toISOString()
      });

      setSuccessProduct(checkoutProduct);
      setCheckoutProduct(null);
      toast({ title: "Purchase Complete!", description: "Order confirmed. Track it in your Activity Ledger." });
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
            <p className="text-muted-foreground mt-2 text-lg font-medium">Redeem your sweat for physical gym assets.</p>
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
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Redeemable with FIT tokens earned at the gym.</p>
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
                            onClick={() => handleRedeemInitiate(product)} 
                            className={`rounded-2xl h-14 px-8 font-black transition-all ${
                              balance >= product.price 
                                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                          >
                            Redeem
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

      {/* Checkout Modal */}
      <Dialog open={!!checkoutProduct} onOpenChange={() => setCheckoutProduct(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-headline font-black uppercase text-2xl flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" /> Delivery Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">Item</p>
                <p className="font-black">{checkoutProduct?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Cost</p>
                <p className="font-black text-primary">{checkoutProduct?.price} FIT</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase">Full Name</Label>
                <Input 
                  placeholder="Athlete Name" 
                  value={shipping.fullName} 
                  onChange={(e) => setShipping({...shipping, fullName: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase">Shipping Address</Label>
                <Input 
                  placeholder="Street, Building, Flat" 
                  value={shipping.address} 
                  onChange={(e) => setShipping({...shipping, address: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-black uppercase">City</Label>
                  <Input 
                    placeholder="City" 
                    value={shipping.city} 
                    onChange={(e) => setShipping({...shipping, city: e.target.value})}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-black uppercase">Pincode</Label>
                  <Input 
                    placeholder="ZIP/PIN" 
                    value={shipping.pincode} 
                    onChange={(e) => setShipping({...shipping, pincode: e.target.value})}
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase">Contact Phone</Label>
                <Input 
                  placeholder="+1 (555) 000-0000" 
                  value={shipping.phone} 
                  onChange={(e) => setShipping({...shipping, phone: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <Button 
              onClick={handleConfirmRedeem} 
              disabled={loading}
              className="w-full h-16 rounded-[1.5rem] font-black uppercase text-xl mt-4 shadow-xl shadow-primary/20"
            >
              {loading ? "Confirming..." : "Finalize Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={!!successProduct} onOpenChange={() => setSuccessProduct(null)}>
        <DialogContent className="max-w-sm rounded-[3rem] p-0 overflow-hidden border-none text-center">
          <div className="bg-gradient-to-b from-primary/20 to-background p-10 space-y-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white mx-auto shadow-2xl"
            >
              <Package className="w-12 h-12" />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-3xl font-headline font-black uppercase italic">Order Placed!</h2>
              <p className="text-muted-foreground font-medium">Your <span className="text-foreground font-black">{successProduct?.name}</span> is being prepared. Earn more FIT for your next claim!</p>
            </div>
            <Button className="w-full h-14 bg-primary text-lg font-black rounded-2xl" onClick={() => setSuccessProduct(null)}>
              Back to Store
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
