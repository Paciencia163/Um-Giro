import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking");

  useEffect(() => {
    if (bookingId) {
      supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId).then();
    }
  }, [bookingId]);

  return (
    <Layout>
      <section className="py-28 min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="font-display text-2xl font-bold">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground">A sua reserva foi confirmada com sucesso. Receberá os detalhes por email.</p>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => navigate("/minhas-reservas")}>Ver Reservas</Button>
              <Button variant="outline" onClick={() => navigate("/")}>Início</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default PaymentSuccess;
