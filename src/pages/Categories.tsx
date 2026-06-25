import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag, ArrowRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean | null;
}

const iconMap: Record<string, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  car: "🚗",
  church: "⛪",
  heritage: "🏛️",
  beach: "🏖️",
  mountain: "⛰️",
  museum: "🏛️",
  park: "🌳",
  shopping: "🛍️",
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      setCategories(data ?? []);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const getEmoji = (icon: string | null, name: string) => {
    if (icon && iconMap[icon.toLowerCase()]) return iconMap[icon.toLowerCase()];
    const nameKey = name.toLowerCase();
    for (const [key, emoji] of Object.entries(iconMap)) {
      if (nameKey.includes(key)) return emoji;
    }
    return "📍";
  };

  const placeholderImage = "/placeholder.svg";

  return (
    <Layout>
      {/* Page Header */}
      <section className="pt-28 pb-16 bg-primary">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-primary-foreground">Categorias</h1>
            </div>
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              Explore os serviços e locais turísticos organizados por categoria. Cada categoria é criada pelo administrador para facilitar a sua navegação.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-44 bg-muted rounded-t-lg" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">Nenhuma categoria disponível</h3>
              <p className="text-muted-foreground">As categorias serão adicionadas pelo administrador em breve.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/explorar?category=${cat.id}`}>
                    <Card className="overflow-hidden card-hover group cursor-pointer h-full">
                      <div className="relative h-44 overflow-hidden">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <span className="text-6xl">{getEmoji(cat.icon, cat.name)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-display text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                              {cat.name}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {cat.description ?? "Explore os locais e serviços desta categoria."}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Categories;
