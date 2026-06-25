import { useEffect, useState } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserRole = Tables<"user_roles">;

interface UserWithRole extends Profile {
  role: string;
  role_id: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles && roles) {
      const merged = profiles.map((p) => {
        const userRole = roles.find((r) => r.user_id === p.id);
        return {
          ...p,
          role: userRole?.role ?? "tourist",
          role_id: userRole?.id ?? "",
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, roleId: string, newRole: string) => {
    if (roleId) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole as any })
        .eq("id", roleId);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole as any });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
    }
    toast({ title: "Sucesso", description: "Papel atualizado." });
    fetchUsers();
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-primary/10 text-primary",
      provider: "bg-golden/10 text-golden-dark",
      tourist: "bg-muted text-muted-foreground",
    };
    const labels: Record<string, string> = {
      admin: "Administrador",
      provider: "Prestador",
      tourist: "Turista",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role] ?? styles.tourist}`}>
        {role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
        {labels[role] ?? role}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-3xl text-foreground">Utilizadores</h2>
          <p className="text-muted-foreground">Gerir utilizadores e seus papéis.</p>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel Atual</TableHead>
                <TableHead>Alterar Papel</TableHead>
                <TableHead>Registado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum utilizador encontrado.</TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.id, u.role_id, v)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tourist">Turista</SelectItem>
                          <SelectItem value="provider">Prestador</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-PT") : "—"}
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

export default AdminUsers;
