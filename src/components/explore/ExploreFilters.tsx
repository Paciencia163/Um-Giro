import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";
import { useState } from "react";

interface Region {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export interface FilterState {
  searchQuery: string;
  selectedRegion: string;
  selectedCategory: string;
  priceRange: [number, number];
  onlyAvailable: boolean;
  onlyFeatured: boolean;
}

interface ExploreFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  regions: Region[];
  categories: Category[];
  maxPrice: number;
  activeTab: string;
}

const ExploreFilters = ({ filters, onFiltersChange, regions, categories, maxPrice, activeTab }: ExploreFiltersProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const update = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.selectedRegion !== "all" ||
    filters.selectedCategory !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.onlyAvailable ||
    filters.onlyFeatured;

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: "",
      selectedRegion: "all",
      selectedCategory: "all",
      priceRange: [0, maxPrice],
      onlyAvailable: false,
      onlyFeatured: false,
    });
  };

  return (
    <section className="bg-background sticky top-20 z-30 border-b border-border shadow-soft">
      <div className="container px-4 py-4 space-y-3">
        {/* Primary row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou descrição..."
              className="pl-10"
              value={filters.searchQuery}
              onChange={(e) => update({ searchQuery: e.target.value })}
            />
          </div>
          <Select value={filters.selectedRegion} onValueChange={(v) => update({ selectedRegion: v })}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Regiões</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.selectedCategory} onValueChange={(v) => update({ selectedCategory: v })}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="default" className="gap-2 relative">
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Advanced filters */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleContent>
            <div className="pt-2 pb-1 border-t border-border mt-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price range - only for services tab */}
              {activeTab === "services" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Faixa de Preço: {filters.priceRange[0].toFixed(0)}€ – {filters.priceRange[1].toFixed(0)}€
                  </Label>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={5}
                    value={filters.priceRange}
                    onValueChange={(v) => update({ priceRange: v as [number, number] })}
                    className="w-full"
                  />
                </div>
              )}

              {/* Toggles */}
              <div className="flex items-center gap-6">
                {activeTab === "services" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="available"
                      checked={filters.onlyAvailable}
                      onCheckedChange={(v) => update({ onlyAvailable: v })}
                    />
                    <Label htmlFor="available" className="text-sm cursor-pointer">Apenas disponíveis</Label>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={filters.onlyFeatured}
                    onCheckedChange={(v) => update({ onlyFeatured: v })}
                  />
                  <Label htmlFor="featured" className="text-sm cursor-pointer">Apenas destaques</Label>
                </div>
              </div>

              {/* Clear */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <X className="w-3.5 h-3.5" /> Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default ExploreFilters;
