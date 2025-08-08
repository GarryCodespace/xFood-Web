import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Sparkles, Crown, Heart } from "lucide-react";

const badgeIcons = {
  "trusted_baker": Star,
  "community_favorite": Heart,
  "recipe_master": Award,
  "rising_star": Sparkles,
  "group_leader": Crown,
  "top_rated": Star,
  "helpful_reviewer": Award,
  "active_member": Sparkles,
};

const badgeColors = {
  "trusted_baker": "bg-blue-100 text-blue-800 border-blue-200",
  "community_favorite": "bg-pink-100 text-pink-800 border-pink-200",
  "recipe_master": "bg-purple-100 text-purple-800 border-purple-200",
  "rising_star": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "group_leader": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "top_rated": "bg-green-100 text-green-800 border-green-200",
  "helpful_reviewer": "bg-orange-100 text-orange-800 border-orange-200",
  "active_member": "bg-cyan-100 text-cyan-800 border-cyan-200",
};

export default function UserBadge({ badge, size = "sm" }) {
  const Icon = badgeIcons[badge] || Award;
  const colorClass = badgeColors[badge] || "bg-gray-100 text-gray-800 border-gray-200";
  
  const displayName = badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Badge 
      variant="outline" 
      className={`${colorClass} ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs'}`}
    >
      <Icon className={`${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} mr-1`} />
      {displayName}
    </Badge>
  );
}