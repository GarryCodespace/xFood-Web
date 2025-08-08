import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CircleCard({ circle }) {
  return (
    <Card className="group overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl">
      <div className="relative h-40 overflow-hidden">
        <img
          src={circle.image_url || "https://images.unsplash.com/photo-1556909114-6a5fda03037c?w=400"}
          alt={circle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-xl">{circle.name}</h3>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>{circle.member_count} members</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {circle.description}
          </p>

          {circle.location && (
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{circle.location}</span>
            </div>
          )}

          {circle.tags && circle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {circle.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-orange-50 text-orange-700 border-orange-200 rounded-full px-2 py-1"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          <Link to={createPageUrl(`CircleDetail?id=${circle.id}`)}>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg rounded-xl font-medium py-2.5">
              View Circle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}