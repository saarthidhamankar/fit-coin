
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, Package, Truck, CheckCircle2, ShoppingBag, Clock, User, Phone, MapPin } from "lucide-react";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole, isLoading: adminLoading } = useDoc(adminDocRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("timestamp", "desc"));
  }, [db]);

  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);

  useEffect(() => {
    if (!isUserLoading && !adminLoading && !adminRole) {
      router.push("/");
      toast({ variant: "destructive", title: "Access Denied", description: "Admin credentials required." });
    }
  }, [adminRole, adminLoading, isUserLoading, router, toast]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast({ title: "Order Updated", description: `Status changed to ${newStatus}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed", description: "Permissions check failed." });
    }
  };

  if (isUserLoading || adminLoading || !adminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative mesh-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Crown className="w-8 h-8 text-yellow-500 animate-pulse" />
               <h1 className="text-5xl font-headline font-black uppercase italic tracking-tighter">Admin <span className="text-primary not-italic">Console</span></h1>
            </div>
            <p className="text-muted-foreground font-medium text-lg">Managing global FITCoin redemptions and fulfillment.</p>
          </div>
          <div className="flex gap-4">
             <Card className="rounded-3xl p-6 pro-glass border-none flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Orders</p>
                   <p className="text-2xl font-black">{orders?.length || 0}</p>
                </div>
             </Card>
          </div>
        </motion.div>

        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden pro-glass">
          <CardHeader className="bg-muted/30 border-b p-10">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase italic">
              <Truck className="w-6 h-6 text-primary" /> Fulfillment Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-20 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
            ) : orders && orders.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-none">
                    <TableHead className="px-10 font-black uppercase text-[10px] tracking-widest">Date / ID</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Athlete</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Product</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Shipping Info</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="text-right px-10 font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                      <TableCell className="px-10">
                        <div className="flex items-center gap-2 mb-1">
                           <Clock className="w-3 h-3 text-muted-foreground" />
                           <span className="text-xs font-bold">{new Date(order.timestamp?.toDate ? order.timestamp.toDate() : order.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] font-code text-muted-foreground">{order.id.slice(0, 8)}...</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                           <div>
                              <p className="font-black text-sm">{order.shippingDetails?.fullName}</p>
                              <p className="text-[10px] text-muted-foreground">{order.userEmail}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-4 h-4 text-primary" /></div>
                           <div>
                              <p className="font-black text-sm">{order.productName}</p>
                              <p className="text-[10px] font-black text-primary">{order.fitCoinsSpent} FIT</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-[11px] font-medium"><MapPin className="w-3 h-3" /> {order.shippingDetails?.address}, {order.shippingDetails?.city}</div>
                           <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><Phone className="w-3 h-3" /> {order.shippingDetails?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                          order.status === 'order_confirmed' ? 'bg-blue-500 text-white' : 
                          order.status === 'shipped' ? 'bg-orange-500 text-white' : 'bg-primary text-white'
                        )}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                         {order.status === 'order_confirmed' ? (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'shipped')} className="rounded-xl font-black text-[10px] uppercase h-9 px-4 bg-orange-500 hover:bg-orange-600">
                               <Truck className="w-3 h-3 mr-2" /> Mark Shipped
                            </Button>
                         ) : order.status === 'shipped' ? (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')} className="rounded-xl font-black text-[10px] uppercase h-9 px-4 bg-primary">
                               <CheckCircle2 className="w-3 h-3 mr-2" /> Mark Delivered
                            </Button>
                         ) : (
                            <span className="text-[10px] font-black uppercase text-primary flex items-center justify-end gap-1">
                               <CheckCircle2 className="w-3 h-3" /> Fulfilled
                            </span>
                         )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-20 text-center space-y-4">
                 <Package className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                 <p className="font-black uppercase tracking-widest text-muted-foreground">No orders pending fulfillment.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
