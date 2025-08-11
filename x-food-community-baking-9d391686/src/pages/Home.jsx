
import React, { useState, useEffect } from "react";
import { Bake, Circle, User, Recipe } from "@/services/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, TrendingUp, Users, ChefHat, Settings, MapPin, Star, Clock } from "lucide-react";
import BakeCard from "../components/shared/BakeCard";
import CircleCard from "../components/shared/CircleCard";
import RecipeCard from "../components/shared/RecipeCard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AUTH_CONFIG } from '@/config/auth';

export default function Home() {
  const [bakes, setBakes] = useState([]);
  const [circles, setCircles] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [topBakers, setTopBakers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState("bakes");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const TASTE_TAGS = [
    "vegan", "gluten-free", "dairy-free", "sugar-free", "keto", "organic",
    "chocolate", "vanilla", "strawberry", "lemon", "cinnamon", "nuts"
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      // Only fetch bakes for now since circles and recipes have backend issues
      const bakesData = await Bake.list({ limit: 50 });

      setBakes(bakesData || []);
      setCircles([]);
      setRecipes([]);
      setTopBakers([]);
    } catch (error) {
      console.error("Error loading home data:", error);
      setBakes([]);
      setCircles([]);
      setRecipes([]);
      setTopBakers([]);
    }
    setIsLoading(false);
  };

  const handleTagClick = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getFilteredContent = () => {
    let content = [];
    
    if (activeTab === "bakes") content = bakes;
    else if (activeTab === "recipes") content = recipes;
    else if (activeTab === "circles") content = circles;
    
    return content.filter((item) => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = !locationFilter || 
        (item.pickup_location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
         item.location?.toLowerCase().includes(locationFilter.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => item.tags?.includes(tag));
      
      return matchesSearch && matchesLocation && matchesTags;
    });
  };

  const filteredContent = getFilteredContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Temporary Debug Info - Remove after fixing OAuth */}
      <div className="fixed top-20 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded z-50 text-xs">
        <strong>Debug Info:</strong><br/>
        Google Client ID: {AUTH_CONFIG.GOOGLE.CLIENT_ID}<br/>
        Environment: {import.meta.env.MODE}<br/>
        Base URL: {AUTH_CONFIG.API.BASE_URL}<br/>
        Raw Env: {import.meta.env.VITE_GOOGLE_CLIENT_ID}
      </div>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Share Your
              <span className="block bg-white text-gray-800 mt-4 px-8 py-4 font-black rounded-3xl inline-block shadow-2xl">
                Homemade Magic
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
              Connect with local bakers, share recipes, and discover amazing homemade treats in your community
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("AddBake")}>
                <Button size="lg" className="bg-white/95 text-orange-600 hover:bg-white shadow-xl rounded-2xl px-8 py-4 font-semibold">
                  <ChefHat className="w-5 h-5 mr-2" />
                  Share a Bake
                </Button>
              </Link>
              <Link to={createPageUrl("Circles")}>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-2xl px-8 py-4 font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  Join a Circle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-8 border border-gray-100">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search bakes, recipes, circles, bakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg bg-white border-gray-200 focus:border-orange-400 rounded-xl shadow-sm"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-600 border-orange-300 hover:bg-orange-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-12 py-3 bg-white border-gray-200 focus:border-orange-400 rounded-xl shadow-sm"
              />
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card className="bg-white/70 backdrop-blur-sm border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Filter by Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {TASTE_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                            : "text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-600"
                        } rounded-full px-4 py-2`}
                        onClick={() => handleTagClick(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTags([]);
                        setLocationFilter("");
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedTags.length > 0 || locationFilter) && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full cursor-pointer"
                onClick={() => handleTagClick(tag)}
              >
                #{tag} ×
              </Badge>
            ))}
            {locationFilter && (
              <Badge
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full cursor-pointer"
                onClick={() => setLocationFilter("")}
              >
                📍 {locationFilter} ×
              </Badge>
            )}
          </div>
        )}

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-center p-6 rounded-3xl shadow-xl">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">{bakes.length}</h3>
            <p className="text-orange-100 font-medium text-sm">Fresh Bakes</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-3xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">{circles.length}</h3>
            <p className="text-purple-100 font-medium text-sm">Active Circles</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-3xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">{recipes.length}</h3>
            <p className="text-pink-100 font-medium text-sm">Shared Recipes</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-3xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">{topBakers.length}</h3>
            <p className="text-indigo-100 font-medium text-sm">Top Bakers</p>
          </div>
        </section>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm border border-gray-100 p-1.5 shadow-lg rounded-2xl">
              <TabsTrigger value="bakes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2 font-semibold text-gray-700">
                Fresh Bakes ({bakes.length})
              </TabsTrigger>
              <TabsTrigger value="recipes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2 font-semibold text-gray-700">
                Recipes ({recipes.length})
              </TabsTrigger>
              <TabsTrigger value="circles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2 font-semibold text-gray-700">
                Circles ({circles.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bakes" className="space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContent.map((bake) => (
                  <BakeCard key={bake.id} bake={bake} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bakes found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedTags.length > 0 || locationFilter
                    ? "Try adjusting your search criteria" 
                    : "Be the first to share a bake with the community!"
                  }
                </p>
                <Link to={createPageUrl("AddBake")}>
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg">
                    Share Your First Bake
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipes" className="space-y-8">
            {filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or be the first to share!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="circles" className="space-y-8">
            {filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((circle) => (
                  <CircleCard key={circle.id} circle={circle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No circles found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or create a new circle!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
