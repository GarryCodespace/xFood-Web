
import React, { useState, useEffect } from "react";
import { Bake, Circle, User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Camera, Image as ImageIcon, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CATEGORIES = ["pastries", "cakes", "breads", "cookies", "cupcakes", "pies", "other"];
const COMMON_TAGS = ["vegan", "gluten-free", "dairy-free", "sugar-free", "keto", "organic", "nuts", "chocolate"];
const ALLERGENS = ["nuts", "dairy", "eggs", "gluten", "soy", "shellfish", "sesame"];

export default function AddBake() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [bakeData, setBakeData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    tags: [],
    allergens: [],
    price: "",
    available_for_order: false,
    pickup_location: "",
    full_address: "",
    phone_number: "",
    circle_id: ""
  });

  useEffect(() => {
    // Protect this route
    User.me().catch(() => navigate(createPageUrl("Home")));
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const data = await Circle.list("-created_date", 20);
      setCircles(data);
    } catch (error) {
      console.error("Error loading circles:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      const { file_url } = await UploadFile({ file });
      setBakeData(prev => ({ ...prev, image_url: file_url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag) => {
    setBakeData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAllergenToggle = (allergen) => {
    setBakeData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bakeData.title || !bakeData.description || !bakeData.image_url) {
      alert("Please fill in all required fields and upload an image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...bakeData,
        price: bakeData.price ? parseFloat(bakeData.price) : null
      };
      
      await Bake.create(submitData);
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error creating bake:", error);
      alert("Failed to create bake. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Share Your Creation
          </h1>
          <p className="text-lg text-gray-600">
            Show off your homemade bakes to the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="w-6 h-6" />
                Upload Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors bg-orange-50/50">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-10 h-10 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">Upload a photo of your bake</p>
                        <p className="text-sm text-gray-500">Make it look delicious!</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button type="button" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg rounded-xl px-6 py-3" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Photo
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Bake preview"
                      className="w-full h-64 object-cover rounded-2xl shadow-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg rounded-full"
                      onClick={() => {
                        setImagePreview(null);
                        setBakeData(prev => ({ ...prev, image_url: "" }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-gray-800">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-700">Bake Title *</Label>
                <Input
                  id="title"
                  value={bakeData.title}
                  onChange={(e) => setBakeData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Chocolate Chip Cookies"
                  className="mt-2 border-gray-300 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={bakeData.description}
                  onChange={(e) => setBakeData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about your bake - ingredients, technique, what makes it special..."
                  rows={4}
                  className="mt-2 border-gray-300 focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-gray-700">Category</Label>
                  <Select value={bakeData.category} onValueChange={(value) => setBakeData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-2 border-gray-300 focus:border-orange-500">
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
                  <Label htmlFor="circle" className="text-gray-700">Share to Circle (Optional)</Label>
                  <Select value={bakeData.circle_id} onValueChange={(value) => setBakeData(prev => ({ ...prev, circle_id: value }))}>
                    <SelectTrigger className="mt-2 border-gray-300 focus:border-orange-500">
                      <SelectValue placeholder="Select circle" />
                    </SelectTrigger>
                    <SelectContent>
                      {circles.map((circle) => (
                        <SelectItem key={circle.id} value={circle.id}>
                          {circle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Location Info */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-gray-800">Contact & Pickup Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="phone_number" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={bakeData.phone_number}
                  onChange={(e) => setBakeData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="e.g., (555) 123-4567"
                  className="mt-2 border-gray-300 focus:border-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="pickup_location" className="text-gray-700">Pickup Location</Label>
                <Input
                  id="pickup_location"
                  value={bakeData.pickup_location}
                  onChange={(e) => setBakeData(prev => ({ ...prev, pickup_location: e.target.value }))}
                  placeholder="e.g., Downtown Coffee Shop"
                  className="mt-2 border-gray-300 focus:border-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="full_address" className="text-gray-700">Full Address</Label>
                <Textarea
                  id="full_address"
                  value={bakeData.full_address}
                  onChange={(e) => setBakeData(prev => ({ ...prev, full_address: e.target.value }))}
                  placeholder="Complete address for pickup"
                  rows={2}
                  className="mt-2 border-gray-300 focus:border-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags and Allergens */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Tags & Allergens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Dietary Tags</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {COMMON_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={bakeData.tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        bakeData.tags.includes(tag)
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "hover:bg-orange-50 hover:border-orange-300"
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Contains Allergens</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {ALLERGENS.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant={bakeData.allergens.includes(allergen) ? "destructive" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        !bakeData.allergens.includes(allergen) ? "hover:bg-red-50 hover:border-red-300" : ""
                      }`}
                      onClick={() => handleAllergenToggle(allergen)}
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordering Options */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Ordering & Pickup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="available_for_order">Available for Pre-Order</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow others to request this bake from you
                  </p>
                </div>
                <Switch
                  id="available_for_order"
                  checked={bakeData.available_for_order}
                  onCheckedChange={(checked) => setBakeData(prev => ({ ...prev, available_for_order: checked }))}
                />
              </div>

              {bakeData.available_for_order && (
                <div className="grid grid-cols-1 pt-4 border-t border-gray-200">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bakeData.price}
                      onChange={(e) => setBakeData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="mt-2 border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Home"))}
              disabled={isSubmitting}
              className="rounded-xl px-6 py-3 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-lg font-semibold"
            >
              {isSubmitting ? "Sharing..." : "Share Bake"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
