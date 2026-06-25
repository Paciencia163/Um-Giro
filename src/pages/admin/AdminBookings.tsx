import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookingRow {
  id: string;
  booking_type: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  total_price: number | null;
  notes: string | null;
  created_at: string | null;
  user_id: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pendente", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmada", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelada", variant: "destructive", icon: XCircle },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    } else {
      toast({ title: "Atualizado", description: `Reserva ${status === "confirmed" ? "confirmada" : "cancelada"}.` });
      fetchBookings();
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-PT") : "—";

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-foreground">Reservas</h2>
            <p className="text-muted-foreground">Gestão de todas as reservas da plataforma.</p>
          </div>
          <div className="flex gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchBookings}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Pessoas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">A carregar...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Nenhuma reserva encontrada.</TableCell></TableRow>
              ) : (
                filtered.map(b => {
                  const sc = statusConfig[b.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="capitalize">{b.booking_type === "itinerary" ? "Roteiro" : "Serviço"}</TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} className="gap-1"><StatusIcon className="w-3 h-3" />{sc.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(b.check_in)}</TableCell>
                      <TableCell>{formatDate(b.check_out)}</TableCell>
                      <TableCell>{b.guests ?? 1}</TableCell>
                      <TableCell>{b.total_price != null ? `${b.total_price.toFixed(2)}€` : "—"}</TableCell>
                      <TableCell>{formatDate(b.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {b.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmar
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(b.id, "cancelled")}>
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
