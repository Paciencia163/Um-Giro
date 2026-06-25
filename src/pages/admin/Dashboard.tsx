import { useEffect, useState } from "react";
import { FolderOpen, MapPin, Briefcase, Users } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  categories: number;
  locations: number;
  services: number;
  users: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ categories: 0, locations: 0, services: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [catRes, locRes, svcRes, usrRes] = await Promise.all([
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("tourist_locations").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        categories: catRes.count ?? 0,
        locations: locRes.count ?? 0,
        services: svcRes.count ?? 0,
        users: usrRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Categorias", value: stats.categories, icon: FolderOpen, color: "bg-primary" },
    { label: "Locais Turísticos", value: stats.locations, icon: MapPin, color: "bg-secondary" },
    { label: "Serviços", value: stats.services, icon: Briefcase, color: "bg-ocean" },
    { label: "Utilizadores", value: stats.users, icon: Users, color: "bg-golden" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-3xl text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral da plataforma Um Giro.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-6 shadow-soft">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
