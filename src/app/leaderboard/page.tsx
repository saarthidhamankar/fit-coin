
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Star, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const MOCK_LEADERBOARD = [
  { address: "0x742d...444e", username: "IronGains", tokens: 15400, streak: 45, rank: 1 },
  { address: "0x3f1a...9e21", username: "FitQueen", tokens: 12100, streak: 32, rank: 2 },
  { address: "0xab90...8811", username: "DegenLifts", tokens: 10500, streak: 28, rank: 3 },
  { address: "0x1234...5678", username: "CryptoSwimmer", tokens: 8400, streak: 14, rank: 4 },
  { address: "0xdead...beef", username: "EthereumAthlete", tokens: 7200, streak: 21, rank: 5 },
  { address: "0xbeef...cafe", username: "BlockRunner", tokens: 6800, streak: 12, rank: 6 },
  { address: "0xcafe...1234", username: "YogaMaster", tokens: 5500, streak: 9, rank: 7 },
  { address: "0x5678...dead", username: "HIIT_King", tokens: 4200, streak: 7, rank: 8 },
];

export default function LeaderboardPage() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    setAddress(localStorage.getItem('fitcoin_wallet_address'));
  }, []);

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

        <Tabs defaultValue="Weekly" className="w-full">
          <div className="flex justify-center mb-16">
            <TabsList className="bg-white p-1 rounded-[2rem] shadow-sm border-2 border-primary/10 h-16 w-full max-w-md">
              {["Weekly", "Monthly", "AllTime"].map(tab => (
                <TabsTrigger key={tab} value={tab} className="flex-1 h-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                  {tab === "AllTime" ? "All Time" : tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="space-y-16">
            {/* Podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-12 px-4">
              {/* 2nd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center order-2 md:order-1 group"
              >
                <div className="relative mb-6">
                  <Avatar className="w-28 h-28 border-4 border-gray-300 shadow-2xl group-hover:scale-105 transition-transform">
                    <AvatarImage src="https://picsum.photos/seed/fit2/120/120" />
                    <AvatarFallback>FQ</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-400 rounded-2xl flex items-center justify-center text-white font-black border-4 border-white shadow-lg">2</div>
                </div>
                <div className="h-28 w-40 bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-4 border-t-8 border-gray-300">
                  <p className="font-black text-sm">FitQueen</p>
                  <p className="text-xs font-bold text-gray-500">12.1k FIT</p>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center order-1 md:order-2 group z-10"
              >
                <div className="relative mb-8">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2"
                  >
                    <Crown className="w-14 h-14 text-yellow-500 filter drop-shadow-lg" />
                  </motion.div>
                  <Avatar className="w-40 h-40 border-8 border-yellow-400 shadow-[0_20px_50px_rgba(234,179,8,0.3)] group-hover:scale-105 transition-transform">
                    <AvatarImage src="https://picsum.photos/seed/fit1/160/160" />
                    <AvatarFallback>IG</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-yellow-500 rounded-3xl flex items-center justify-center text-white font-black text-xl border-4 border-white shadow-xl">1</div>
                </div>
                <div className="h-44 w-52 bg-white rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-6 border-t-[12px] border-yellow-400">
                  <p className="font-black text-xl">IronGains</p>
                  <p className="font-black text-yellow-600">15.4k FIT</p>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center order-3 md:order-3 group"
              >
                <div className="relative mb-6">
                  <Avatar className="w-24 h-24 border-4 border-orange-400 shadow-2xl group-hover:scale-105 transition-transform">
                    <AvatarImage src="https://picsum.photos/seed/fit3/100/100" />
                    <AvatarFallback>DL</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black border-4 border-white shadow-lg">3</div>
                </div>
                <div className="h-24 w-36 bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-4 border-t-8 border-orange-400">
                  <p className="font-black text-sm">DegenLifts</p>
                  <p className="text-xs font-bold text-orange-600">10.5k FIT</p>
                </div>
              </motion.div>
            </div>

            {/* Rankings Table */}
            <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white">
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
                  {MOCK_LEADERBOARD.map((user, idx) => (
                    <TableRow 
                      key={user.rank} 
                      className={`
                        h-20 transition-all border-b border-muted/50 last:border-none
                        ${address && address.toLowerCase().includes(user.address.toLowerCase()) ? "bg-primary/5 shadow-inner" : "hover:bg-muted/10"}
                      `}
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
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full w-fit">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-black">{user.streak} d</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end text-primary font-black text-xs gap-1">
                          <ArrowUp className="w-3 h-3" /> 2%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-8 bg-muted/20 text-center">
                <Button variant="ghost" className="font-black uppercase text-xs tracking-widest text-primary hover:text-primary hover:bg-white">Load more athletes</Button>
              </div>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
