import { MapPin } from "lucide-react";

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-20">
    <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
    <p className="text-muted-foreground text-lg">{message}</p>
    <p className="text-muted-foreground text-sm mt-1">Tente ajustar os filtros de pesquisa.</p>
  </div>
);

export default EmptyState;
