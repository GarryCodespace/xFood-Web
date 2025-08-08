import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Camera, Save, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const TASTE_PREFERENCES = [
  "chocolate", "vanilla", "strawberry", "lemon", "caramel", "matcha", 
  "coconut", "berry", "nutty", "spicy", "citrus", "floral"
];

const DIETARY_RESTRICTIONS = [
  "vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", 
  "sugar-free", "keto", "paleo", "halal", "kosher"
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileData, setProfileData] = useState({
    avatar_url: "",
    bio: "",
    location: "",
    taste_preferences: [],
    dietary_restrictions: []
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setProfileData({
        avatar_url: currentUser.avatar_url || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        taste_preferences: currentUser.taste_preferences || [],
        dietary_restrictions: currentUser.dietary_restrictions || []
      });
      setImagePreview(currentUser.avatar_url);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      const { file_url } = await UploadFile({ file });
      setProfileData(prev => ({ ...prev, avatar_url: file_url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTasteToggle = (preference) => {
    setProfileData(prev => ({
      ...prev,
      taste_preferences: prev.taste_preferences.includes(preference)
        ? prev.taste_preferences.filter(p => p !== preference)
        : [...prev.taste_preferences, preference]
    }));
  };

  const handleDietaryToggle = (restriction) => {
    setProfileData(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await User.updateMyUserData(profileData);
      alert("Profile updated successfully!");
      navigate(createPageUrl("Profile"));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Customize your baking profile and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -top-2 -right-2 bg-white hover:bg-gray-50 rounded-full"
                    onClick={() => {
                      setImagePreview(null);
                      setProfileData(prev => ({ ...prev, avatar_url: "" }));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {imagePreview ? "Change Photo" : "Upload Photo"}
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your baking journey..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Sydney, NSW"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Taste Preferences */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Taste Preferences</CardTitle>
              <p className="text-sm text-gray-600">
                Help us recommend bakes you'll love
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {TASTE_PREFERENCES.map((preference) => (
                  <Badge
                    key={preference}
                    variant={profileData.taste_preferences.includes(preference) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      profileData.taste_preferences.includes(preference)
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : "hover:bg-purple-50 hover:border-purple-300"
                    }`}
                    onClick={() => handleTasteToggle(preference)}
                  >
                    {preference}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dietary Restrictions */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Dietary Restrictions</CardTitle>
              <p className="text-sm text-gray-600">
                Let bakers know about any dietary needs
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <Badge
                    key={restriction}
                    variant={profileData.dietary_restrictions.includes(restriction) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      profileData.dietary_restrictions.includes(restriction)
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "hover:bg-green-50 hover:border-green-300"
                    }`}
                    onClick={() => handleDietaryToggle(restriction)}
                  >
                    {restriction}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Profile"))}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
            >
              {isSubmitting ? "Saving..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}