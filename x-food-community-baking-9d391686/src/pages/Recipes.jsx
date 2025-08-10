
import React, { useState, useEffect } from "react";
import { Recipe } from "@/services/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, Clock, Users, Star, ChefHat, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CATEGORIES = ["all", "pastries", "cakes", "breads", "cookies", "cupcakes", "pies"];
const DIFFICULTY_LEVELS = ["all", "easy", "medium", "hard"];

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await Recipe.list("-created_date", 50);
      setRecipes(data);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
    setIsLoading(false);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || recipe.difficulty === selectedDifficulty;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "free" && !recipe.is_for_sale) ||
                      (activeTab === "premium" && recipe.is_for_sale);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesTab;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Recipe Collection
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Discover amazing recipes from our baking community, from beginner-friendly to masterclass level
            </p>
            
            <Link to={createPageUrl("AddRecipe")}>
              <Button size="lg" className="bg-white/95 text-orange-600 hover:bg-white shadow-2xl rounded-2xl px-8 py-4 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Share Recipe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search recipes by name or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 bg-white border-gray-200 focus:border-orange-300 rounded-2xl shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Category:</span>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg rounded-xl" : "rounded-xl"}
                  >
                    {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              {DIFFICULTY_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={selectedDifficulty === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(level)}
                  className={selectedDifficulty === level ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg rounded-xl" : "rounded-xl"}
                >
                  {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/80 backdrop-blur-sm border-0 p-1.5 mb-8 shadow-lg rounded-2xl">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2 font-medium">
              All Recipes
            </TabsTrigger>
            <TabsTrigger value="free" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2 font-medium">
              Free Recipes
            </TabsTrigger>
            <TabsTrigger value="premium" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2 font-medium">
              Premium Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <Card key={recipe.id} className="group overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={recipe.image_url || "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-orange-700 border-0 shadow-sm">
                          {recipe.category}
                        </Badge>
                      </div>
                      {recipe.is_for_sale && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-yellow-500 text-white border-0 shadow-sm">
                            ${recipe.price}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <Badge 
                          variant="outline" 
                          className={`bg-white/90 border-0 shadow-sm ${
                            recipe.difficulty === 'easy' ? 'text-green-700' :
                            recipe.difficulty === 'medium' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}
                        >
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {recipe.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {recipe.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            {recipe.prep_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{recipe.prep_time + (recipe.cook_time || 0)}m</span>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{recipe.servings}</span>
                              </div>
                            )}
                          </div>
                          
                          {recipe.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{recipe.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {recipe.tags && recipe.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {recipe.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Link to={createPageUrl(`RecipeDetail?id=${recipe.id}`)}>
                          <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg">
                            {recipe.is_for_sale ? `Buy Recipe - $${recipe.price}` : "View Recipe"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all"
                    ? "Try adjusting your search criteria" 
                    : "Be the first to share a recipe with the community!"
                  }
                </p>
                <Link to={createPageUrl("AddRecipe")}>
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Share First Recipe
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
