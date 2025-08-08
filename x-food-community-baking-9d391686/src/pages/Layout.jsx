
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Users, ChefHat, BookOpen, User, Plus, Bell, MessageSquare } from "lucide-react";
import { User as UserEntity } from '@/api/entities';
import { Button } from "@/components/ui/button";
import NotificationBell from './components/shared/NotificationBell';
import LoginModal from './components/auth/LoginModal';

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Recipes",
    url: createPageUrl("Recipes"),
    icon: BookOpen,
  },
  {
    title: "Circles",
    url: createPageUrl("Circles"),
    icon: Users,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/59b84e278_381e16b4-cdcc-46aa-b162-c58530812012.png";

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleShareBakeClick = async () => {
    try {
      await UserEntity.me();
      navigate(createPageUrl("AddBake"));
    } catch (error) {
      setShowLoginModal(true);
    }
  };

  let allNavigationItems = [...navigationItems];
  if (user) {
    allNavigationItems.push({
      title: "Profile",
      url: createPageUrl("Profile"),
      icon: User,
    });
  }
  allNavigationItems.push({
    title: "Contact",
    url: createPageUrl("Contact"),
    icon: User, // Using User icon for contact for now
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <LoginModal isOpen={showLoginModal} onOpenChange={setShowLoginModal} />
      <style>
        {`
          :root {
            --primary: #f97316;
            --primary-foreground: #ffffff;
            --secondary: #8b5cf6;
            --secondary-foreground: #ffffff;
            --accent: #ec4899;
            --accent-foreground: #ffffff;
            --background: #fefefe;
            --foreground: #1f2937;
            --muted: #f3f4f6;
            --muted-foreground: #6b7280;
            --border: #e5e7eb;
            --ring: #f97316;
            --card: #ffffff;
            --card-foreground: #1f2937;
          }
        `}
      </style>
      
      {/* Header - Desktop */}
      <header className="hidden md:block bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img src={logoUrl} alt="xFood Logo" className="h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">xFood</h1>
                <p className="text-xs text-gray-500">Community Baking</p>
              </div>
            </Link>
            
            <nav className="flex items-center gap-2">
              {allNavigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                    location.pathname === item.url
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:block">{item.title}</span>
                </Link>
              ))}
              
              <div className="flex items-center gap-2 ml-4">
                {user && <NotificationBell />}
                <Button 
                  onClick={handleShareBakeClick}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Bake
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-2xl">
        <div className="flex items-center justify-around h-20 px-2">
          {allNavigationItems.slice(0, 2).map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 w-1/5 ${
                location.pathname === item.url
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-500"
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.url ? "scale-110" : ""}`} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          ))}

          <div className="w-1/5 flex justify-center">
            <button 
              onClick={handleShareBakeClick}
              className="-mt-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center"
            >
              <Plus className="w-8 h-8 text-white" />
            </button>
          </div>

          {allNavigationItems.slice(2).map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 w-1/5 ${
                location.pathname === item.url
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-500"
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.url ? "scale-110" : ""}`} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
