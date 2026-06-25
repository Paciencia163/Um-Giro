import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, MapPin, Search, ShieldCheck, MessageSquare, Trophy, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" as any })
            .then(({ data }) => setIsAdmin(!!data));
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" as any })
          .then(({ data }) => setIsAdmin(!!data));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { href: "/explorar", label: "Explorar" },
    { href: "/categorias", label: "Categorias" },
    { href: "/roteiros", label: "Roteiros" },
    { href: "/turismo-virtual", label: "Turismo Virtual" },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isHome = location.pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              isScrolled || !isHome ? "bg-primary" : "bg-primary-foreground/20 backdrop-blur-sm"
            }`}>
              <MapPin className={`w-5 h-5 ${
                isScrolled || !isHome ? "text-primary-foreground" : "text-primary-foreground"
              }`} />
            </div>
            <span className={`font-display text-2xl font-bold ${
              isScrolled || !isHome ? "text-foreground" : "text-primary-foreground"
            }`}>
              Um Giro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-medium transition-colors duration-200 link-underline ${
                  isActive(link.href)
                    ? isScrolled || !isHome
                      ? "text-primary"
                      : "text-primary-foreground"
                    : isScrolled || !isHome
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={isScrolled || !isHome ? "" : "text-primary-foreground hover:bg-primary-foreground/10"}
            >
              <Search className="w-5 h-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isScrolled || !isHome ? "outline" : "hero-outline"}
                    size="default"
                  >
                    <User className="w-4 h-4" />
                    <span>Minha Conta</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Administração
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/painel" className="cursor-pointer">
                      Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mensagens" className="cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mensagens
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/minhas-reservas" className="cursor-pointer">
                      Minhas Reservas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/fidelidade" className="cursor-pointer">
                      <Trophy className="w-4 h-4 mr-2" />
                      Fidelidade
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pagamentos" className="cursor-pointer">
                      <Receipt className="w-4 h-4 mr-2" />
                      Pagamentos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button
                    variant={isScrolled || !isHome ? "ghost" : "ghost"}
                    className={isScrolled || !isHome ? "" : "text-primary-foreground hover:bg-primary-foreground/10"}
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button variant={isScrolled || !isHome ? "default" : "hero"}>
                    Registar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`lg:hidden ${
              isScrolled || !isHome ? "" : "text-primary-foreground hover:bg-primary-foreground/10"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2 pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/mensagens" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mensagens
                      </Button>
                    </Link>
                    <Link to="/painel" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Painel
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Entrar</Button>
                    </Link>
                    <Link to="/auth?tab=signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full">Registar</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
