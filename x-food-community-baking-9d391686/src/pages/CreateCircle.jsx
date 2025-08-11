
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
import { Users, ArrowLeft, Upload, X } from 'lucide-react';
import { Circle } from '@/services/entities';
import LoginModal from '@/components/auth/LoginModal';

export default function CreateCircle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false,
    maxMembers: 50,
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
      const circleData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        is_private: formData.isPrivate,
        max_members: formData.maxMembers
      };

      console.log('Creating circle:', circleData);
      
      const newCircle = await Circle.create(circleData);
      console.log('Circle created successfully:', newCircle);
      
      // Navigate to circles page to see the new circle
      navigate(createPageUrl("Circles"));
    } catch (error) {
      console.error('Error creating circle:', error);
      alert('Failed to create circle. Please try again.');
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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create a Circle</h1>
              <p className="text-gray-600">Build a community around your baking passion</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Circle Details</CardTitle>
            <CardDescription className="text-gray-600">
              Tell us about your new baking circle and start building your community
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Circle Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Artisan Bread Makers"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Baking</SelectItem>
                      <SelectItem value="bread">Bread Making</SelectItem>
                      <SelectItem value="pastry">Pastry & Desserts</SelectItem>
                      <SelectItem value="cakes">Cakes & Cupcakes</SelectItem>
                      <SelectItem value="cookies">Cookies & Bars</SelectItem>
                      <SelectItem value="healthy">Healthy Baking</SelectItem>
                      <SelectItem value="vegan">Vegan Baking</SelectItem>
                      <SelectItem value="gluten-free">Gluten-Free</SelectItem>
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
                  placeholder="Describe your circle, what makes it special, who should join..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Select value={formData.maxMembers.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 members</SelectItem>
                      <SelectItem value="25">25 members</SelectItem>
                      <SelectItem value="50">50 members</SelectItem>
                      <SelectItem value="100">100 members</SelectItem>
                      <SelectItem value="200">200 members</SelectItem>
                      <SelectItem value="500">500 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="isPrivate">Privacy Setting</Label>
                  <Select value={formData.isPrivate ? "private" : "public"} onValueChange={(value) => setFormData(prev => ({ ...prev, isPrivate: value === "private" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can join</SelectItem>
                      <SelectItem value="private">Private - Approval required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Circle Photo</Label>
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
                  {isSubmitting ? 'Creating...' : 'Create Circle'}
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
