import React, { useState, useEffect } from "react";
import { User, Bake, Recipe, Message } from "@/services/entities"; // Added Message entity
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Star, MapPin, Calendar, Edit, ChefHat, BookOpen, Trophy, 
  LogOut, Users, Phone, Mail, Award, Settings, MessageSquare
} from "lucide-react";
import BakeCard from "../components/shared/BakeCard";
import RecipeCard from "../components/shared/RecipeCard";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userBakes, setUserBakes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // State for unread message count

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Fetch user's bakes, recipes, and unread messages concurrently
      const [bakes, recipes, unreadMessages] = await Promise.all([
        Bake.filter({ created_by: currentUser.email }, "-created_date", 20),
        Recipe.filter({ created_by: currentUser.email }, "-created_date", 20),
        // Assuming a Message entity exists with a filter method for unread messages
        Message.filter({ receiver_email: currentUser.email, is_read: false }) 
      ]);
      
      setUserBakes(bakes);
      setUserRecipes(recipes);
      setUnreadMessagesCount(unreadMessages.length); // Set the count of unread messages

    } catch (error) {
      console.error("Error loading user data:", error);
      navigate(createPageUrl("Home"));
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const handleSwitchAccount = async () => {
    await User.login();
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Profile Header */}
        <Card className="bg-white border-0 shadow-xl mb-8 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 h-32"></div>
          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.full_name}
                  className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-white bg-white"
                />
                {user.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {user.rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">{user.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">({user.total_reviews} reviews)</span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="text-gray-700 max-w-2xl leading-relaxed">{user.bio}</p>
                )}

                {/* Badges */}
                {user.badges && user.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-3 py-1"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Link to={createPageUrl("Inbox")}>
                    <Button variant="outline" className="relative"> {/* Added relative for badge positioning */}
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Inbox
                      {unreadMessagesCount > 0 && (
                        <Badge 
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs font-bold 
                                     min-w-[20px] h-[20px] flex items-center justify-center animate-bounce-once"
                        >
                          {unreadMessagesCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link to={createPageUrl("EditProfile")}>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" onClick={handleSwitchAccount}>
                    <Users className="w-4 h-4 mr-2" />
                    Switch Account
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white border-0 rounded-3xl shadow-xl">
            <CardContent className="p-6 text-center">
              <ChefHat className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-3xl font-bold">{userBakes.length}</h3>
              <p className="text-orange-100 font-medium">Bakes Shared</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 rounded-3xl shadow-xl">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-3xl font-bold">{userRecipes.length}</h3>
              <p className="text-purple-100 font-medium">Recipes Shared</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-red-500 text-white border-0 rounded-3xl shadow-xl">
            <CardContent className="p-6 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-3xl font-bold">{user.badges?.length || 0}</h3>
              <p className="text-pink-100 font-medium">Badges Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0 rounded-3xl shadow-xl">
            <CardContent className="p-6 text-center">
              <Star className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-3xl font-bold">{user.rating?.toFixed(1) || '0.0'}</h3>
              <p className="text-indigo-100 font-medium">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="bakes" className="w-full">
          <TabsList className="bg-white border-0 p-1 mb-8 rounded-2xl shadow-lg">
            <TabsTrigger value="bakes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl px-6 py-3">
              My Bakes ({userBakes.length})
            </TabsTrigger>
            <TabsTrigger value="recipes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl px-6 py-3">
              My Recipes ({userRecipes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bakes">
            {userBakes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userBakes.map((bake) => (
                  <BakeCard key={bake.id} bake={bake} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bakes shared yet</h3>
                <p className="text-gray-600 mb-6">Share your first homemade creation with the community!</p>
                <Link to={createPageUrl("AddBake")}>
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                    Share Your First Bake
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipes">
            {userRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes shared yet</h3>
                <p className="text-gray-600 mb-6">Share your favorite baking recipes with the community!</p>
                <Link to={createPageUrl("AddRecipe")}>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    Share Your First Recipe
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}