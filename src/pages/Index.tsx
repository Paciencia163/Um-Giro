import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Hotel, Utensils, Car, Church, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-coastal.jpg";
import hotelImage from "@/assets/hotel-exterior.jpg";
import restaurantImage from "@/assets/restaurant-interior.jpg";
import townImage from "@/assets/town-aerial.jpg";

const categories = [
  { icon: Hotel, name: "Hotéis", count: 38, color: "bg-primary" },
  { icon: Utensils, name: "Restaurantes", count: 65, color: "bg-secondary" },
  { icon: Car, name: "Rent-a-Car", count: 19, color: "bg-primary" },
  { icon: Church, name: "Igrejas", count: 42, color: "bg-secondary" },
  { icon: Compass, name: "Património", count: 57, color: "bg-primary" },
  { icon: MapPin, name: "Locais", count: 140, color: "bg-secondary" },
];

const featuredDestinations = [
  { image: townImage, name: "Quedas de Kalandula", region: "Malanje", rating: 4.9 },
  { image: hotelImage, name: "Resort Baía de Luanda", region: "Luanda", rating: 4.8 },
  { image: restaurantImage, name: "Sabores de Angola", region: "Benguela", rating: 4.7 },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/30 to-foreground/70" />
        
        <div className="container relative z-10 text-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm text-background text-sm font-medium mb-6 border border-background/30">
              Descubra Angola
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-background mb-6 leading-tight">
              Dê Um Giro<br />
              <span className="text-secondary">por Angola</span>
            </h1>
            <p className="text-xl md:text-2xl text-background/80 max-w-2xl mx-auto mb-10">
              Explore as maravilhas de Angola, desde as Quedas de Kalandula às praias do Namibe e a vibrante cultura de Luanda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explorar">
                <Button variant="hero" size="xl">
                  Explorar Destinos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/turismo-virtual">
                <Button variant="hero-outline" size="xl">
                  Turismo Virtual
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Explore por Categorias
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre exatamente o que procura entre as nossas diversas categorias de serviços turísticos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/categorias`}
                  className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.count} locais</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                Destinos em Destaque
              </h2>
              <p className="text-lg text-muted-foreground">
                Os locais mais populares entre os nossos visitantes.
              </p>
            </div>
            <Link to="/explorar">
              <Button variant="outline" size="lg">
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-strong transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                    <span>★ {destination.rating}</span>
                  </div>
                  <h3 className="font-display text-2xl text-background mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-background/70 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {destination.region}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-6">
            Pronto para a Aventura?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Registe-se gratuitamente e comece a planear a sua próxima viagem hoje mesmo.
          </p>
          <Link to="/auth?tab=signup">
            <Button variant="hero-outline" size="xl">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
