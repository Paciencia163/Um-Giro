import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;
type Region = Tables<"regions">;
type Category = Tables<"categories">;

const emptyForm = {
  name: "",
  description: "",
  short_description: "",
  price: "",
  price_unit: "noite",
  address: "",
  phone: "",
  email: "",
  website: "",
  region_id: "",
  category_id: "",
};

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    const [svcRes, regRes, catRes] = await Promise.all([
      supabase.from("services").select("*").order("name"),
      supabase.from("regions").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setServices(svcRes.data ?? []);
    setRegions(regRes.data ?? []);
    setCategories(catRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditing(svc);
    setForm({
      name: svc.name,
      description: svc.description ?? "",
      short_description: svc.short_description ?? "",
      price: svc.price?.toString() ?? "",
      price_unit: svc.price_unit ?? "noite",
      address: svc.address ?? "",
      phone: svc.phone ?? "",
      email: svc.email ?? "",
      website: svc.website ?? "",
      region_id: svc.region_id ?? "",
      category_id: svc.category_id ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Erro", description: "O nome é obrigatório.", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      short_description: form.short_description || null,
      price: form.price ? parseFloat(form.price) : null,
      price_unit: form.price_unit || "noite",
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      region_id: form.region_id || null,
      category_id: form.category_id || null,
    };

    if (editing) {
      const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Sucesso", description: "Serviço atualizado." });
    } else {
      const { error } = await supabase.from("services").insert({ ...payload, provider_id: user!.id });
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Sucesso", description: "Serviço criado." });
    }

    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Sucesso", description: "Serviço eliminado." });
    fetchData();
  };

  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";
  const getRegionName = (id: string | null) => regions.find((r) => r.id === id)?.name ?? "—";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-foreground">Serviços</h2>
            <p className="text-muted-foreground">Gerir serviços turísticos.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição curta</Label>
                  <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição completa</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preço</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade de preço</Label>
                    <Select value={form.price_unit} onValueChange={(v) => setForm({ ...form, price_unit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="noite">por noite</SelectItem>
                        <SelectItem value="dia">por dia</SelectItem>
                        <SelectItem value="pessoa">por pessoa</SelectItem>
                        <SelectItem value="unidade">unidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Região</Label>
                    <Select value={form.region_id} onValueChange={(v) => setForm({ ...form, region_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Morada</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editing ? "Guardar Alterações" : "Criar Serviço"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Região</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum serviço encontrado.</TableCell>
                </TableRow>
              ) : (
                services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-medium">{svc.name}</TableCell>
                    <TableCell className="text-muted-foreground">{getCategoryName(svc.category_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{getRegionName(svc.region_id)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {svc.price ? `${svc.price}€/${svc.price_unit}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(svc)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(svc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
