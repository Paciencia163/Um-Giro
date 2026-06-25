import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Booking {
  id: string;
  booking_type: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  total_price: number | null;
  notes: string | null;
  created_at: string | null;
  service_id: string | null;
  itinerary_id: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pendente", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmada", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelada", variant: "destructive", icon: XCircle },
};

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  };

  const cancelBooking = async (id: string) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    fetchBookings();
  };

  const filterByStatus = (status: string) => bookings.filter(b => status === "all" ? true : b.status === status);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-PT") : "—";

  if (authLoading) return <Layout><div className="min-h-[60vh] flex items-center justify-center"><p>A carregar...</p></div></Layout>;

  return (
    <Layout>
      <section className="py-28 min-h-screen">
        <div className="container px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl text-foreground">Minhas Reservas</h1>
                <p className="text-muted-foreground mt-1">Histórico e gestão das suas reservas</p>
              </div>
              <Button onClick={() => navigate("/explorar")}>Nova Reserva</Button>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-6 bg-background border border-border">
                <TabsTrigger value="all">Todas ({bookings.length})</TabsTrigger>
                <TabsTrigger value="pending">Pendentes ({filterByStatus("pending").length})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmadas ({filterByStatus("confirmed").length})</TabsTrigger>
                <TabsTrigger value="cancelled">Canceladas ({filterByStatus("cancelled").length})</TabsTrigger>
              </TabsList>

              {["all", "pending", "confirmed", "cancelled"].map(tab => (
                <TabsContent key={tab} value={tab}>
                  {loading ? (
                    <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>)}</div>
                  ) : filterByStatus(tab).length === 0 ? (
                    <div className="text-center py-16">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filterByStatus(tab).map((booking, i) => {
                        const sc = statusConfig[booking.status] || statusConfig.pending;
                        const StatusIcon = sc.icon;
                        return (
                          <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card>
                              <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <Badge variant={sc.variant} className="gap-1">
                                        <StatusIcon className="w-3 h-3" />{sc.label}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground capitalize">{booking.booking_type === "itinerary" ? "Roteiro" : "Serviço"}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(booking.check_in)} → {formatDate(booking.check_out)}</span>
                                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{booking.guests ?? 1} pessoa(s)</span>
                                    </div>
                                    {booking.notes && <p className="text-sm text-muted-foreground italic">"{booking.notes}"</p>}
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {booking.total_price != null && (
                                      <span className="text-xl font-bold text-primary">{booking.total_price.toFixed(2)}€</span>
                                    )}
                                    <span className="text-xs text-muted-foreground">{formatDate(booking.created_at)}</span>
                                    {booking.status === "pending" && (
                                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => cancelBooking(booking.id)}>
                                        Cancelar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default MyBookings;
