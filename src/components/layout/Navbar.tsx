"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, Activity, Trophy, ShoppingBag, User, LogOut } from "lucide-react";
import { connectWallet } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [address, setAddress] = useState<string | null>(null);
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('fitcoin_wallet_address');
    if (saved) setAddress(saved);
  }, []);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAddress(addr);
      localStorage.setItem('fitcoin_wallet_address', addr);
      toast({ title: "Wallet Connected", description: `Welcome back, ${addr.slice(0, 6)}...` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Connection Failed", description: e.message });
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    localStorage.removeItem('fitcoin_wallet_address');
    toast({ title: "Disconnected" });
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Profile", href: "/profile", icon: User },
  ];

  if (pathname === "/") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">F</div>
          <span className="font-headline text-xl font-bold tracking-tight text-primary">FitCoin</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {address ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Sepolia Connected</span>
                <span className="text-xs font-medium font-code">{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
              <Button size="sm" variant="outline" className="h-9 px-3" onClick={handleDisconnect}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={handleConnect} className="animate-glow bg-primary hover:bg-primary/90">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}