
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { createPageUrl } from '@/utils';
import { ChefHat, ArrowLeft, Upload, X } from 'lucide-react';
import { Recipe } from '@/services/entities';
import LoginModal from '@/components/auth/LoginModal';

export default function AddRecipe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'desserts',
    difficulty: 'medium',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: '',
    instructions: '',
    tags: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication and show login modal if needed
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated before submitting
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const recipeData = {
        title: formData.title,
        description: formData.description || 'Delicious recipe',
        difficulty: formData.difficulty,
        prep_time: parseInt(formData.prepTime) || 0,
        cook_time: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 1,
        ingredients: formData.ingredients.split('\n').map(line => line.trim()).filter(line => line),
        instructions: formData.instructions.split('\n').map(line => line.trim()).filter(line => line),
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      console.log('Creating recipe:', recipeData);
      
      const newRecipe = await Recipe.create(recipeData);
      console.log('Recipe created successfully:', newRecipe);
      
      // Navigate to recipes page to see the new recipe
      navigate(createPageUrl("Recipes"));
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="hover:bg-orange-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Share Your Recipe</h1>
              <p className="text-gray-600">Inspire others with your delicious recipe</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Recipe Details</CardTitle>
            <CardDescription className="text-gray-600">
              Tell us about your amazing recipe and share it with the community
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields here */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Classic Chocolate Chip Cookies"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="breads">Breads</SelectItem>
                      <SelectItem value="cakes">Cakes</SelectItem>
                      <SelectItem value="cookies">Cookies</SelectItem>
                      <SelectItem value="pastries">Pastries</SelectItem>
                      <SelectItem value="savory">Savory</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your recipe, what makes it special..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (mins)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    placeholder="30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time (mins)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    placeholder="25"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients *</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="List your ingredients, one per line..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Step-by-step instructions..."
                  rows={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="cookies, chocolate, dessert (separate with commas)"
                />
              </div>

              <div className="space-y-2">
                <Label>Recipe Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-w-full h-64 object-cover rounded-lg mx-auto" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload').click()}
                        className="mt-4"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Home"))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                >
                  {isSubmitting ? 'Sharing...' : 'Share Recipe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Login Modal for Authentication */}
      <LoginModal 
        isOpen={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </div>
  );
}
