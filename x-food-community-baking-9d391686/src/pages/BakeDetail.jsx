
import React, { useState, useEffect } from "react";
import { Bake, User, Comment, Like, Message, Notification } from "@/services/entities"; // Added Message, Notification
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, ShoppingBag, Heart, Share, ArrowLeft, Phone, Send } from "lucide-react"; // Added Send
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CommentSection from "../components/shared/CommentSection";

export default function BakeDetail() {
  const navigate = useNavigate();
  const [bake, setBake] = useState(null);
  const [baker, setBaker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadBakeDetails(); // Renamed function call
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (e) { // Changed 'error' to 'e' as per outline
      console.error("User not logged in");
    }
  };

  const loadBakeDetails = async () => { // Renamed from loadBakeDetail
    const urlParams = new URLSearchParams(window.location.search);
    const bakeId = urlParams.get('id');

    if (!bakeId) {
      navigate(createPageUrl("Home"));
      return;
    }

    try {
      const bakeData = await Bake.list();
      const foundBake = bakeData.find(b => b.id === bakeId);

      if (!foundBake) {
        navigate(createPageUrl("Home"));
        return;
      }

      setBake(foundBake);

      // Load baker info
      const users = await User.list();
      const bakerData = users.find(u => u.email === foundBake.created_by);
      setBaker(bakerData);

      // Load likes and rating
      const likes = await Like.filter({ bake_id: bakeId });
      setLikeCount(likes.length);

      const comments = await Comment.filter({ bake_id: bakeId });
      const ratings = comments.filter(c => c.rating).map(c => c.rating);
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        setRating(avgRating);
      }

      if (currentUser) {
        const userLike = likes.find(like => like.user_email === currentUser.email);
        setIsLiked(!!userLike);
      }

    } catch (error) {
      console.error("Error loading bake details:", error);
    }
    setIsLoading(false);
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please sign in to like bakes");
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        const likes = await Like.filter({ bake_id: bake.id, user_email: currentUser.email });
        if (likes.length > 0) {
          await Like.delete(likes[0].id);
          setLikeCount(prev => prev - 1);
          setIsLiked(false);
        }
      } else {
        // Add like
        await Like.create({
          bake_id: bake.id,
          user_email: currentUser.email
        });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleOrder = () => {
    if (bake.phone_number) {
      window.open(`tel:${bake.phone_number}`);
    } else {
      alert("Contact information not available");
    }
  };

  const handleMessageOwner = () => { // New function from outline
    if (!bake || !currentUser) return;
    if (bake.created_by === currentUser.email) {
      alert("You cannot message yourself.");
      return;
    }

    // Navigate to inbox, pre-filling the conversation
    navigate(createPageUrl(`Inbox?with=${bake.created_by}&bakeId=${bake.id}`));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
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

  if (!bake) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bake not found</h2>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.email === bake.created_by; // New derived state from outline

  return (
    <div className="min-h-screen"> {/* Adjusted class as per outline, removed py-8 */}
      {/* Back Button - keeping its original max-w layout */}
      <div className="max-w-4xl mx-auto px-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 bg-white/70 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8"> {/* New main content wrapper as per outline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* New grid structure as per outline */}
          {/* Left Column (lg:col-span-2) */}
          <div className="lg:col-span-2">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={bake.image_url}
                  alt={bake.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-orange-700 border-0 shadow-sm">
                    {bake.category}
                  </Badge>
                </div>
                {bake.available_for_order && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white border-0 shadow-sm">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card (moved from original Details Section) */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{bake.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{bake.description}</p>
            </div>

            {/* Action Buttons (New/Modified from outline) */}
            <div className="flex flex-wrap gap-4 mb-8">
              {bake.available_for_order && (
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  onClick={handleOrder} // Uses existing handleOrder function
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Request to Order {bake.price && `- $${bake.price}`}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={handleLike}
                className={`flex-1 transition-all ${
                  isLiked
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-300 text-gray-700' // Preserve original styling for not liked
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-red-600' : ''}`} />
                {isLiked ? 'Liked' : 'Like'} ({likeCount}) {/* Using likeCount state */}
              </Button>
              {/* Share button removed from this section as per outline's specific list of buttons */}
              {!isOwner && currentUser && ( // Conditional rendering as per outline
                <Button size="lg" variant="outline" className="flex-1" onClick={handleMessageOwner}>
                  <Send className="w-5 h-5 mr-2" />
                  Message Owner
                </Button>
              )}
            </div>
          </div>

          {/* Right Column (Implicit lg:col-span-1 - contains remaining parts of original Details Section) */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact & Pickup</h3>
                <div className="space-y-4">
                  {bake.phone_number && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">{bake.phone_number}</p>
                      </div>
                    </div>
                  )}
                  {bake.pickup_location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup Location</p>
                        <p className="font-semibold text-gray-900">{bake.pickup_location}</p>
                      </div>
                    </div>
                  )}
                  {bake.full_address && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Full Address</p>
                      <p className="text-gray-900">{bake.full_address}</p>
                    </div>
                  )}
                  {bake.price && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        ${bake.price}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <div className="flex items-center gap-4">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-semibold ml-2">{rating.toFixed(1)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                <span className="font-medium">{likeCount} likes</span>
              </div>
            </div>

            {/* Tags */}
            {bake.tags && bake.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Dietary Info</h3>
                <div className="flex flex-wrap gap-2">
                  {bake.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {bake.allergens && bake.allergens.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Contains</h3>
                <div className="flex flex-wrap gap-2">
                  {bake.allergens.map((allergen, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200"
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Baker Info */}
            {baker && (
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={baker.avatar_url} />
                      <AvatarFallback>{baker.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{baker.full_name}</h3>
                      <p className="text-sm text-gray-600">{baker.location}</p>
                      {baker.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{baker.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({baker.total_reviews})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Original Share button and original Contact Baker button were replaced/omitted as per outline */}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection bakeId={bake.id} />
        </div>
      </div>
    </div>
  );
}
