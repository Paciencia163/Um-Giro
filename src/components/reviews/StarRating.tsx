import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const sizeMap = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

const StarRating = ({ rating, onRate, size = "md", interactive = false }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            "transition-colors",
            interactive && "cursor-pointer",
            (interactive ? hovered || rating : rating) >= star
              ? "fill-secondary text-secondary"
              : "text-muted-foreground/30"
          )}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
