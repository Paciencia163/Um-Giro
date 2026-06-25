import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">Um Giro</span>
            </Link>
            <p className="text-background/70 mb-6">
              Descubra destinos incríveis e viva experiências únicas. A sua plataforma de turismo de confiança.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Explorar</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/explorar" className="text-background/70 hover:text-background transition-colors">
                  Destinos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-background/70 hover:text-background transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/roteiros" className="text-background/70 hover:text-background transition-colors">
                  Roteiros Turísticos
                </Link>
              </li>
              <li>
                <Link to="/turismo-virtual" className="text-background/70 hover:text-background transition-colors">
                  Turismo Virtual
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/categorias" className="text-background/70 hover:text-background transition-colors">
                  Hotéis
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-background/70 hover:text-background transition-colors">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-background/70 hover:text-background transition-colors">
                  Rent-a-Car
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-background/70 hover:text-background transition-colors">
                  Património Cultural
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-background/70">
                <Mail className="w-5 h-5 text-primary" />
                info@umgiro.com
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <Phone className="w-5 h-5 text-primary" />
                +244 923 456 789
              </li>
              <li className="flex items-start gap-3 text-background/70">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                Luanda, Angola
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {currentYear} Um Giro. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/termos" className="text-background/50 hover:text-background transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-background/50 hover:text-background transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
