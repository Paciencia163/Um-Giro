import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, Clock, DollarSign, ArrowRight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-coastal.jpg";

interface Itinerary {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  duration_days: number | null;
  price: number | null;
  is_featured: boolean | null;
  region_id: string | null;
  points: any;
}

interface Region {
  id: string;
  name: string;
}

const Itineraries = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [itinRes, regRes] = await Promise.all([
        supabase.from("itineraries").select("*").order("is_featured", { ascending: false }),
        supabase.from("regions").select("*"),
      ]);
      setItineraries(itinRes.data ?? []);
      setRegions(regRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getRegionName = (regionId: string | null) => {
    if (!regionId) return null;
    return regions.find((r) => r.id === regionId)?.name ?? null;
  };

  const getPointsCount = (points: any): number => {
    if (Array.isArray(points)) return points.length;
    return 0;
  };

  const placeholderImage = "/placeholder.svg";

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-72 md:h-80 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/40 to-transparent" />
        <div className="container relative z-10 px-4 pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center">
                <Map className="w-6 h-6 text-background" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-background">Roteiros Turísticos</h1>
            </div>
            <p className="text-background/80 text-lg max-w-2xl">
              Descubra roteiros cuidadosamente planeados para cada região. Adquira o seu e explore com confiança.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Itineraries Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-52 bg-muted rounded-t-lg" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-20">
              <Map className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">Nenhum roteiro disponível</h3>
              <p className="text-muted-foreground">Os roteiros turísticos serão adicionados brevemente.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {itineraries.map((itin, index) => {
                const regionName = getRegionName(itin.region_id);
                const pointsCount = getPointsCount(itin.points);

                return (
                  <motion.div
                    key={itin.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden card-hover group h-full flex flex-col">
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={itin.image_url ?? placeholderImage}
                          alt={itin.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                        {itin.is_featured && (
                          <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-0">
                            ⭐ Destaque
                          </Badge>
                        )}

                        {itin.price != null && (
                          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur-sm">
                            <span className="text-lg font-bold text-primary">{itin.price.toFixed(2)}€</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6 flex-1">
                        <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                          {itin.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                          {itin.short_description ?? itin.description ?? "Explore este roteiro turístico."}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {itin.duration_days && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{itin.duration_days} {itin.duration_days === 1 ? "dia" : "dias"}</span>
                            </div>
                          )}
                          {regionName && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-secondary" />
                              <span>{regionName}</span>
                            </div>
                          )}
                          {pointsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Map className="w-4 h-4 text-primary" />
                              <span>{pointsCount} pontos</span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="px-6 pb-6 pt-0">
                        <Button className="w-full" variant="default">
                          Ver Roteiro
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Itineraries;
