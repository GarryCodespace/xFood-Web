import React, { useState, useEffect } from "react";
import { Message, User, Bake } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, Image } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import _ from 'lodash';

export default function Inbox() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [relatedBake, setRelatedBake] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        await loadConversations(user);
      } catch (e) {
        console.error("User not logged in");
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const withEmail = params.get('with');
    const bakeId = params.get('bakeId');
    
    if (withEmail && conversations.length > 0) {
      const convo = conversations.find(c => c.otherUser.email === withEmail);
      if (convo) {
        handleConversationSelect(convo, bakeId);
      } else {
        // Start a new conversation that doesn't exist yet
        startNewConversation(withEmail, bakeId);
      }
    }
  }, [conversations, location.search]);

  const startNewConversation = async (withEmail, bakeId) => {
    try {
      const users = await User.filter({ email: withEmail });
      if (users.length > 0) {
        const newConvo = { 
          otherUser: users[0], 
          lastMessage: "Start a new conversation...",
          lastMessageDate: new Date().toISOString()
        };
        setSelectedConversation(newConvo);
        setMessages([]);
        
        if (bakeId) {
          const bakes = await Bake.filter({ id: bakeId });
          if (bakes.length > 0) {
            setRelatedBake(bakes[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  const loadConversations = async (user) => {
    const sentMessages = await Message.filter({ sender_email: user.email }, '-created_date', 100);
    const receivedMessages = await Message.filter({ receiver_email: user.email }, '-created_date', 100);
    const allUserMessages = _.orderBy([...sentMessages, ...receivedMessages], ['created_date'], ['desc']);
    
    const grouped = _.groupBy(allUserMessages, msg => {
      return msg.sender_email === user.email ? msg.receiver_email : msg.sender_email;
    });

    const usersToFetch = Object.keys(grouped);
    const userProfiles = usersToFetch.length > 0 ? await User.filter({ email: { '$in': usersToFetch }}) : [];
    const userMap = _.keyBy(userProfiles, 'email');

    const convos = Object.entries(grouped).map(([email, messages]) => {
      return {
        otherUser: userMap[email] || { email: email, full_name: 'Unknown User' },
        lastMessage: messages[0].content,
        lastMessageDate: messages[0].created_date,
        isRead: messages[0].is_read || messages[0].sender_email === user.email,
        unreadCount: messages.filter(m => !m.is_read && m.sender_email !== user.email).length
      };
    }).filter(c => c.otherUser);
    
    setConversations(_.orderBy(convos, ['lastMessageDate'], ['desc']));
  };

  const loadMessages = async (otherUserEmail, bakeId = null) => {
    const sent = await Message.filter({ sender_email: currentUser.email, receiver_email: otherUserEmail }, '-created_date');
    const received = await Message.filter({ sender_email: otherUserEmail, receiver_email: currentUser.email }, '-created_date');
    const all = _.orderBy([...sent, ...received], ['created_date'], ['asc']);
    setMessages(all);
    
    // Mark messages as read
    received.forEach(async msg => {
      if (!msg.is_read) {
        await Message.update(msg.id, { is_read: true });
      }
    });

    // Load related bake if exists
    if (bakeId) {
      try {
        const bakes = await Bake.filter({ id: bakeId });
        if (bakes.length > 0) {
          setRelatedBake(bakes[0]);
        }
      } catch (error) {
        console.error("Error loading related bake:", error);
      }
    }
  };

  const handleConversationSelect = (convo, bakeId = null) => {
    setSelectedConversation(convo);
    setRelatedBake(null);
    loadMessages(convo.otherUser.email, bakeId);
    
    // Update conversation as read
    const newConversations = conversations.map(c => 
      c.otherUser.email === convo.otherUser.email ? { ...c, isRead: true, unreadCount: 0 } : c
    );
    setConversations(newConversations);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        sender_email: currentUser.email,
        receiver_email: selectedConversation.otherUser.email,
        content: newMessage.trim(),
      };

      if (relatedBake) {
        messageData.bake_id = relatedBake.id;
      }

      await Message.create(messageData);
      setNewMessage("");
      loadMessages(selectedConversation.otherUser.email, relatedBake?.id);
      loadConversations(currentUser);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversation List */}
          <div className={`md:col-span-1 lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden ${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col`}>
            <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <h2 className="text-2xl font-bold">Inbox</h2>
              <p className="text-purple-100 text-sm">Your conversations</p>
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.length > 0 ? conversations.map(convo => (
                <div
                  key={convo.otherUser.email}
                  onClick={() => handleConversationSelect(convo)}
                  className={`p-4 flex items-center gap-3 cursor-pointer border-b border-purple-50 hover:bg-purple-50 transition-colors ${
                    selectedConversation?.otherUser.email === convo.otherUser.email ? 'bg-purple-100' : ''
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={convo.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${convo.otherUser.email}`} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                    {convo.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {convo.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate text-gray-900">{convo.otherUser.full_name}</h3>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(convo.lastMessageDate), 'p')}
                      </p>
                    </div>
                    <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                      {convo.lastMessage}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start messaging bakers by clicking the message button on their posts!</p>
                </div>
              )}
            </div>
          </div>

          {/* Message View */}
          <div className={`md:col-span-2 lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 flex flex-col overflow-hidden ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-pink-100 flex items-center gap-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden text-white hover:bg-white/20" 
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <img 
                    src={selectedConversation.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser.email}`} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{selectedConversation.otherUser.full_name}</h3>
                    <p className="text-pink-100 text-sm">{selectedConversation.otherUser.email}</p>
                  </div>
                </div>

                {/* Related Bake Context */}
                {relatedBake && (
                  <div className="p-4 bg-orange-50 border-b border-orange-200">
                    <div className="flex items-center gap-3">
                      <Image className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">About: {relatedBake.title}</p>
                        <Link 
                          to={createPageUrl(`BakeDetail?id=${relatedBake.id}`)}
                          className="text-xs text-orange-600 hover:underline"
                        >
                          View this bake →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_email === currentUser.email ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-lg shadow-sm ${
                        msg.sender_email === currentUser.email 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.sender_email === currentUser.email ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {format(new Date(msg.created_date), 'p')}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-gray-500 mb-2">Start your conversation!</p>
                        {relatedBake && (
                          <p className="text-sm text-gray-400">Ask about "{relatedBake.title}"</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-pink-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 resize-none border-gray-300 focus:border-purple-400 rounded-xl"
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl" 
                      size="icon"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to your Inbox</h3>
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}