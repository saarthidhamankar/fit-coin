
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, Activity, Trophy, ShoppingBag, Home, Settings, LogOut, Dumbbell } from "lucide-react";
import { connectWallet } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, auth } = useUser();
  const db = useFirestore();
  const [address, setAddress] = useState<string | null>(null);
  const pathname = usePathname();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  useEffect(() => {
    const saved = localStorage.getItem('fitcoin_wallet_address');
    if (saved) setAddress(saved);
  }, []);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAddress(addr);
      localStorage.setItem('fitcoin_wallet_address', addr);

      // Initialize or Update Profile in Firestore
      if (user?.uid && db) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          walletAddress: addr,
          lastLoginDate: new Date().toISOString()
        }, { merge: true });

        // Record Login in Activity Ledger
        const logRef = doc(db, "users", user.uid, "activityLogs", `login-${Date.now()}`);
        await setDoc(logRef, {
          userId: user.uid,
          activityType: "LOGIN",
          description: "Athlete synchronization established.",
          fitCoinsChange: 0,
          timestamp: new Date().toISOString()
        });
      }

      toast({ title: "Wallet Connected", description: `Welcome back, athlete!` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Connection Failed", description: e.message });
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    localStorage.removeItem('fitcoin_wallet_address');
    toast({ title: "Disconnected", description: "Your physical assets are safe." });
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Earn", href: "/dashboard", icon: Activity },
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "Ledger", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter text-primary hidden sm:block italic uppercase">
            Fit<span className="text-foreground not-italic">Coin</span>
          </span>
        </Link>

        {/* Tab-style Navigation */}
        <div className="flex items-center bg-secondary/30 p-1 rounded-2xl border border-border/50">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                pathname === item.href 
                  ? "bg-white dark:bg-card text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl border border-border/50">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast({ title: "Settings", description: "Identity and encryption managed via wallet." })}
              className="rounded-xl h-9 w-9 hover:bg-primary/10 transition-all"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="hidden md:block h-6 w-px bg-border mx-1" />

          {address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest px-4 hover:bg-primary/5 border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
                  {profile?.username || "My Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2">
                <DropdownMenuLabel className="font-headline font-black uppercase text-xs">Athlete Profile</DropdownMenuLabel>
                <div className="px-2 pb-2 text-[10px] font-code text-muted-foreground truncate">
                  {address}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/profile" className="w-full flex items-center font-bold">
                    <Activity className="mr-2 h-4 w-4" /> Performance Stats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Security", description: "Encryption layer active." })} className="rounded-xl cursor-pointer font-bold">
                  <Shield className="mr-2 h-4 w-4" /> Privacy Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDisconnect} className="text-destructive rounded-xl cursor-pointer font-bold">
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={handleConnect} className="rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10 px-6 active:scale-95 transition-transform">
              <Wallet className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
