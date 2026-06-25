import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="py-28 min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="font-display text-2xl font-bold">Pagamento Cancelado</h1>
            <p className="text-muted-foreground">O pagamento não foi concluído. A sua reserva ficará pendente.</p>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => navigate("/minhas-reservas")}>Ver Reservas</Button>
              <Button variant="outline" onClick={() => navigate("/explorar")}>Explorar</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default PaymentCanceled;
