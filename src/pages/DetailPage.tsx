import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Globe, Phone, Mail, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ReviewSection from "@/components/reviews/ReviewSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const DetailPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !id) return;
    const table = type === "servico" ? "services" : "tourist_locations";
    supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setItem(data);
        setLoading(false);
      });
  }, [type, id]);

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg">Item não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/explorar")}>
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  const isService = type === "servico";
  const images = item.images ?? [];
  const targetType = isService ? "service" : "location";

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-4xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        {/* Images */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden mb-6"
          >
            <img
              src={images[0]}
              alt={item.name}
              className="w-full h-64 md:h-96 object-cover"
            />
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {images.slice(1).map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-border" />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="font-display text-3xl text-foreground">{item.name}</h1>
              {item.address && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{item.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {item.is_featured && <Badge variant="secondary">Destaque</Badge>}
              {isService && item.is_available === false && <Badge variant="destructive">Indisponível</Badge>}
              {isService && item.price != null && (
                <span className="text-xl font-bold text-primary">
                  {item.price.toFixed(2)}€
                  <span className="text-sm text-muted-foreground font-normal">/{item.price_unit ?? "noite"}</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground/80 leading-relaxed mb-6">
            {item.description ?? item.short_description ?? "Sem descrição disponível."}
          </p>

          {/* Contact info for services */}
          {isService && (item.phone || item.email || item.website) && (
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              {item.phone && (
                <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {item.phone}
                </a>
              )}
              {item.email && (
                <a href={`mailto:${item.email}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Mail className="w-4 h-4" /> {item.email}
                </a>
              )}
              {item.website && (
                <a href={item.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          )}

          {/* Action buttons for services */}
          {isService && (
            <div className="flex gap-3 mb-8 flex-wrap">
              {item.is_available !== false && (
                <Button onClick={() => navigate(`/reservar?service=${item.id}`)}>
                  Reservar agora
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  if (!user) {
                    toast({ title: "Faça login para enviar uma mensagem", variant: "destructive" });
                    navigate("/auth");
                    return;
                  }
                  if (!item.provider_id || user.id === item.provider_id) return;

                  // Find or create conversation
                  const p1 = user.id < item.provider_id ? user.id : item.provider_id;
                  const p2 = user.id < item.provider_id ? item.provider_id : user.id;

                  const { data: existing } = await supabase
                    .from("conversations")
                    .select("id")
                    .eq("participant_1", p1)
                    .eq("participant_2", p2)
                    .eq("service_id", item.id)
                    .maybeSingle();

                  if (existing) {
                    navigate(`/mensagens?conv=${existing.id}`);
                  } else {
                    const { data: newConv, error } = await supabase
                      .from("conversations")
                      .insert({ participant_1: p1, participant_2: p2, service_id: item.id })
                      .select("id")
                      .single();
                    if (error) {
                      toast({ title: "Erro ao iniciar conversa", variant: "destructive" });
                    } else {
                      navigate(`/mensagens?conv=${newConv.id}`);
                    }
                  }
                }}
              >
                <MessageSquare className="w-4 h-4" /> Contactar fornecedor
              </Button>
            </div>
          )}
        </motion.div>

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-display text-2xl text-foreground mb-4">Avaliações</h2>
          <ReviewSection targetType={targetType} targetId={id!} />
        </motion.div>
      </div>
    </Layout>
  );
};

export default DetailPage;
