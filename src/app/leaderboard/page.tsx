
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";

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

      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-headline font-bold">Hall of Fame</h1>
          <p className="text-muted-foreground mt-2">The top fit-degen athletes on the blockchain.</p>
        </div>

        <Tabs defaultValue="Weekly" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white p-1 rounded-2xl shadow-sm border h-14 w-full max-w-md">
              <TabsTrigger value="Weekly" className="flex-1 h-12 rounded-xl text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Weekly</TabsTrigger>
              <TabsTrigger value="Monthly" className="flex-1 h-12 rounded-xl text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Monthly</TabsTrigger>
              <TabsTrigger value="AllTime" className="flex-1 h-12 rounded-xl text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">All Time</TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-12">
            {/* Podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-8 px-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center order-2 md:order-1">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 border-4 border-silver-400">
                    <AvatarImage src="https://picsum.photos/seed/fit2/100/100" />
                    <AvatarFallback>FQ</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-800 font-bold border-4 border-white">2</div>
                </div>
                <div className="h-24 w-32 bg-gray-200 rounded-t-3xl flex flex-col items-center justify-center p-4">
                  <p className="font-bold text-sm">FitQueen</p>
                  <p className="text-xs text-gray-600">12.1k FIT</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center order-1 md:order-2">
                <div className="relative mb-4">
                  <Crown className="w-10 h-10 text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                  <Avatar className="w-32 h-32 border-4 border-yellow-500">
                    <AvatarImage src="https://picsum.photos/seed/fit1/100/100" />
                    <AvatarFallback>IG</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">1</div>
                </div>
                <div className="h-40 w-40 bg-yellow-100 rounded-t-3xl flex flex-col items-center justify-center p-4 border-t-4 border-yellow-500">
                  <p className="font-black text-lg">IronGains</p>
                  <p className="font-bold text-yellow-700">15.4k FIT</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center order-3 md:order-3">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 border-4 border-amber-600">
                    <AvatarImage src="https://picsum.photos/seed/fit3/100/100" />
                    <AvatarFallback>DL</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">3</div>
                </div>
                <div className="h-20 w-32 bg-amber-50 rounded-t-3xl flex flex-col items-center justify-center p-4">
                  <p className="font-bold text-sm">DegenLifts</p>
                  <p className="text-xs text-amber-700">10.5k FIT</p>
                </div>
              </div>
            </div>

            {/* Rankings Table */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>FIT Tokens</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_LEADERBOARD.map((user) => (
                    <TableRow key={user.rank} className={address && address.toLowerCase().includes(user.address.toLowerCase()) ? "bg-primary/5 border-l-4 border-primary" : ""}>
                      <TableCell className="font-bold">{user.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://picsum.photos/seed/${user.username}/100/100`} />
                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm leading-none">{user.username}</p>
                            <p className="text-[10px] text-muted-foreground font-code">{user.address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-primary">{user.tokens.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-orange-500" />
                          <span className="text-sm font-medium">{user.streak} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold">View Profile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
