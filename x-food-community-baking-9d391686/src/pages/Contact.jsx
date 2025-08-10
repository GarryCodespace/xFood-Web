import React, { useState } from "react";
import { SendEmail } from "@/services/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Phone, User, MapPin, Send, Clock, 
  MessageCircle, HelpCircle, Bug, Lightbulb 
} from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general"
  });

  const contactTypes = [
    { id: "general", label: "General Inquiry", icon: MessageCircle, color: "bg-blue-500" },
    { id: "support", label: "Technical Support", icon: HelpCircle, color: "bg-green-500" },
    { id: "bug", label: "Bug Report", icon: Bug, color: "bg-red-500" },
    { id: "feature", label: "Feature Request", icon: Lightbulb, color: "bg-yellow-500" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await SendEmail({
        to: "xfoodteam@gmail.com",
        subject: `xFood ${formData.type}: ${formData.subject}`,
        body: `
          Contact Type: ${formData.type}
          Name: ${formData.name}
          Email: ${formData.email}
          Subject: ${formData.subject}
          
          Message:
          ${formData.message}
        `,
        from_name: formData.name
      });

      alert("Message sent successfully! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "", type: "general" });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions about xFood? Want to join our community, report a bug, or share feedback? 
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Founder Card */}
            <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Garry Yuan</h3>
                    <p className="text-orange-100">UNSW Electrical Engineering</p>
                    <p className="text-sm text-orange-200">Founder & Developer</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <a href="mailto:xfoodteam@gmail.com" className="hover:text-orange-100 transition-colors">
                      xfoodteam@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <a href="tel:0451961015" className="hover:text-orange-100 transition-colors">
                      0451 961 015
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span>Response time: Within 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About xFood */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">About xFood</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    "Share what you bake. Join your local kitchen circle."
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    xFood is a community-driven platform that connects passionate home bakers 
                    in local communities. We make it easy to share your creations, discover 
                    amazing treats nearby, learn from others, and build meaningful connections 
                    through the love of baking.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">1000+</div>
                    <div className="text-sm text-gray-600">Bakes Shared</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">500+</div>
                    <div className="text-sm text-gray-600">Community Members</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl">
                    <div className="text-2xl font-bold text-pink-600">200+</div>
                    <div className="text-sm text-gray-600">Local Circles</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-600">300+</div>
                    <div className="text-sm text-gray-600">Recipes Shared</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Send className="w-6 h-6 text-orange-600" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Type */}
                <div>
                  <Label className="text-base font-medium">What can we help you with?</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {contactTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.type === type.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${
                            formData.type === type.id ? 'text-orange-600' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            formData.type === type.id ? 'text-orange-900' : 'text-gray-600'
                          }`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your inquiry"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please provide as much detail as possible..."
                    rows={6}
                    className="mt-2"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Pro tip:</strong> Include screenshots or detailed steps if you're reporting a bug or technical issue!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}