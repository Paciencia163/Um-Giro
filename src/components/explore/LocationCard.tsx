import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

const LocationCard = ({
  location,
  index,
}: {
  location: TouristLocation;
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
        onClick={() => navigate(`/detalhe/local/${location.id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={location.images?.[0] ?? "/placeholder.svg"}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {location.is_featured && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              Destaque
            </span>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-xl text-foreground mb-2">{location.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {location.short_description ?? "Sem descrição disponível."}
          </p>
          {location.address && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{location.address}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LocationCard;
