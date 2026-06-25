import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Users, FileText, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const serviceId = searchParams.get("service");
  const itineraryId = searchParams.get("itinerary");
  const bookingType = itineraryId ? "itinerary" : "service";

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/reservar");
      return;
    }
    fetchItemDetails();
  }, [authLoading, user]);

  const fetchItemDetails = async () => {
    if (serviceId) {
      const { data } = await supabase.from("services").select("name, price").eq("id", serviceId).maybeSingle();
      if (data) { setItemName(data.name); setItemPrice(data.price); }
    } else if (itineraryId) {
      const { data } = await supabase.from("itineraries").select("name, price").eq("id", itineraryId).maybeSingle();
      if (data) { setItemName(data.name); setItemPrice(data.price); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const numGuests = parseInt(guests) || 1;
    const totalPrice = itemPrice ? itemPrice * numGuests : null;

    // 1. Create booking with pending status
    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: serviceId || null,
      itinerary_id: itineraryId || null,
      booking_type: bookingType,
      check_in: checkIn || null,
      check_out: checkOut || null,
      guests: numGuests,
      total_price: totalPrice,
      notes: notes || null,
      status: "pending",
    }).select("id").single();

    if (error || !booking) {
      setSubmitting(false);
      toast({ title: "Erro", description: "Não foi possível criar a reserva.", variant: "destructive" });
      return;
    }

    // 2. Redirect to Stripe Checkout
    if (totalPrice && totalPrice > 0) {
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke("create-payment", {
        body: {
          bookingId: booking.id,
          itemName: itemName,
          totalPrice: totalPrice,
        },
      });

      if (paymentError || !paymentData?.url) {
        setSubmitting(false);
        toast({ title: "Erro no pagamento", description: "Não foi possível iniciar o pagamento. A reserva ficará pendente.", variant: "destructive" });
        navigate("/minhas-reservas");
        return;
      }

      window.location.href = paymentData.url;
      return;
    }

    // No price — just confirm
    setSubmitting(false);
    toast({ title: "Reserva criada!", description: "A sua reserva foi submetida com sucesso." });
    navigate("/minhas-reservas");
  };

  if (authLoading) return <Layout><div className="min-h-[60vh] flex items-center justify-center"><p>A carregar...</p></div></Layout>;

  const totalEstimated = itemPrice ? itemPrice * parseInt(guests || "1") : 0;

  return (
    <Layout>
      <section className="py-28 bg-muted/30 min-h-screen">
        <div className="container px-4 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Nova Reserva</CardTitle>
                {itemName && (
                  <p className="text-muted-foreground">
                    {bookingType === "itinerary" ? "Roteiro" : "Serviço"}: <strong className="text-foreground">{itemName}</strong>
                    {itemPrice != null && <span className="ml-2 text-primary font-bold">{itemPrice.toFixed(2)}€</span>}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!serviceId && !itineraryId && (
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-muted-foreground">Selecione um serviço ou roteiro na página <strong>Explorar</strong> ou <strong>Roteiros</strong> para fazer uma reserva.</p>
                      <Button variant="outline" className="mt-3" onClick={() => navigate("/explorar")}>
                        Ir para Explorar
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkin"><CalendarDays className="w-4 h-4 inline mr-1" />Check-in</Label>
                      <Input id="checkin" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout"><CalendarDays className="w-4 h-4 inline mr-1" />Check-out</Label>
                      <Input id="checkout" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests"><Users className="w-4 h-4 inline mr-1" />Número de pessoas</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "pessoa" : "pessoas"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {itemPrice != null && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total estimado</span>
                        <span className="text-2xl font-bold text-primary">{totalEstimated.toFixed(2)}€</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes"><FileText className="w-4 h-4 inline mr-1" />Notas (opcional)</Label>
                    <Textarea id="notes" placeholder="Pedidos especiais, alergias, etc." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting || (!serviceId && !itineraryId)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {submitting ? "A processar..." : totalEstimated > 0 ? `Pagar ${totalEstimated.toFixed(2)}€` : "Confirmar Reserva"}
                  </Button>

                  {totalEstimated > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Será redirecionado para o Stripe para pagamento seguro
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BookingForm;
