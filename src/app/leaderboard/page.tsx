"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Flame, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_DATA = {
  Weekly: [
    { address: "0x742d...444e", username: "IronGains", tokens: 15400, streak: 45, rank: 1 },
    { address: "0x3f1a...9e21", username: "FitQueen", tokens: 12100, streak: 32, rank: 2 },
    { address: "0xab90...8811", username: "DegenLifts", tokens: 10500, streak: 28, rank: 3 },
    { address: "0x1234...5678", username: "CryptoSwimmer", tokens: 8400, streak: 14, rank: 4 },
    { address: "0xdead...beef", username: "EthereumAthlete", tokens: 7200, streak: 21, rank: 5 },
  ],
  Monthly: [
    { address: "0x3f1a...9e21", username: "FitQueen", tokens: 45000, streak: 32, rank: 1 },
    { address: "0x742d...444e", username: "IronGains", tokens: 42000, streak: 45, rank: 2 },
    { address: "0xbeef...cafe", username: "BlockRunner", tokens: 38000, streak: 12, rank: 3 },
    { address: "0xcafe...1234", username: "YogaMaster", tokens: 31000, streak: 9, rank: 4 },
    { address: "0x5678...dead", username: "HIIT_King", tokens: 29000, streak: 7, rank: 5 },
  ],
  AllTime: [
    { address: "0x742d...444e", username: "IronGains", tokens: 154000, streak: 45, rank: 1 },
    { address: "0x3f1a...9e21", username: "FitQueen", tokens: 142000, streak: 32, rank: 2 },
    { address: "0xab90...8811", username: "DegenLifts", tokens: 125000, streak: 28, rank: 3 },
    { address: "0x1234...5678", username: "CryptoSwimmer", tokens: 108400, streak: 14, rank: 4 },
    { address: "0xdead...beef", username: "EthereumAthlete", tokens: 97200, streak: 21, rank: 5 },
  ]
};

export default function LeaderboardPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Weekly");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setAddress(localStorage.getItem('fitcoin_wallet_address'));
  }, []);

  const athletes = useMemo(() => MOCK_DATA[activeTab as keyof typeof MOCK_DATA], [activeTab]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <Navbar />

      <div className="max-w-5xl mx-auto space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-black text-xs uppercase tracking-widest">
            <Trophy className="w-4 h-4" /> Global Hall of Fame
          </div>
          <h1 className="text-5xl font-headline font-black">Top Performers</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">The strongest athletes on the blockchain. Sweat is the only way to climb this mountain.</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-16">
            <TabsList className="bg-white dark:bg-card p-1 rounded-[2rem] shadow-sm border-2 border-primary/10 h-16 w-full max-w-md">
              {["Weekly", "Monthly", "AllTime"].map(tab => (
                <TabsTrigger key={tab} value={tab} className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                  {tab === "AllTime" ? "All Time" : tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="space-y-16">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-12 px-4"
              >
                {/* Podium Rendering */}
                {athletes.slice(0, 3).map((a, i) => {
                  const ranks = [2, 1, 3]; // Order for podium layout
                  const currentAthlete = athletes.find(athlete => athlete.rank === ranks[i]);
                  if (!currentAthlete) return null;

                  return (
                    <div key={currentAthlete.rank} className={cn(
                      "flex flex-col items-center group",
                      currentAthlete.rank === 1 ? "order-1 md:order-2 z-10" : currentAthlete.rank === 2 ? "order-2 md:order-1" : "order-3 md:order-3"
                    )}>
                      <div className="relative mb-6">
                        {currentAthlete.rank === 1 && (
                          <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2"
                          >
                            <Crown className="w-14 h-14 text-yellow-500 filter drop-shadow-lg" />
                          </motion.div>
                        )}
                        <Avatar className={cn(
                          "shadow-2xl group-hover:scale-105 transition-transform",
                          currentAthlete.rank === 1 ? "w-40 h-40 border-8 border-yellow-400" : currentAthlete.rank === 2 ? "w-28 h-28 border-4 border-gray-300" : "w-24 h-24 border-4 border-orange-400"
                        )}>
                          <AvatarImage src={`https://picsum.photos/seed/${currentAthlete.username}/160/160`} />
                          <AvatarFallback>{currentAthlete.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center text-white font-black border-4 border-white shadow-xl",
                          currentAthlete.rank === 1 ? "w-14 h-14 bg-yellow-500 text-xl" : currentAthlete.rank === 2 ? "w-10 h-10 bg-gray-400 text-sm" : "w-8 h-8 bg-orange-500 text-xs"
                        )}>
                          {currentAthlete.rank}
                        </div>
                      </div>
                      <div className={cn(
                        "bg-white dark:bg-card rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-6 border-t-[8px]",
                        currentAthlete.rank === 1 ? "h-44 w-52 border-yellow-400" : currentAthlete.rank === 2 ? "h-28 w-40 border-gray-300" : "h-24 w-36 border-orange-400"
                      )}>
                        <p className="font-black text-sm">{currentAthlete.username}</p>
                        <p className="font-black text-primary">{(currentAthlete.tokens / 1000).toFixed(1)}k FIT</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white dark:bg-card">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-24 px-8 font-black uppercase text-[10px] tracking-widest">Rank</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Athlete</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Earnings</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Streak</TableHead>
                    <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {athletes.map((user, idx) => (
                      <motion.tr 
                        key={`${activeTab}-${user.rank}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={cn(
                          "h-20 transition-all border-b border-muted/50 last:border-none",
                          address && address.toLowerCase().includes(user.address.toLowerCase()) ? "bg-primary/5 shadow-inner" : "hover:bg-muted/10"
                        )}
                      >
                        <TableCell className="px-8 font-black text-lg">
                          <div className="flex items-center gap-3">
                            {user.rank <= 3 ? <Medal className={`w-5 h-5 ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} /> : <span>{user.rank}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                              <AvatarImage src={`https://picsum.photos/seed/${user.username}/100/100`} />
                              <AvatarFallback>{user.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-black text-sm leading-none flex items-center gap-2">
                                {user.username}
                                {address && address.toLowerCase().includes(user.address.toLowerCase()) && (
                                  <Badge className="bg-primary text-[8px] font-black uppercase rounded-full">You</Badge>
                                )}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-code mt-1">{user.address}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-primary text-base">
                          {user.tokens.toLocaleString()} <span className="text-[10px] text-primary/50">FIT</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-full w-fit">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-black">{user.streak} d</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex items-center justify-end text-primary font-black text-xs gap-1">
                            <ArrowUp className="w-3 h-3" /> 2%
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}