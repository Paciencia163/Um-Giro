import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
}

const ServiceCard = ({
  service,
  index,
}: {
  service: Service;
  index: number;
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <Card
        className="overflow-hidden card-hover group cursor-pointer"
        onClick={() => navigate(`/detalhe/servico/${service.id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.images?.[0] ?? "/placeholder.svg"}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {service.is_available === false && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
              Indisponível
            </span>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-xl text-foreground mb-2">{service.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {service.short_description ?? "Sem descrição disponível."}
          </p>
          <div className="flex items-center justify-between">
            <div>
              {service.price != null && (
                <span className="text-lg font-bold text-primary">
                  {service.price.toFixed(2)}€
                  <span className="text-sm text-muted-foreground font-normal">/{service.price_unit ?? "noite"}</span>
                </span>
              )}
              {service.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{service.address}</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/reservar?service=${service.id}`);
              }}
            >
              Reservar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
