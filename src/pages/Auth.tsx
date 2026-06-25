import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-coastal.jpg";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("tab") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Bem-vindo de volta!", description: "Login efetuado com sucesso." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Bem-vindo ao Um Giro." });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message === "Invalid login credentials" 
          ? "Email ou password incorretos." 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="max-w-md mx-auto w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">Um Giro</span>
          </div>

          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isLogin
                ? "Entre na sua conta para continuar a explorar."
                : "Registe-se para começar a sua aventura."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="O seu nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "A processar..." : isLogin ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Registar" : "Entrar"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right - Image */}
      <div
        className="hidden lg:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="w-full h-full bg-gradient-to-r from-background to-transparent" />
      </div>
    </div>
  );
};

export default Auth;
