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
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "", image_url: "" });
  const { toast } = useToast();

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon: "", image_url: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      image_url: cat.image_url ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Erro", description: "O nome é obrigatório.", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update({ name: form.name, description: form.description || null, icon: form.icon || null, image_url: form.image_url || null })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Sucesso", description: "Categoria atualizada." });
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ name: form.name, description: form.description || null, icon: form.icon || null, image_url: form.image_url || null });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Sucesso", description: "Categoria criada." });
    }

    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Sucesso", description: "Categoria eliminada." });
    fetchCategories();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-foreground">Categorias</h2>
            <p className="text-muted-foreground">Gerir categorias de serviços e locais.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ícone (nome lucide)</Label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="ex: hotel, utensils" />
                </div>
                <div className="space-y-2">
                  <Label>URL da Imagem</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editing ? "Guardar Alterações" : "Criar Categoria"}
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
                <TableHead>Descrição</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    A carregar...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{cat.description ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.icon ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cat.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {cat.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)}>
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

export default AdminCategories;
