import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  is_active: boolean | null;
  stock: number | null;
  category: string | null;
  discount_percent: number | null;
}

const AdminRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    points_cost: 100,
    image_url: "",
    is_active: true,
    stock: "",
    discount_percent: "",
  });

  const fetchRewards = async () => {
    setLoading(true);
    const { data } = await supabase.from("rewards").select("*").order("points_cost", { ascending: true });
    setRewards(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRewards(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", points_cost: 100, image_url: "", is_active: true, stock: "", discount_percent: "" });
    setEditing(null);
  };

  const openEdit = (reward: Reward) => {
    setEditing(reward);
    setForm({
      name: reward.name,
      description: reward.description ?? "",
      points_cost: reward.points_cost,
      image_url: reward.image_url ?? "",
      is_active: reward.is_active ?? true,
      stock: reward.stock?.toString() ?? "",
      discount_percent: reward.discount_percent?.toString() ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.points_cost <= 0) {
      toast({ title: "Preencha o nome e custo em pontos", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      points_cost: form.points_cost,
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
      stock: form.stock ? parseInt(form.stock) : null,
      discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
    };

    if (editing) {
      const { error } = await supabase.from("rewards").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Erro ao atualizar", variant: "destructive" });
      else toast({ title: "Recompensa atualizada" });
    } else {
      const { error } = await supabase.from("rewards").insert(payload);
      if (error) toast({ title: "Erro ao criar", variant: "destructive" });
      else toast({ title: "Recompensa criada" });
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchRewards();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rewards").delete().eq("id", id);
    if (error) toast({ title: "Erro ao eliminar", variant: "destructive" });
    else fetchRewards();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recompensas</h1>
          <p className="text-muted-foreground text-sm">Gerir catálogo de recompensas do programa de fidelidade</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Recompensa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Nova"} Recompensa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Custo (pontos)</Label>
                  <Input type="number" min={1} value={form.points_cost} onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Stock (vazio = ilimitado)</Label>
                  <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Desconto (%)</Label>
                <Input type="number" min={0} max={100} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
              <div>
                <Label>URL da imagem</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Ativa</Label>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? "Guardar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma recompensa criada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.points_cost}</TableCell>
                  <TableCell>{r.discount_percent ? `${r.discount_percent}%` : "—"}</TableCell>
                  <TableCell>{r.stock ?? "∞"}</TableCell>
                  <TableCell>{r.is_active ? "Ativa" : "Inativa"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRewards;
