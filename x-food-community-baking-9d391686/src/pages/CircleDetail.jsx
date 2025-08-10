import React, { useState, useEffect } from "react";
import { Circle, User, Bake } from "@/services/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Tag, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BakeCard from "../components/shared/BakeCard";

export default function CircleDetail() {
  const navigate = useNavigate();
  const [circle, setCircle] = useState(null);
  const [members, setMembers] = useState([]);
  const [circleBakes, setCircleBakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCircleDetails();
  }, []);

  const loadCircleDetails = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const circleId = urlParams.get('id');
    
    if (!circleId) {
      navigate(createPageUrl("Home"));
      return;
    }

    setIsLoading(true);
    try {
      const allCircles = await Circle.list();
      const foundCircle = allCircles.find(c => c.id === circleId);

      if (!foundCircle) {
        navigate(createPageUrl("Circles"));
        return;
      }
      setCircle(foundCircle);

      const allBakes = await Bake.filter({ circle_id: circleId }, "-created_date");
      setCircleBakes(allBakes);

    } catch (error) {
      console.error("Error loading circle details:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-2xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Circle not found</h2>
        <Button onClick={() => navigate(createPageUrl("Circles"))} className="mt-4">
          Back to Circles
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Circles"))}
          className="bg-white/70 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all Circles
        </Button>
      </div>

      {/* Circle Header */}
      <div className="relative h-64 md:h-80 my-6">
        <img
          src={circle.image_url || "https://images.unsplash.com/photo-1556909114-6a5fda03037c?w=800"}
          alt={circle.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold">{circle.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{circle.member_count} members</span>
            </div>
            {circle.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{circle.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-8 right-8">
          <Button className="bg-white/90 text-primary hover:bg-white">
            Join Circle
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
              <CardHeader>
                <CardTitle>About this Circle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {circle.description}
                </p>
                {circle.tags && circle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {circle.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Circle Bakes</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Bake
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {circleBakes.length > 0 ? (
                  circleBakes.map(bake => <BakeCard key={bake.id} bake={bake} />)
                ) : (
                  <div className="md:col-span-2 text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                    <p className="text-gray-600">No bakes have been shared in this circle yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Members ({circle.member_count})</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for members */}
                <p className="text-gray-500 text-sm">Member list coming soon.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}