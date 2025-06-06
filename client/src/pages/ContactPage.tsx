import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, Send, Clock, CheckCircle, AlertCircle, HelpCircle, Shield, CreditCard, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ChatOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "general" | "support" | "safety" | "payment";
}

const chatOptions: ChatOption[] = [
  {
    id: "account-help",
    title: "Account Help",
    description: "Issues with login, registration, or profile setup",
    icon: <Users className="h-5 w-5" />,
    category: "general"
  },
  {
    id: "ticket-listing",
    title: "Ticket Listing Support",
    description: "Help with listing tickets, pricing, or managing listings",
    icon: <HelpCircle className="h-5 w-5" />,
    category: "support"
  },
  {
    id: "verification-issues",
    title: "Verification Problems",
    description: "Instagram or DigiLocker verification not working",
    icon: <Shield className="h-5 w-5" />,
    category: "safety"
  },
  {
    id: "payment-disputes",
    title: "Payment Disputes",
    description: "Issues with transactions or refund requests",
    icon: <CreditCard className="h-5 w-5" />,
    category: "payment"
  },
  {
    id: "safety-concerns",
    title: "Safety & Security",
    description: "Report suspicious activity or safety concerns",
    icon: <AlertCircle className="h-5 w-5" />,
    category: "safety"
  },
  {
    id: "technical-issues",
    title: "Technical Problems",
    description: "Website bugs, app crashes, or technical difficulties",
    icon: <MessageCircle className="h-5 w-5" />,
    category: "support"
  }
];

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function ContactPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    const option = chatOptions.find(opt => opt.id === optionId);
    
    if (option) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: `Hi! I'll help you with ${option.title.toLowerCase()}. ${option.description}. Please describe your specific issue below.`,
        timestamp: new Date()
      };
      
      setChatMessages([welcomeMessage]);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Thank you for your message! Our support team has received your inquiry and will respond within 24 hours. For urgent matters, please contact us directly via Instagram @ticketbazaar.co.in or email support@ticketbazaar.in.",
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const resetChat = () => {
    setSelectedOption(null);
    setChatMessages([]);
    setCurrentMessage("");
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto mobile-container">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Get help quickly with our interactive chat support or reach out to us directly.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Interactive Chat Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quick Help Chat</h2>
              {selectedOption && (
                <Button
                  onClick={resetChat}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  Start Over
                </Button>
              )}
            </div>

            {!selectedOption ? (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">What can we help you with today?</p>
                {chatOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-primary/5 rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white border border-gray-200 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="sm" className="px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Form & Info */}
          <div className="space-y-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <Input
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">support@ticketbazaar.in</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instagram</p>
                    <p className="text-gray-600">@ticketbazaar.co.in</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p className="text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}