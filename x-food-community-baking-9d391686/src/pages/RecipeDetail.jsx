import React, { useState, useEffect } from "react";
import { Recipe, User } from "@/services/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Users, ArrowLeft, ShoppingCart, Heart, Share, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecipeDetail() {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadRecipeDetail();
  }, []);

  const loadRecipeDetail = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) {
      navigate(createPageUrl("Recipes"));
      return;
    }

    try {
      const recipeData = await Recipe.list();
      const foundRecipe = recipeData.find(r => r.id === recipeId);
      
      if (!foundRecipe) {
        navigate(createPageUrl("Recipes"));
        return;
      }
      
      setRecipe(foundRecipe);
      
      // Load author info
      const users = await User.list();
      const authorData = users.find(u => u.email === foundRecipe.created_by);
      setAuthor(authorData);
      
    } catch (error) {
      console.error("Error loading recipe details:", error);
    }
    setIsLoading(false);
  };

  const handlePurchase = () => {
    alert(`Purchase ${recipe.title} for $${recipe.price}! Payment integration would go here.`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h2>
          <Button onClick={() => navigate(createPageUrl("Recipes"))}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 bg-white/70 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image and Basic Info */}
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl">
              <img
                src={recipe.image_url || "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-purple-700 border-0 shadow-sm">
                  {recipe.category}
                </Badge>
              </div>
              {recipe.is_for_sale && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-white border-0 shadow-sm">
                    ${recipe.price}
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-4 left-4">
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

            {/* Recipe Stats */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {recipe.prep_time && (
                    <div>
                      <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Prep Time</p>
                      <p className="font-semibold">{recipe.prep_time}m</p>
                    </div>
                  )}
                  {recipe.cook_time && (
                    <div>
                      <ChefHat className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Cook Time</p>
                      <p className="font-semibold">{recipe.cook_time}m</p>
                    </div>
                  )}
                  {recipe.servings && (
                    <div>
                      <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Servings</p>
                      <p className="font-semibold">{recipe.servings}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Author Info */}
            {author && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={author.avatar_url} />
                      <AvatarFallback>{author.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{author.full_name}</h3>
                      <p className="text-sm text-gray-600">{author.location}</p>
                      {author.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{author.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({author.total_reviews})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recipe Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{recipe.description}</p>
            </div>

            {/* Rating */}
            {recipe.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(recipe.rating) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{recipe.rating.toFixed(1)}</span>
                <span className="text-gray-500">({recipe.review_count} reviews)</span>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleLike}
                className={`flex-1 ${isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white/50'}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-600' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" className="bg-white/50">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Purchase or View Recipe */}
            {recipe.is_for_sale ? (
              <Button 
                onClick={handlePurchase}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Recipe - ${recipe.price}
              </Button>
            ) : (
              <div className="space-y-6">
                {/* Ingredients */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full" />
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}