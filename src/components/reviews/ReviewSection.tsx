import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string | null;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

interface ReviewSectionProps {
  targetType: "service" | "location";
  targetId: string;
}

const ReviewSection = ({ targetType, targetId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const col = targetType === "service" ? "service_id" : "location_id";
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq(col, targetId)
      .order("created_at", { ascending: false });

    if (!reviewsData || reviewsData.length === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for review authors
    const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map(profilesData?.map((p) => [p.id, p]) ?? []);

    const enriched: Review[] = reviewsData.map((r) => ({
      ...r,
      profile: profileMap.get(r.user_id) ?? null,
    }));

    setReviews(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [targetId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao eliminar", variant: "destructive" });
    } else {
      fetchReviews();
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <StarRating rating={Math.round(avgRating)} size="md" />
        <span className="text-foreground font-semibold">{avgRating.toFixed(1)}</span>
        <span className="text-muted-foreground text-sm">({reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""})</span>
      </div>

      {/* Form */}
      <ReviewForm targetType={targetType} targetId={targetId} onSubmitted={fetchReviews} />

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2 p-4 border border-border rounded-lg">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">Ainda sem avaliações. Seja o primeiro!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-border rounded-lg bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {review.profile?.avatar_url ? (
                    <img src={review.profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.profile?.full_name ?? "Utilizador"}
                    </p>
                    {review.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: pt })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {user?.id === review.user_id && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteReview(review.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              {review.comment && (
                <p className="text-sm text-foreground/90">{review.comment}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
