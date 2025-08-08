import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, ChefHat, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800"
  };

  return (
    <Card className="group overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={recipe.image_url || "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/95 text-orange-700 border-0 shadow-lg rounded-xl px-3 py-1 font-semibold">
            {recipe.category}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {recipe.is_for_sale && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg rounded-xl px-3 py-1 font-medium">
              ${recipe.price}
            </Badge>
          )}
          <Badge 
            className={`${difficultyColors[recipe.difficulty]} border-0 shadow-lg rounded-xl px-3 py-1 font-medium`}
          >
            {recipe.difficulty}
          </Badge>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {recipe.views > 0 && (
            <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {recipe.views}
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">
              {recipe.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {totalTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime}m</span>
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
                <span className="text-xs">({recipe.review_count})</span>
              </div>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-orange-50 text-orange-700 border-orange-200 rounded-full px-2 py-1"
                >
                  #{tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-50 text-gray-500 border-gray-200 rounded-full px-2 py-1"
                >
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <Link to={createPageUrl(`RecipeDetail?id=${recipe.id}`)}>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg rounded-xl font-medium">
              {recipe.is_for_sale ? `Buy Recipe - $${recipe.price}` : "View Recipe"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}