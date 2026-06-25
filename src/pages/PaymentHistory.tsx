import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Receipt, CheckCircle, Clock, XCircle, Download, CreditCard } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaymentBooking {
  id: string;
  booking_type: string;
  status: string;
  total_price: number | null;
  created_at: string | null;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  service_id: string | null;
  itinerary_id: string | null;
}

interface ServiceInfo {
  id: string;
  name: string;
}

interface ItineraryInfo {
  id: string;
  name: string;
}

const paymentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  confirmed: { label: "Pago", variant: "default", icon: CheckCircle },
  pending: { label: "Pendente", variant: "outline", icon: Clock },
  cancelled: { label: "Cancelado", variant: "destructive", icon: XCircle },
};

const PaymentHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<PaymentBooking[]>([]);
  const [services, setServices] = useState<Record<string, string>>({});
  const [itineraries, setItineraries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchPayments();
  }, [user, authLoading]);

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user!.id)
      .not("total_price", "is", null)
      .order("created_at", { ascending: false });

    const items = data ?? [];
    setBookings(items);

    // Fetch service & itinerary names
    const serviceIds = [...new Set(items.filter(b => b.service_id).map(b => b.service_id!))];
    const itineraryIds = [...new Set(items.filter(b => b.itinerary_id).map(b => b.itinerary_id!))];

    const [sRes, iRes] = await Promise.all([
      serviceIds.length > 0
        ? supabase.from("services").select("id, name").in("id", serviceIds)
        : Promise.resolve({ data: [] as ServiceInfo[] }),
      itineraryIds.length > 0
        ? supabase.from("itineraries").select("id, name").in("id", itineraryIds)
        : Promise.resolve({ data: [] as ItineraryInfo[] }),
    ]);

    const sMap: Record<string, string> = {};
    (sRes.data ?? []).forEach((s: ServiceInfo) => { sMap[s.id] = s.name; });
    setServices(sMap);

    const iMap: Record<string, string> = {};
    (iRes.data ?? []).forEach((i: ItineraryInfo) => { iMap[i.id] = i.name; });
    setItineraries(iMap);

    setLoading(false);
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-PT") : "—";
  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "—";

  const getItemName = (booking: PaymentBooking) => {
    if (booking.service_id && services[booking.service_id]) return services[booking.service_id];
    if (booking.itinerary_id && itineraries[booking.itinerary_id]) return itineraries[booking.itinerary_id];
    return booking.booking_type === "itinerary" ? "Roteiro" : "Serviço";
  };

  const totalPaid = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0);

  const totalPending = bookings
    .filter(b => b.status === "pending")
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0);

  const generatePdfReceipt = useCallback((booking: PaymentBooking) => {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [37, 99, 75]; // teal-ish brand
    const gray: [number, number, number] = [120, 120, 120];
    const dark: [number, number, number] = [30, 30, 30];

    // Header band
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, w, 42, "F");

    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("Um Giro", 20, 28);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Plataforma de Turismo", 20, 36);

    // "RECIBO" badge
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO", w - 20, 28, { align: "right" });

    // Reference & Date
    let y = 58;
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Referência:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(booking.id.slice(0, 8).toUpperCase(), 60, y);

    doc.setFont("helvetica", "bold");
    doc.text("Data:", w / 2 + 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDateTime(booking.created_at), w / 2 + 30, y);

    // Divider
    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, y, w - 20, y);

    // Details section
    y += 14;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Detalhes da Reserva", 20, y);

    y += 12;
    doc.setFontSize(10);
    const details: [string, string][] = [
      ["Item", getItemName(booking)],
      ["Tipo", booking.booking_type === "itinerary" ? "Roteiro" : "Serviço"],
    ];
    if (booking.check_in) details.push(["Check-in", formatDate(booking.check_in)]);
    if (booking.check_out) details.push(["Check-out", formatDate(booking.check_out)]);
    details.push(["Pessoas", String(booking.guests ?? 1)]);
    details.push(["Estado", "Pago ✓"]);

    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...gray);
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);
      doc.text(value, 70, y);
      y += 8;
    });

    // Total box
    y += 6;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, y - 2, w - 40, 22, 3, 3, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gray);
    doc.text("TOTAL", 28, y + 13);
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text(`${(booking.total_price ?? 0).toFixed(2)} EUR`, w - 28, y + 14, { align: "right" });

    // Footer
    y = 260;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, w - 20, y);
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento serve como comprovativo de pagamento.", w / 2, y, { align: "center" });
    doc.text("Um Giro — Plataforma de Turismo | umgiro.pt", w / 2, y + 5, { align: "center" });
    doc.text(`Gerado em ${new Date().toLocaleString("pt-PT")}`, w / 2, y + 10, { align: "center" });

    doc.save(`recibo-${booking.id.slice(0, 8)}.pdf`);
  }, [bookings, services, itineraries]);

  if (authLoading) return <Layout><div className="min-h-[60vh] flex items-center justify-center"><p>A carregar...</p></div></Layout>;

  return (
    <Layout>
      <section className="py-28 min-h-screen">
        <div className="container px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl text-foreground flex items-center gap-3">
                  <Receipt className="w-8 h-8 text-primary" />
                  Histórico de Pagamentos
                </h1>
                <p className="text-muted-foreground mt-1">Consulte todos os seus pagamentos e recibos</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Transações</p>
                    <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pago</p>
                    <p className="text-2xl font-bold text-foreground">{totalPaid.toFixed(2)}€</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendente</p>
                    <p className="text-2xl font-bold text-foreground">{totalPending.toFixed(2)}€</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/explorar")}>
                  Explorar Serviços
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking, i) => {
                  const sc = paymentStatusConfig[booking.status] || paymentStatusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-foreground">{getItemName(booking)}</h3>
                                <Badge variant={sc.variant} className="gap-1 text-xs">
                                  <StatusIcon className="w-3 h-3" />{sc.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>Ref: {booking.id.slice(0, 8).toUpperCase()}</span>
                                <span>{formatDateTime(booking.created_at)}</span>
                                <span className="capitalize">{booking.booking_type === "itinerary" ? "Roteiro" : "Serviço"}</span>
                              </div>
                              {booking.check_in && (
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(booking.check_in)} → {formatDate(booking.check_out)} · {booking.guests ?? 1} pessoa(s)
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-primary whitespace-nowrap">
                                {(booking.total_price ?? 0).toFixed(2)}€
                              </span>
                              {booking.status === "confirmed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() => generatePdfReceipt(booking)}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  PDF
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
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentHistory;
