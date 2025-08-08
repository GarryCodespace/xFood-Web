
import React, { useState, useEffect } from "react";
import { Circle, User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COMMON_TAGS = ["beginners-welcome", "advanced", "sourdough", "vegan", "gluten-free", "decorating", "bread", "cakes", "cookies", "seasonal", "professional", "hobby"];

export default function CreateCircle() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [circleData, setCircleData] = useState({
    name: "",
    description: "",
    image_url: "",
    location: "",
    tags: [],
    is_public: true
  });

  useEffect(() => {
    // Protect this route
    User.me().catch(() => navigate(createPageUrl("Home")));
  }, [navigate]); // Added navigate to dependency array for useEffect best practices

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      const { file_url } = await UploadFile({ file });
      setCircleData(prev => ({ ...prev, image_url: file_url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag) => {
    setCircleData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!circleData.name || !circleData.description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...circleData,
        member_count: 1 // Creator starts as first member
      };
      
      const newCircle = await Circle.create(submitData);
      navigate(createPageUrl(`CircleDetail?id=${newCircle.id}`));
    } catch (error) {
      console.error("Error creating circle:", error);
      alert("Failed to create circle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Create Baking Circle
          </h1>
          <p className="text-lg text-gray-600">
            Start a community for passionate bakers in your area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Circle Cover Image
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
                      <p className="text-lg font-medium text-gray-700">Upload a cover image for your circle</p>
                      <p className="text-sm text-gray-500">This will be shown on your circle page</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="circle-image-upload"
                    />
                    <label htmlFor="circle-image-upload">
                      <Button type="button" className="bg-purple-500 hover:bg-purple-600" asChild>
                        <span>Choose Image</span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Circle cover preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                    onClick={() => {
                      setImagePreview(null);
                      setCircleData(prev => ({ ...prev, image_url: "" }));
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
              <CardTitle>Circle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Circle Name *</Label>
                <Input
                  id="name"
                  value={circleData.name}
                  onChange={(e) => setCircleData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown Sourdough Society"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={circleData.description}
                  onChange={(e) => setCircleData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell people what your circle is about, what kind of baking you focus on, and what members can expect..."
                  rows={4}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={circleData.location}
                  onChange={(e) => setCircleData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Downtown, Brooklyn, NYC"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Circle Tags</CardTitle>
              <p className="text-sm text-gray-600">
                Help people find your circle by selecting relevant tags
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={circleData.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      circleData.tags.includes(tag)
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : "hover:bg-purple-50 hover:border-purple-300"
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_public">Public Circle</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Anyone can find and join this circle. If disabled, people need an invitation to join.
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={circleData.is_public}
                  onCheckedChange={(checked) => setCircleData(prev => ({ ...prev, is_public: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Circles"))}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8"
            >
              {isSubmitting ? "Creating..." : "Create Circle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
