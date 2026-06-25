import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

type Location = Tables<"tourist_locations">;
type Region = Tables<"regions">;
type Category = Tables<"categories">;

const emptyForm = {
  name: "",
  description: "",
  short_description: "",
  address: "",
  region_id: "",
  category_id: "",
  latitude: "",
  longitude: "",
};

const AdminLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchData = async () => {
    const [locRes, regRes, catRes] = await Promise.all([
      supabase.from("tourist_locations").select("*").order("name"),
      supabase.from("regions").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setLocations(locRes.data ?? []);
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

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setForm({
      name: loc.name,
      description: loc.description ?? "",
      short_description: loc.short_description ?? "",
      address: loc.address ?? "",
      region_id: loc.region_id ?? "",
      category_id: loc.category_id ?? "",
      latitude: loc.latitude?.toString() ?? "",
      longitude: loc.longitude?.toString() ?? "",
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
      address: form.address || null,
      region_id: form.region_id || null,
      category_id: form.category_id || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };

    if (editing) {
      const { error } = await supabase.from("tourist_locations").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Sucesso", description: "Local atualizado." });
    } else {
      const { error } = await supabase.from("tourist_locations").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Sucesso", description: "Local criado." });
    }

    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tourist_locations").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Sucesso", description: "Local eliminado." });
    fetchData();
  };

  const getRegionName = (id: string | null) => regions.find((r) => r.id === id)?.name ?? "—";
  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-foreground">Locais Turísticos</h2>
            <p className="text-muted-foreground">Gerir locais e pontos de interesse.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Local
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Local" : "Novo Local"}</DialogTitle>
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
                <div className="space-y-2">
                  <Label>Morada</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-8.839" />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="13.289" />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editing ? "Guardar Alterações" : "Criar Local"}
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
                <TableHead>Região</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Morada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell>
                </TableRow>
              ) : locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum local encontrado.</TableCell>
                </TableRow>
              ) : (
                locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell className="text-muted-foreground">{getRegionName(loc.region_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{getCategoryName(loc.category_id)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{loc.address ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(loc.id)}>
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

export default AdminLocations;
