"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Check, MapPin, Truck, Phone, Package, Heart, Info, ArrowRight, Tag, Loader2, X } from "lucide-react";
import { getBalance, spendTokens } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "@/components/CountUp";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";

const PRODUCTS = [
  { id: "p1", name: "FitCoin Water Bottle", price: 80, emoji: "🍶", category: "Equipment", rating: 4.9, stock: 12 },
  { id: "p2", name: "Pro Yoga Mat", price: 120, emoji: "🧘", category: "Equipment", rating: 4.8, stock: 5 },
  { id: "p3", name: "Stealth Headphones", price: 500, emoji: "🎧", category: "Equipment", rating: 5.0, stock: 2 },
  { id: "p4", name: "Whey Protein (1kg)", price: 200, emoji: "🥛", category: "Nutrition", rating: 4.9, stock: 25 },
  { id: "p5", name: "Pre-Workout Boost", price: 150, emoji: "⚡", category: "Nutrition", rating: 4.8, stock: 40 },
  { id: "p6", name: "Resistance Bands", price: 50, emoji: "🎗️", category: "Equipment", rating: 4.7, stock: 100 },
  { id: "p7", name: "FitCoin Hoodie", price: 350, emoji: "👕", category: "Apparel", rating: 5.0, stock: 8 },
  { id: "p8", name: "Training Shorts", price: 100, emoji: "🩳", category: "Apparel", rating: 4.8, stock: 15 },
  { id: "p9", name: "1-on-1 Coaching", price: 1000, emoji: "👨‍🏫", category: "Training", rating: 5.0, stock: 1 },
];

export default function ShopPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [successProduct, setSuccessProduct] = useState<any>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const { toast } = useToast();

  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
    promoCode: ""
  });

  const [validatingCode, setValidatingCode] = useState(false);

  useEffect(() => {
    const addr = localStorage.getItem('fitcoin_wallet_address');
    if (addr) {
      setAddress(addr);
      getBalance(addr).then(setBalance);
    }
    const savedWishlist = JSON.parse(localStorage.getItem('fitcoin_wishlist') || "[]");
    setWishlist(savedWishlist);
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

  const handleValidateCode = () => {
    if (!shipping.promoCode) return;
    setValidatingCode(true);
    setTimeout(() => {
      setValidatingCode(false);
      toast({ title: "Code Applied", description: "You've unlocked a special achievement discount!" });
    }, 1000);
  };

  const handleConfirmRedeem = async () => {
    if (!checkoutProduct || !address) return;

    if (!shipping.fullName || !shipping.address || !shipping.pincode || !shipping.phone) {
      toast({ variant: "destructive", title: "Missing Info", description: "All shipping details are required for gear delivery." });
      return;
    }

    setLoading(true);
    try {
      const newBalance = await spendTokens(address, checkoutProduct.price);
      setBalance(newBalance);

      if (user?.uid && db) {
        const purchaseRef = collection(db, "users", user.uid, "purchases");
        await addDoc(purchaseRef, {
          userId: user.uid,
          productId: checkoutProduct.id,
          productName: checkoutProduct.name,
          purchaseDate: new Date().toISOString(),
          fitCoinsSpent: checkoutProduct.price,
          shippingDetails: shipping,
          status: 'order_confirmed',
          timestamp: serverTimestamp()
        });

        const logRef = collection(db, "users", user.uid, "activityLogs");
        await addDoc(logRef, {
          userId: user.uid,
          activityType: "PURCHASE_SPEND",
          description: `Redeemed: ${checkoutProduct.name}`,
          fitCoinsChange: -checkoutProduct.price,
          timestamp: new Date().toISOString()
        });
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#18D156', '#BCFA22', '#ffffff']
      });

      setSuccessProduct(checkoutProduct);
      setCheckoutProduct(null);
      toast({ title: "Purchase Complete!", description: "Order confirmed. Your gear is on the way!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transaction Error", description: e.message || "Failed to process order." });
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
    toast({ 
      title: wishlist.includes(id) ? "Removed" : "Added", 
      description: wishlist.includes(id) ? "Item removed from wishlist." : "Goal item saved!" 
    });
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
            <h1 className="text-5xl font-headline font-black uppercase tracking-tight italic">Reward <span className="text-primary not-italic">Vault</span></h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Redeem your hard-earned FIT tokens for premium fitness hardware.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowWishlist(true)}
              className="rounded-2xl h-14 px-6 font-black uppercase text-xs tracking-widest bg-white dark:bg-card border-2 active:scale-95"
            >
              <Heart className="w-5 h-5 mr-2 text-primary" /> Wishlist ({wishlist.length})
            </Button>
            <div className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-primary/30 border-b-4 border-black/10">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xl">
                <CountUp value={balance} /> FIT
              </span>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="Equipment" className="w-full">
          <TabsList className="bg-white dark:bg-card p-1 rounded-[2rem] shadow-sm border-2 border-primary/10 mb-12 h-16 flex items-center max-w-2xl mx-auto overflow-x-auto no-scrollbar">
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
                        <div className="absolute top-4 left-4 flex gap-2">
                          {product.stock < 10 && (
                            <div className="bg-destructive text-white px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                              Low Stock
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="bg-white/80 dark:bg-black/80 rounded-full h-10 w-10 backdrop-blur-sm active:scale-95"
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                          >
                            <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-primary text-primary" : ""}`} />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="flex-1 pb-2">
                        <CardTitle className="text-2xl font-black">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Verified by FitCoin Protocol. Fast global shipping included.</p>
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
                            className={`rounded-2xl h-14 px-8 font-black transition-all active:scale-95 group ${
                              balance >= product.price 
                                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                          >
                            Redeem <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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

      {/* Wishlist Modal */}
      <Dialog open={showWishlist} onOpenChange={setShowWishlist}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl overflow-hidden bg-background">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-headline font-black uppercase text-3xl italic tracking-tighter flex items-center gap-2">
              <Heart className="text-primary fill-primary" /> Goal List
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {wishlist.length > 0 ? (
              wishlist.map(id => {
                const product = PRODUCTS.find(p => p.id === id);
                if (!product) return null;
                return (
                  <div key={id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-muted hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <p className="font-black text-sm">{product.name}</p>
                        <p className="text-[10px] font-bold text-primary">{product.price} FIT</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleWishlist(id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p className="font-black uppercase text-xs tracking-widest">Your wishlist is empty.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={!!checkoutProduct} onOpenChange={(open) => { if (!open && !loading) setCheckoutProduct(null); }}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none focus:outline-none shadow-2xl">
          <div className="max-h-[90vh] overflow-y-auto scroll-smooth p-8 bg-gradient-to-b from-primary/10 to-background flex flex-col gap-8">
            <DialogHeader>
              <DialogTitle className="font-headline font-black uppercase text-2xl flex items-center gap-2">
                <Truck className="w-6 h-6 text-primary" /> Delivery Logistics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-card rounded-[2rem] border-2 border-primary/10 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selected Item</p>
                  <p className="text-xl font-black">{checkoutProduct?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cost</p>
                  <p className="text-2xl font-black text-primary">{checkoutProduct?.price} FIT</p>
                </div>
              </div>
              <div className="space-y-4 bg-white dark:bg-card p-6 rounded-[2rem] shadow-sm border-2 border-primary/10">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Full Name</Label>
                    <Input placeholder="John Doe" value={shipping.fullName} onChange={(e) => setShipping({...shipping, fullName: e.target.value})} className="rounded-xl h-12 border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Address</Label>
                    <Input placeholder="123 Gym Street" value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} className="rounded-xl h-12 border-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">City</Label>
                      <Input placeholder="New York" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="rounded-xl h-12 border-2" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Pincode</Label>
                      <Input placeholder="10001" value={shipping.pincode} onChange={(e) => setShipping({...shipping, pincode: e.target.value})} className="rounded-xl h-12 border-2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Phone</Label>
                    <Input placeholder="+1 555-5555" value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} className="rounded-xl h-12 border-2" />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleConfirmRedeem} 
                disabled={loading}
                className="w-full h-20 rounded-[1.5rem] font-black uppercase text-xl shadow-2xl shadow-primary/30 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Finalize Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
