
-- Loyalty points balance per user
CREATE TABLE public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_redeemed integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty transactions log
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'expire')),
  description text,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  reward_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Available rewards catalog
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  stock integer,
  category text DEFAULT 'discount',
  discount_percent numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Redeemed rewards tracking
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  code text NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Loyalty points: users see own
CREATE POLICY "Users can view own points" ON public.loyalty_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all points" ON public.loyalty_points
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Loyalty transactions: users see own
CREATE POLICY "Users can view own transactions" ON public.loyalty_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" ON public.loyalty_transactions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Rewards: viewable by everyone
CREATE POLICY "Rewards are viewable by everyone" ON public.rewards
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage rewards" ON public.rewards
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reward redemptions: users see own
CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON public.reward_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all redemptions" ON public.reward_redemptions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: award points to user (called from edge function or trigger)
CREATE OR REPLACE FUNCTION public.award_loyalty_points(
  _user_id uuid,
  _points integer,
  _type text DEFAULT 'earn',
  _description text DEFAULT NULL,
  _booking_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert loyalty_points
  INSERT INTO public.loyalty_points (user_id, balance, total_earned)
  VALUES (_user_id, _points, CASE WHEN _type IN ('earn', 'bonus') THEN _points ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE
  SET
    balance = loyalty_points.balance + _points,
    total_earned = CASE WHEN _type IN ('earn', 'bonus')
      THEN loyalty_points.total_earned + _points
      ELSE loyalty_points.total_earned END,
    total_redeemed = CASE WHEN _type = 'redeem'
      THEN loyalty_points.total_redeemed + ABS(_points)
      ELSE loyalty_points.total_redeemed END,
    updated_at = now();

  -- Log transaction
  INSERT INTO public.loyalty_transactions (user_id, points, type, description, booking_id)
  VALUES (_user_id, _points, _type, _description, _booking_id);
END;
$$;

-- Auto-award points when booking is confirmed (trigger on bookings)
CREATE OR REPLACE FUNCTION public.award_booking_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only award when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status <> 'confirmed') THEN
    -- Award 1 point per euro spent (minimum 10 points)
    PERFORM public.award_loyalty_points(
      NEW.user_id,
      GREATEST(10, COALESCE(NEW.total_price, 0)::integer),
      'earn',
      'Pontos por reserva confirmada',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_booking_confirm
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.award_booking_points();
