import React, { useState, useEffect } from "react";
import { Circle } from "@/services/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Users, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CircleCard from "../components/shared/CircleCard";

export default function Circles() {
  const [circles, setCircles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    setIsLoading(true);
    try {
      const data = await Circle.list("-member_count", 50);
      setCircles(data);
    } catch (error) {
      console.error("Error loading circles:", error);
    }
    setIsLoading(false);
  };

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || circle.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(circles.map(circle => circle.location).filter(Boolean))];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Join Local Baking
              <span className="block">Communities</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Connect with passionate bakers in your area, share recipes, and learn new techniques
            </p>
            
            <Link to={createPageUrl("CreateCircle")}>
              <Button size="lg" className="bg-white/95 text-orange-600 hover:bg-white shadow-2xl rounded-2xl px-8 py-4 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Create New Circle
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search circles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 bg-white border-gray-200 focus:border-orange-300 rounded-2xl shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedLocation === "all" ? "default" : "outline"}
                onClick={() => setSelectedLocation("all")}
                className={selectedLocation === "all" ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg" : ""}
              >
                All Locations
              </Button>
              {uniqueLocations.slice(0, 3).map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  onClick={() => setSelectedLocation(location)}
                  className={selectedLocation === location ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg" : ""}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {location}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Circles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-t-2xl" />
                <div className="bg-white p-4 rounded-b-2xl space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCircles.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredCircles.length} Circles Found
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {filteredCircles.reduce((sum, circle) => sum + circle.member_count, 0)} total members
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCircles.map((circle) => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No circles found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedLocation !== "all" 
                ? "Try adjusting your search criteria" 
                : "Be the first to create a baking circle in your area!"
              }
            </p>
            <Link to={createPageUrl("CreateCircle")}>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Create First Circle
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}