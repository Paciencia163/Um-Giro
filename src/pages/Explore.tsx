import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import ExploreFilters, { FilterState } from "@/components/explore/ExploreFilters";
import LocationCard from "@/components/explore/LocationCard";
import ServiceCard from "@/components/explore/ServiceCard";
import EmptyState from "@/components/explore/EmptyState";
import heroImage from "@/assets/town-aerial.jpg";

interface TouristLocation {
  id: string;
  name: string;
  short_description: string | null;
  images: string[] | null;
  address: string | null;
  is_featured: boolean | null;
  region_id: string | null;
  category_id: string | null;
}

interface Service {
  id: string;
  name: string;
  short_description: string | null;
  images: string[] | null;
  price: number | null;
  price_unit: string | null;
  is_available: boolean | null;
  address: string | null;
  category_id: string | null;
  region_id: string | null;
  is_featured: boolean | null;
}

interface Region {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const Explore = () => {
  const [locations, setLocations] = useState<TouristLocation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("locations");

  const maxPrice = useMemo(() => {
    const prices = services.map((s) => s.price ?? 0);
    return Math.max(500, ...prices);
  }, [services]);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedRegion: "all",
    selectedCategory: "all",
    priceRange: [0, 500],
    onlyAvailable: false,
    onlyFeatured: false,
  });

  // Update price range max when data loads
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      priceRange: [f.priceRange[0], Math.max(f.priceRange[1], maxPrice)],
    }));
  }, [maxPrice]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [locRes, svcRes, regRes, catRes] = await Promise.all([
      supabase.from("tourist_locations").select("*"),
      supabase.from("services").select("*"),
      supabase.from("regions").select("*"),
      supabase.from("categories").select("*").eq("is_active", true),
    ]);
    setLocations(locRes.data ?? []);
    setServices(svcRes.data ?? []);
    setRegions(regRes.data ?? []);
    setCategories(catRes.data ?? []);
    setLoading(false);
  };

  const filteredLocations = useMemo(() => {
    const q = filters.searchQuery.toLowerCase();
    return locations.filter((loc) => {
      const matchesSearch =
        loc.name.toLowerCase().includes(q) ||
        (loc.short_description?.toLowerCase().includes(q) ?? false) ||
        (loc.address?.toLowerCase().includes(q) ?? false);
      const matchesRegion = filters.selectedRegion === "all" || loc.region_id === filters.selectedRegion;
      const matchesCategory = filters.selectedCategory === "all" || loc.category_id === filters.selectedCategory;
      const matchesFeatured = !filters.onlyFeatured || loc.is_featured;
      return matchesSearch && matchesRegion && matchesCategory && matchesFeatured;
    });
  }, [locations, filters]);

  const filteredServices = useMemo(() => {
    const q = filters.searchQuery.toLowerCase();
    return services.filter((svc) => {
      const matchesSearch =
        svc.name.toLowerCase().includes(q) ||
        (svc.short_description?.toLowerCase().includes(q) ?? false) ||
        (svc.address?.toLowerCase().includes(q) ?? false);
      const matchesRegion = filters.selectedRegion === "all" || svc.region_id === filters.selectedRegion;
      const matchesCategory = filters.selectedCategory === "all" || svc.category_id === filters.selectedCategory;
      const matchesPrice =
        (svc.price ?? 0) >= filters.priceRange[0] && (svc.price ?? 0) <= filters.priceRange[1];
      const matchesAvailable = !filters.onlyAvailable || svc.is_available !== false;
      const matchesFeatured = !filters.onlyFeatured || svc.is_featured;
      return matchesSearch && matchesRegion && matchesCategory && matchesPrice && matchesAvailable && matchesFeatured;
    });
  }, [services, filters]);

  const SkeletonGrid = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-muted rounded-t-lg" />
          <CardContent className="p-5 space-y-3">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-72 md:h-80 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
        <div className="container relative z-10 px-4 pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-4xl md:text-5xl text-background mb-2">Explorar</h1>
            <p className="text-background/80 text-lg">Descubra locais turísticos e serviços incríveis</p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <ExploreFilters
        filters={filters}
        onFiltersChange={setFilters}
        regions={regions}
        categories={categories}
        maxPrice={maxPrice}
        activeTab={activeTab}
      />

      {/* Content */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 bg-background border border-border">
              <TabsTrigger value="locations">Locais Turísticos ({filteredLocations.length})</TabsTrigger>
              <TabsTrigger value="services">Serviços ({filteredServices.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="locations">
              {loading ? (
                <SkeletonGrid />
              ) : filteredLocations.length === 0 ? (
                <EmptyState message="Nenhum local turístico encontrado." />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLocations.map((loc, i) => (
                    <LocationCard key={loc.id} location={loc} index={i} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="services">
              {loading ? (
                <SkeletonGrid />
              ) : filteredServices.length === 0 ? (
                <EmptyState message="Nenhum serviço encontrado." />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((svc, i) => (
                    <ServiceCard key={svc.id} service={svc} index={i} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Explore;
