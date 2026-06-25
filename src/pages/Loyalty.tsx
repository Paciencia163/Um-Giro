import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Gift, Star, TrendingUp, Clock, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface LoyaltyPoints {
  balance: number;
  total_earned: number;
  total_redeemed: number;
}

interface Transaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  is_active: boolean | null;
  stock: number | null;
  category: string | null;
  discount_percent: number | null;
}

interface Redemption {
  id: string;
  reward_id: string;
  points_spent: number;
  status: string;
  code: string;
  created_at: string;
  reward?: Reward;
}

const tierConfig = [
  { name: "Bronze", min: 0, color: "text-amber-700", bg: "bg-amber-100", icon: "🥉" },
  { name: "Prata", min: 200, color: "text-gray-500", bg: "bg-gray-100", icon: "🥈" },
  { name: "Ouro", min: 500, color: "text-yellow-600", bg: "bg-yellow-100", icon: "🥇" },
  { name: "Platina", min: 1000, color: "text-blue-600", bg: "bg-blue-100", icon: "💎" },
];

const getTier = (totalEarned: number) => {
  for (let i = tierConfig.length - 1; i >= 0; i--) {
    if (totalEarned >= tierConfig[i].min) return tierConfig[i];
  }
  return tierConfig[0];
};

const getNextTier = (totalEarned: number) => {
  for (const tier of tierConfig) {
    if (totalEarned < tier.min) return tier;
  }
  return null;
};

const Loyalty = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [pointsRes, txRes, rewardsRes, redemptionsRes] = await Promise.all([
      supabase.from("loyalty_points").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("loyalty_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("rewards").select("*").eq("is_active", true).order("points_cost", { ascending: true }),
      supabase.from("reward_redemptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    setPoints(pointsRes.data ?? { balance: 0, total_earned: 0, total_redeemed: 0 });
    setTransactions(txRes.data ?? []);
    setRewards(rewardsRes.data ?? []);

    // Enrich redemptions with reward names
    const rdData = redemptionsRes.data ?? [];
    if (rdData.length > 0) {
      const rewardIds = [...new Set(rdData.map((r) => r.reward_id))];
      const { data: rewardDetails } = await supabase.from("rewards").select("*").in("id", rewardIds);
      const rewardMap = new Map((rewardDetails ?? []).map((r) => [r.id, r] as const));
      setRedemptions(rdData.map((r) => ({ ...r, reward: rewardMap.get(r.reward_id) })));
    } else {
      setRedemptions([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleRedeem = async (reward: Reward) => {
    if (!user || !points) return;
    if (points.balance < reward.points_cost) {
      toast({ title: "Pontos insuficientes", variant: "destructive" });
      return;
    }

    setRedeeming(reward.id);
    try {
      // Create redemption
      const { error: redeemErr } = await supabase.from("reward_redemptions").insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_cost,
      });
      if (redeemErr) throw redeemErr;

      // Deduct points via RPC
      const { error: pointsErr } = await supabase.rpc("award_loyalty_points", {
        _user_id: user.id,
        _points: -reward.points_cost,
        _type: "redeem",
        _description: `Resgate: ${reward.name}`,
      });
      if (pointsErr) throw pointsErr;

      toast({ title: "Recompensa resgatada!", description: `Confira o código no seu histórico.` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro ao resgatar", description: err.message, variant: "destructive" });
    } finally {
      setRedeeming(null);
    }
  };

  if (authLoading) {
    return <Layout><div className="container px-4 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">Faça login para aceder ao programa de fidelidade.</p>
          <Button onClick={() => navigate("/auth")}>Entrar</Button>
        </div>
      </Layout>
    );
  }

  const tier = getTier(points?.total_earned ?? 0);
  const nextTier = getNextTier(points?.total_earned ?? 0);
  const progressToNext = nextTier
    ? ((points?.total_earned ?? 0) / nextTier.min) * 100
    : 100;

  const typeIcons: Record<string, typeof Star> = {
    earn: TrendingUp,
    redeem: Gift,
    bonus: Award,
    expire: Clock,
  };

  const typeLabels: Record<string, string> = {
    earn: "Ganho",
    redeem: "Resgate",
    bonus: "Bónus",
    expire: "Expirado",
  };

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl text-foreground mb-2">Programa de Fidelidade</h1>
          <p className="text-muted-foreground mb-8">Ganhe pontos em cada reserva e troque por recompensas exclusivas.</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              {/* Balance */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-4xl font-bold text-primary">{points?.balance ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Pontos disponíveis</p>
                </CardContent>
              </Card>

              {/* Tier */}
              <Card>
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-2 block">{tier.icon}</span>
                  <p className={`text-xl font-bold ${tier.color}`}>Nível {tier.name}</p>
                  {nextTier && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{points?.total_earned ?? 0} pts</span>
                        <span>{nextTier.min} pts</span>
                      </div>
                      <Progress value={Math.min(progressToNext, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Faltam {nextTier.min - (points?.total_earned ?? 0)} pts para {nextTier.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total ganho</span>
                    <span className="font-semibold text-foreground">+{points?.total_earned ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total resgatado</span>
                    <span className="font-semibold text-foreground">-{points?.total_redeemed ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recompensas</span>
                    <span className="font-semibold text-foreground">{redemptions.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Rewards catalog */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-display text-2xl text-foreground mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-primary" /> Recompensas
              </h2>
              {rewards.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma recompensa disponível de momento.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {rewards.map((reward) => {
                    const canAfford = (points?.balance ?? 0) >= reward.points_cost;
                    const outOfStock = reward.stock !== null && reward.stock <= 0;
                    return (
                      <Card key={reward.id} className="overflow-hidden">
                        {reward.image_url && (
                          <img src={reward.image_url} alt={reward.name} className="w-full h-32 object-cover" />
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-display text-lg text-foreground">{reward.name}</h3>
                            <Badge variant={canAfford ? "default" : "secondary"} className="flex-shrink-0">
                              {reward.points_cost} pts
                            </Badge>
                          </div>
                          {reward.description && (
                            <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                          )}
                          {reward.discount_percent && (
                            <p className="text-sm text-primary font-semibold mb-3">{reward.discount_percent}% de desconto</p>
                          )}
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={!canAfford || outOfStock || redeeming === reward.id}
                            onClick={() => handleRedeem(reward)}
                          >
                            {redeeming === reward.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : outOfStock ? (
                              "Esgotado"
                            ) : canAfford ? (
                              "Resgatar"
                            ) : (
                              "Pontos insuficientes"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* My redemptions */}
            {redemptions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="font-display text-2xl text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" /> Meus Resgates
                </h2>
                <div className="space-y-3 mb-8">
                  {redemptions.map((rd) => (
                    <Card key={rd.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{rd.reward?.name ?? "Recompensa"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(rd.created_at), { addSuffix: true, locale: pt })}
                          </p>
                        </div>
                        <div className="text-right">
                          <code className="bg-muted px-3 py-1 rounded text-sm font-mono text-foreground">{rd.code}</code>
                          <Badge variant={rd.status === "used" ? "secondary" : "default"} className="ml-2">
                            {rd.status === "pending" ? "Ativo" : rd.status === "used" ? "Usado" : "Expirado"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Transaction history */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="font-display text-2xl text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" /> Histórico
              </h2>
              {transactions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Sem transações ainda. Faça a sua primeira reserva!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => {
                    const Icon = typeIcons[tx.type] ?? Star;
                    const isPositive = tx.points > 0;
                    return (
                      <Card key={tx.id}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
                            <Icon className={`w-4 h-4 ${isPositive ? "text-green-600" : "text-red-600"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {tx.description ?? typeLabels[tx.type] ?? tx.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: pt })}
                            </p>
                          </div>
                          <span className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}{tx.points} pts
                          </span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* How it works */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Como funciona?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">1</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">Reserve</h4>
                      <p className="text-sm text-muted-foreground">Faça reservas de serviços e ganhe pontos automaticamente.</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">2</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">Acumule</h4>
                      <p className="text-sm text-muted-foreground">Ganhe 1 ponto por cada euro gasto (mínimo 10 pontos).</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">3</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">Resgate</h4>
                      <p className="text-sm text-muted-foreground">Troque os seus pontos por descontos e experiências exclusivas.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Loyalty;
