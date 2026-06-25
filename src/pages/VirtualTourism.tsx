import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Play, X, Maximize2, Eye, Video, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-coastal.jpg";

interface VirtualLocation {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  images: string[] | null;
  is_virtual_tour: boolean | null;
  virtual_tour_url: string | null;
  address: string | null;
}

// Sample embedded video data for demo
const sampleVideos = [
  { id: "1", title: "São Tomé — Ilha do Chocolate", thumbnail: "/placeholder.svg", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "5:32" },
  { id: "2", title: "Praias Paradisíacas do Príncipe", thumbnail: "/placeholder.svg", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "8:15" },
  { id: "3", title: "Roça Histórica — Turismo Cultural", thumbnail: "/placeholder.svg", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "4:48" },
  { id: "4", title: "Flora e Fauna de São Tomé", thumbnail: "/placeholder.svg", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "6:20" },
];

const VirtualTourism = () => {
  const [locations, setLocations] = useState<VirtualLocation[]>([]);
  const [allLocations, setAllLocations] = useState<VirtualLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; locationName: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof sampleVideos[0] | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tourist_locations")
      .select("id, name, short_description, description, images, is_virtual_tour, virtual_tour_url, address")
      .order("name");
    
    const all = data ?? [];
    setAllLocations(all);
    setLocations(all.filter(l => l.is_virtual_tour));
    setLoading(false);
  };

  // Collect all images from all locations for the panoramic gallery
  const allImages = allLocations.flatMap(loc =>
    (loc.images ?? []).map(img => ({ url: img, locationName: loc.name }))
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-80 md:h-96 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
        <div className="container relative z-10 px-4 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              <Camera className="w-3 h-3 mr-1" /> Experiência Imersiva
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl text-background mb-3">Turismo Virtual</h1>
            <p className="text-background/80 text-lg max-w-xl">
              Explore São Tomé e Príncipe com imagens panorâmicas 360°, galerias fotográficas e vídeos imersivos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <Tabs defaultValue="panoramic" className="w-full">
            <TabsList className="mb-8 bg-background border border-border">
              <TabsTrigger value="panoramic" className="gap-1.5"><Eye className="w-4 h-4" /> Tours 360°</TabsTrigger>
              <TabsTrigger value="gallery" className="gap-1.5"><Image className="w-4 h-4" /> Galeria Panorâmica</TabsTrigger>
              <TabsTrigger value="videos" className="gap-1.5"><Video className="w-4 h-4" /> Vídeos</TabsTrigger>
            </TabsList>

            {/* 360° Virtual Tours */}
            <TabsContent value="panoramic">
              {loading ? (
                <LoadingSkeleton />
              ) : locations.length === 0 ? (
                <EmptyState message="Nenhum tour virtual 360° disponível ainda." submessage="Os locais com tours virtuais aparecerão aqui." />
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {locations.map((loc, i) => (
                    <motion.div key={loc.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                      <Card className="overflow-hidden card-hover group">
                        {loc.virtual_tour_url ? (
                          <div className="relative aspect-video">
                            <iframe
                              src={loc.virtual_tour_url}
                              className="w-full h-full border-0"
                              allowFullScreen
                              title={`Tour virtual de ${loc.name}`}
                            />
                          </div>
                        ) : (
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={loc.images?.[0] ?? "/placeholder.svg"}
                              alt={loc.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                              <Badge className="bg-background/90 text-foreground gap-1">
                                <Camera className="w-4 h-4" /> 360°
                              </Badge>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-5">
                          <h3 className="font-display text-xl text-foreground mb-1">{loc.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">{loc.short_description ?? loc.description ?? "Tour virtual disponível."}</p>
                          {loc.address && <p className="text-xs text-primary mt-2">{loc.address}</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Panoramic Gallery */}
            <TabsContent value="gallery">
              {loading ? (
                <LoadingSkeleton />
              ) : allImages.length === 0 ? (
                <EmptyState message="Nenhuma imagem panorâmica disponível." submessage="As imagens dos locais turísticos aparecerão aqui." />
              ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {allImages.map((img, i) => (
                    <motion.div
                      key={`${img.url}-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                      className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img.url}
                        alt={img.locationName}
                        className="w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-background text-sm font-medium">{img.locationName}</span>
                          <Maximize2 className="w-4 h-4 text-background" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Videos */}
            <TabsContent value="videos">
              <div className="grid md:grid-cols-2 gap-6">
                {sampleVideos.map((video, i) => (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="overflow-hidden card-hover group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                      <div className="relative aspect-video bg-muted">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center group-hover:bg-foreground/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shadow-strong group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 text-secondary-foreground ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute bottom-3 right-3 bg-foreground/80 text-background">{video.duration}</Badge>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-display text-lg text-foreground">{video.title}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-foreground border-none">
          {selectedImage && (
            <div className="relative">
              <img src={selectedImage.url} alt={selectedImage.locationName} className="w-full max-h-[85vh] object-contain" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground to-transparent">
                <p className="text-background font-medium">{selectedImage.locationName}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-foreground border-none">
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={selectedVideo.embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={selectedVideo.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1,2,3].map(i => (
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

const EmptyState = ({ message, submessage }: { message: string; submessage: string }) => (
  <div className="text-center py-20">
    <Camera className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
    <p className="text-muted-foreground text-lg">{message}</p>
    <p className="text-muted-foreground text-sm mt-1">{submessage}</p>
  </div>
);

export default VirtualTourism;
