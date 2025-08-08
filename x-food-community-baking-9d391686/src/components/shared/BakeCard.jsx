import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart, ShoppingBag, Phone, Eye, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Like, User } from "@/api/entities";

export default function BakeCard({ bake, showActions = true }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadLikeData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      // User not logged in
    }
  };

  const loadLikeData = async () => {
    try {
      const likes = await Like.filter({ bake_id: bake.id });
      setLikeCount(likes.length);
      
      if (currentUser) {
        const userLike = likes.find(like => like.user_email === currentUser.email);
        setIsLiked(!!userLike);
      }
    } catch (error) {
      console.error("Error loading likes:", error);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please sign in to like bakes");
      return;
    }

    try {
      if (isLiked) {
        const likes = await Like.filter({ bake_id: bake.id, user_email: currentUser.email });
        if (likes.length > 0) {
          await Like.delete(likes[0].id);
          setLikeCount(prev => prev - 1);
          setIsLiked(false);
        }
      } else {
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

  const isOwner = currentUser?.email === bake.created_by;

  return (
    <Card className="group overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={bake.image_url || "https://images.unsplash.com/photo-1549961784-88021481fc37?w=400"}
          alt={bake.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/95 text-orange-700 border-0 shadow-lg rounded-xl px-3 py-1 font-semibold">
            {bake.category}
          </Badge>
        </div>
        {bake.available_for_order && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg rounded-xl px-3 py-1 font-medium">
              <ShoppingBag className="w-3 h-3 mr-1" />
              Available
            </Badge>
          </div>
        )}
        
        {/* Stats overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {bake.views > 0 && (
            <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {bake.views}
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">
              {bake.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
              {bake.description}
            </p>
          </div>

          {/* Contact & Location Info */}
          <div className="space-y-2 text-xs text-gray-700">
            {bake.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-orange-600" />
                <span className="font-medium">{bake.phone_number}</span>
              </div>
            )}
            {bake.pickup_location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-purple-600" />
                <span>{bake.pickup_location}</span>
              </div>
            )}
          </div>

          {bake.tags && bake.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bake.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 rounded-full px-2 py-1"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {bake.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{bake.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-600">{likeCount}</span>
              </div>
            </div>
            
            {bake.price && (
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                ${bake.price}
              </span>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={`flex-1 rounded-xl transition-all ${
                  isLiked 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-600' 
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700'
                }`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              
              {!isOwner && currentUser && (
                <Link to={createPageUrl(`Inbox?with=${bake.created_by}&bakeId=${bake.id}`)} className="flex-1">
                  <Button 
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 rounded-xl font-medium"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </Link>
              )}
              
              <Link to={createPageUrl(`BakeDetail?id=${bake.id}`)} className="flex-1">
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg rounded-xl font-medium"
                  size="sm"
                >
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}