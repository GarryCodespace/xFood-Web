
import React, { useState, useEffect } from "react";
import { Recipe, User } from "@/services/entities";
import { UploadFile } from "@/services/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Plus, Minus, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";

const CATEGORIES = ["pastries", "cakes", "breads", "cookies", "cupcakes", "pies", "other"];
const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];
const COMMON_TAGS = ["vegan", "gluten-free", "dairy-free", "sugar-free", "keto", "organic", "quick", "healthy"];

export default function AddRecipe() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [recipeData, setRecipeData] = useState({
    title: "",
    description: "",
    image_url: "",
    ingredients: [""],
    instructions: [""],
    prep_time: "",
    cook_time: "",
    servings: "",
    difficulty: "medium",
    category: "",
    tags: [],
    is_for_sale: false,
    price: ""
  });

  useEffect(() => {
    // Show login modal if not authenticated after loading
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
        <LoginModal isOpen={showLoginModal} onOpenChange={setShowLoginModal} />
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in with Google to add a recipe.
          </p>
          <Button 
            onClick={() => setShowLoginModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      const { file_url } = await UploadFile({ file });
      setRecipeData(prev => ({ ...prev, image_url: file_url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag) => {
    setRecipeData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addIngredient = () => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ""]
    }));
  };

  const removeIngredient = (index) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, value) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  const addInstruction = () => {
    setRecipeData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const removeInstruction = (index) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index, value) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipeData.title || !recipeData.description || !recipeData.image_url || 
        recipeData.ingredients.filter(i => i.trim()).length === 0 ||
        recipeData.instructions.filter(i => i.trim()).length === 0) {
      alert("Please fill in all required fields including at least one ingredient and instruction.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...recipeData,
        ingredients: recipeData.ingredients.filter(i => i.trim()),
        instructions: recipeData.instructions.filter(i => i.trim()),
        prep_time: recipeData.prep_time ? parseInt(recipeData.prep_time) : null,
        cook_time: recipeData.cook_time ? parseInt(recipeData.cook_time) : null,
        servings: recipeData.servings ? parseInt(recipeData.servings) : null,
        price: recipeData.price ? parseFloat(recipeData.price) : null
      };
      
      await Recipe.create(submitData);
      navigate(createPageUrl("Recipes"));
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Share Your Recipe
          </h1>
          <p className="text-lg text-gray-600">
            Help others create amazing bakes with your favorite recipe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Recipe Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">Upload a photo of your finished recipe</p>
                      <p className="text-sm text-gray-500">Show off the final result!</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="recipe-image-upload"
                    />
                    <label htmlFor="recipe-image-upload">
                      <Button type="button" className="bg-purple-500 hover:bg-purple-600" asChild>
                        <span>Choose Photo</span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                    onClick={() => {
                      setImagePreview(null);
                      setRecipeData(prev => ({ ...prev, image_url: "" }));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recipe Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={recipeData.title}
                  onChange={(e) => setRecipeData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={recipeData.description}
                  onChange={(e) => setRecipeData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your recipe - what makes it special, any tips or stories..."
                  rows={4}
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={recipeData.category} onValueChange={(value) => setRecipeData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={recipeData.difficulty} onValueChange={(value) => setRecipeData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    min="0"
                    value={recipeData.prep_time}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, prep_time: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="cook_time">Cook Time (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    min="0"
                    value={recipeData.cook_time}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, cook_time: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="w-32">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={recipeData.servings}
                  onChange={(e) => setRecipeData(prev => ({ ...prev, servings: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={recipeData.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      recipeData.tags.includes(tag)
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : "hover:bg-purple-50 hover:border-purple-300"
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ingredients *
                <Button type="button" onClick={addIngredient} size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipeData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="flex-1"
                    />
                    {recipeData.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Instructions *
                <Button type="button" onClick={addInstruction} size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipeData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1} instructions...`}
                        rows={2}
                        className="flex-1"
                      />
                      {recipeData.instructions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeInstruction(index)}
                          className="mt-1"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selling Options */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recipe Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_for_sale">Sell this recipe</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Make this a premium recipe that others can purchase
                  </p>
                </div>
                <Switch
                  id="is_for_sale"
                  checked={recipeData.is_for_sale}
                  onCheckedChange={(checked) => setRecipeData(prev => ({ ...prev, is_for_sale: checked }))}
                />
              </div>

              {recipeData.is_for_sale && (
                <div className="pt-4 border-t border-gray-200">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={recipeData.price}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="9.99"
                    className="mt-2 w-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Recipes"))}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8"
            >
              {isSubmitting ? "Publishing..." : "Publish Recipe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
