
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.tourist_locations(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT review_target CHECK (
    (service_id IS NOT NULL AND location_id IS NULL) OR
    (service_id IS NULL AND location_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true);

-- Storage policies
CREATE POLICY "Anyone can view review images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'review-images');

CREATE POLICY "Users can delete own review images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'review-images' AND (storage.foldername(name))[1] = auth.uid()::text);
