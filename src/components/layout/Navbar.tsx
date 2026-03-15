"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, Activity, Trophy, ShoppingBag, Home, Settings, LogOut } from "lucide-react";
import { connectWallet } from "@/blockchain";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      toast({ title: "Wallet Connected", description: `Welcome back, athlete!` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Connection Failed", description: e.message });
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    localStorage.removeItem('fitcoin_wallet_address');
    toast({ title: "Disconnected", description: "Your session has ended." });
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Earn", href: "/dashboard", icon: Activity },
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "Ledger", href: "/leaderboard", icon: Trophy },
  ];

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: "Advanced settings will be available in the next mainnet release.",
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">F</div>
          <span className="font-headline text-xl font-bold tracking-tight text-primary hidden sm:block">FitCoin</span>
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
              onClick={handleSettingsClick}
              className="rounded-xl h-9 w-9 hover:bg-primary/10 transition-all"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="hidden md:block h-6 w-px bg-border mx-1" />

          {address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-2xl border-2 font-code px-3 hover:bg-primary/5">
                  {address.slice(0, 4)}...{address.slice(-4)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2">
                <DropdownMenuLabel className="font-headline">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/profile" className="w-full flex items-center">
                    <Activity className="mr-2 h-4 w-4" /> Profile Stats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick} className="rounded-xl">
                  <Settings className="mr-2 h-4 w-4" /> Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDisconnect} className="text-destructive rounded-xl">
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={handleConnect} className="rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10 px-6">
              <Wallet className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
