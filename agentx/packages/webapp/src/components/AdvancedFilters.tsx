"use client";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Filter, X, Search, TrendingUp, DollarSign, Tag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterOptions {
  search: string;
  categories: string[];
  priceRange: { min: number; max: number };
  sortBy: "recent" | "price-low" | "price-high" | "trending" | "likes";
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalResults: number;
}

const CATEGORIES = [
  "All", "Trading", "Research", "Gaming", "Art", "Development", 
  "Marketing", "Analytics", "Music", "Health", "Education", "DeFi", "Productivity"
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Listed", icon: Sparkles },
  { value: "price-low", label: "Price: Low to High", icon: DollarSign },
  { value: "price-high", label: "Price: High to Low", icon: DollarSign },
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "likes", label: "Most Liked", icon: Tag },
];

export function AdvancedFilters({ onFilterChange, totalResults }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    categories: [],
    priceRange: { min: 0, max: 10 },
    sortBy: "recent"
  });

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleCategory = (category: string) => {
    if (category === "All") {
      updateFilters({ categories: [] });
    } else {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories, category];
      updateFilters({ categories: newCategories });
    }
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      search: "",
      categories: [],
      priceRange: { min: 0, max: 10 },
      sortBy: "recent"
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) + 
    filters.categories.length + 
    (filters.priceRange.min > 0 || filters.priceRange.max < 10 ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search INFTs by name, category, or creator..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          className="border-purple-400/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-purple-500 text-white text-xs px-1.5 py-0.5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-400 whitespace-nowrap">
          {totalResults} results
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="gradient-card border-white/10 overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* Sort By */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Sort By
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant="outline"
                          size="sm"
                          className={`border-purple-400/30 transition-all ${
                            filters.sortBy === option.value
                              ? "bg-purple-500/30 text-purple-200 border-purple-400/60"
                              : "text-gray-400 hover:text-white hover:bg-purple-500/10"
                          }`}
                          onClick={() => updateFilters({ sortBy: option.value as any })}
                        >
                          <Icon className="w-3 h-3 mr-1.5" />
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => {
                      const isActive = category === "All" 
                        ? filters.categories.length === 0
                        : filters.categories.includes(category);
                      
                      return (
                        <Badge
                          key={category}
                          variant="outline"
                          className={`cursor-pointer transition-all ${
                            isActive
                              ? "bg-blue-500/30 text-blue-200 border-blue-400/60"
                              : "border-white/20 text-gray-400 hover:text-white hover:bg-blue-500/10"
                          }`}
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Price Range (POL)
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange.min}
                        onChange={(e) => updateFilters({ 
                          priceRange: { ...filters.priceRange, min: parseFloat(e.target.value) || 0 }
                        })}
                        className="bg-white/5 border-white/10 focus:border-green-400/50 text-white"
                      />
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) => updateFilters({ 
                          priceRange: { ...filters.priceRange, max: parseFloat(e.target.value) || 10 }
                        })}
                        className="bg-white/5 border-white/10 focus:border-green-400/50 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

