import React, { useState, useEffect } from "react";
import { Comment, User } from "@/services/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Send } from "lucide-react";

export default function CommentSection({ bakeId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [bakeId]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      // User not logged in
    }
  };

  const loadComments = async () => {
    try {
      const data = await Comment.filter({ bake_id: bakeId }, "-created_date");
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
    setIsLoading(false);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please sign in to leave a comment");
      return;
    }

    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      await Comment.create({
        bake_id: bakeId,
        content: newComment.trim(),
        rating: rating,
        author_name: currentUser.full_name
      });

      setNewComment("");
      setRating(5);
      loadComments(); // Reload comments
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        {currentUser ? (
          <Card className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <Textarea
                  placeholder="Share your thoughts about this bake..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none border-purple-200 focus:border-orange-400"
                />
                
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm mb-6">
            <CardContent className="p-4 text-center">
              <p className="text-gray-600 mb-3">Sign in to leave a comment and rating</p>
              <Button 
                onClick={() => User.login()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id} className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {comment.author_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comment.author_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {comment.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{comment.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}