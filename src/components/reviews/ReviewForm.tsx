import { useState, useRef } from "react";
import { Camera, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  targetType: "service" | "location";
  targetId: string;
  onSubmitted: () => void;
}

const ReviewForm = ({ targetType, targetId, onSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="text-center py-6 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground text-sm">
          <a href="/auth" className="text-primary underline">Faça login</a> para deixar uma avaliação.
        </p>
      </div>
    );
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Selecione uma classificação", variant: "destructive" });
      return;
    }
    if (comment.trim().length > 1000) {
      toast({ title: "Comentário demasiado longo (máx. 1000 caracteres)", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("review-images")
          .upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      // Insert review
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        images: imageUrls,
        ...(targetType === "service" ? { service_id: targetId } : { location_id: targetId }),
      });

      if (error) throw error;

      toast({ title: "Avaliação publicada com sucesso!" });
      setRating(0);
      setComment("");
      setImages([]);
      setPreviews([]);
      onSubmitted();
    } catch (err: any) {
      toast({ title: "Erro ao publicar avaliação", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
      <h4 className="font-display text-lg text-foreground">Deixe a sua avaliação</h4>
      <StarRating rating={rating} onRate={setRating} size="lg" interactive />

      <Textarea
        placeholder="Partilhe a sua experiência... (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
      />

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={images.length >= 5}
          className="gap-1"
        >
          <Camera className="w-4 h-4" /> Fotos ({images.length}/5)
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={submitting || rating === 0} className="gap-1 ml-auto">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Publicar
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;
