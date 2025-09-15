'use client';
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME;
import { Message } from "@/types/message";
import { useWebSocket } from "@/contexts/WebSocketContext";

interface User {
  _id: string;
  name: string;
  profile_id: string;
  image?: string;
}

interface ChatPartner {
  _id: string;
  name: string;
  profile_id: string;
  image?: string;
  email?: string;
}

export default function ChatPageClient() {
  const searchParams = useSearchParams();
  const { socket, isConnected } = useWebSocket();
  const [user, setUser] = useState<User | null>(null);
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPartner, setIsLoadingPartner] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get chat partner info from URL params
  const chatWithName = searchParams.get("name");
  const chatWithProfileId = searchParams.get("profile_id") || searchParams.get("public_id");
  
  // Get current user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          _id: userData._id,
          name: userData.name || 'Unknown User',
          profile_id: userData.profile_id || userData._id,
          image: userData.image
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      console.log('No user data found in localStorage');
    }
  }, []);
  
  // Fetch chat partner's profile
  useEffect(() => {
    // Helper function to fetch all profiles and find the matching one
    const fetchAllProfilesAndFind = async (profileId: string) => {
      try {
        const allProfilesResponse = await fetch('/api/profiles');
        if (!allProfilesResponse.ok) throw new Error('Failed to fetch profiles');
        
        const profiles = await allProfilesResponse.json();
        const partnerData = Array.isArray(profiles) 
          ? profiles.find(p => p.profile_id === profileId || p._id === profileId)
          : null;
        
        if (partnerData) {
          setChatPartner({
            _id: partnerData._id,
            name: partnerData.name || 'Unknown User',
            profile_id: partnerData.profile_id || partnerData._id,
            image: partnerData.image,
            email: partnerData.email
          });
        } else {
          throw new Error('Profile not found in the list');
        }
      } catch (err) {
        console.error('Error in fetchAllProfilesAndFind:', err);
        throw err; // Re-throw to be caught by the outer catch
      }
    };

    const fetchChatPartner = async () => {
      if (!chatWithProfileId) return;
      
      try {
        setIsLoadingPartner(true);
        // First try to fetch the profile directly by ID
        const response = await fetch(`/api/profiles/${chatWithProfileId}`);
        
        if (!response.ok) {
          // If we get a 404, try falling back to fetching all profiles
          if (response.status === 404) {
            console.log('Profile not found with direct ID, trying to fetch all profiles...');
            return await fetchAllProfilesAndFind(chatWithProfileId);
          }
          const errorData = await response.text();
          console.error('Profile API error:', errorData);
          throw new Error('Failed to fetch chat partner profile');
        }
        
        const partnerData = await response.json();
        
        setChatPartner({
          _id: partnerData._id,
          name: partnerData.name || 'Unknown User',
          profile_id: partnerData.profile_id || partnerData._id,
          image: partnerData.image,
          email: partnerData.email
        });
      } catch (err) {
        console.error('Error in fetchChatPartner:', err);
        // Fallback to URL params if available
        if (chatWithName) {
          setChatPartner({
            _id: chatWithProfileId || '',
            name: chatWithName,
            profile_id: chatWithProfileId || ''
          });
        }
      } finally {
        setIsLoadingPartner(false);
      }
    };

    fetchChatPartner();
  }, [chatWithProfileId, chatWithName]);

  // Log the URL parameters for debugging
  useEffect(() => {
    console.log('Chat page loaded with params:', {
      chatWithName,
      chatWithProfileId,
      chatPartner,
      allParams: Object.fromEntries(searchParams.entries()),
      isConnected,
      currentUser: user
    });
    
    if (!chatWithProfileId) {
      console.error('Missing required chat partner ID in URL parameters');
      setError('Chat partner ID is missing');
      return;
    }
  }, [searchParams, chatWithProfileId, isConnected, user, chatPartner]);

  // Join user's room when socket and user are available
  useEffect(() => {
    if (socket && isConnected && user?.profile_id) {
      console.log('Joining room for user:', user.profile_id);
      socket.emit('join', user.profile_id);
      
      // Set up a periodic check to rejoin if needed
      const interval = setInterval(() => {
        if (socket.disconnected) {
          console.log('Socket disconnected, attempting to reconnect...');
          socket.connect();
        }
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [socket, isConnected, user?.profile_id]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(m => m._id === message._id);
        if (messageExists) return prev;
        
        return [...prev, message];
      });
    };

    const handleMessageError = (error: Error) => {
      console.error('Error receiving message:', error);
      setError('Error receiving message. Please refresh the page.');
    };

    socket.on('private message', handleNewMessage);
    socket.on('error', handleMessageError);

    return () => {
      socket.off('private message', handleNewMessage);
      socket.off('error', handleMessageError);
    };
  }, [socket]);

  // Initial message fetch when component mounts
  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!user?.profile_id || !chatWithProfileId) return;
      
      try {
        setIsLoading(true);
        const url = `/api/messages?profile_id=${encodeURIComponent(user.profile_id)}&chatWith=${encodeURIComponent(chatWithProfileId)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching initial messages:', err);
        setError('Failed to load messages. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMessages();
  }, [user?.profile_id, chatWithProfileId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      // Ensure timestamp is a valid date string
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return '';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current user from localStorage if not in state
    const currentUser = user || (() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return {
            _id: userData._id,
            name: userData.name || 'Unknown User',
            profile_id: userData.profile_id || userData._id,
            image: userData.image
          };
        } catch (e) {
          console.error('Error parsing user data:', e);
          return null;
        }
      }
      return null;
    })();
    
    if (!newMessage.trim() || !currentUser?.profile_id || !chatWithProfileId) {
      const errorMsg = 'Cannot send message: missing required data';
      console.error(errorMsg, {
        hasMessage: !!newMessage.trim(),
        hasProfileId: !!currentUser?.profile_id,
        hasChatWith: !!chatWithProfileId,
        chatWithProfileId,
        currentUser: currentUser?.profile_id,
        isSocketConnected: socket?.connected
      });
      setError(errorMsg);
      return;
    }
    
    const messageToSend = newMessage;
    setNewMessage('');
    
    // Create a temporary message with ISO string timestamp
    const tempId = `temp-${Date.now()}`;
    const tempTimestamp = new Date().toISOString();
    
    const newMsg: Message = {
      _id: tempId,
      senderId: currentUser.profile_id,
      receiverId: chatWithProfileId,
      text: messageToSend,
      timestamp: tempTimestamp,
      read: false
    };
    
    // Optimistic update
    setMessages(prev => [...prev, newMsg]);
    
    try {
      if (!socket) {
        throw new Error('WebSocket connection not available');
      }
      
      // Ensure socket is connected before sending
      if (socket.disconnected) {
        console.log('Socket disconnected, attempting to reconnect...');
        socket.connect();
        
        // Wait for connection or timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 5000);
          
          const onConnect = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          
          socket.once('connect', onConnect);
          socket.once('connect_error', (err: Error) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      }
      
      // Send message via WebSocket
      socket.emit('private message', {
        to: chatWithProfileId,
        message: {
          ...newMsg,
          // Include sender info for the receiver
          senderInfo: {
            _id: currentUser._id,
            name: currentUser.name,
            profile_id: currentUser.profile_id,
            image: currentUser.image
          }
        }
      });
      
      // Also save to the database via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.profile_id,
          receiverId: chatWithProfileId,
          text: messageToSend,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save message:', response.status, errorText);
        // Don't throw error here as WebSocket might have already delivered the message
      } else {
        const responseData = await response.json();
        console.log('Message saved successfully:', responseData);
        
        // Update the temporary message with the server-generated ID
        if (responseData.data?._id) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempId 
                ? { ...msg, _id: responseData.data._id }
                : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      
      // Attempt to reconnect if needed
      if (socket && !socket.connected) {
        console.log('Attempting to reconnect...');
        socket.connect();
      }
    }
  };

  if (isLoading || isLoadingPartner) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-lg text-gray-300">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={chatPartner?.profile_id ? 
                `https://res.cloudinary.com/${cloudName}/image/upload/${chatPartner.profile_id}.png` : 
                chatPartner?.image || ''
              }
              alt={chatPartner?.name || 'Profile'}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // If we have a fallback image and it's not the same as the current src
                if (chatPartner?.image && target.src !== chatPartner.image) {
                  target.src = chatPartner.image;
                } else {
                  // If no fallback image, show placeholder
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.classList.remove('hidden');
                  }
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-gray-600 text-gray-200 flex items-center justify-center hidden">
              {chatPartner?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              {chatPartner?.name || 'Chat'}
            </h1>
            {chatPartner?.email && (
              <p className="text-xs text-gray-400">{chatPartner.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {!isConnected && (
          <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-100 p-4 mb-4 rounded-r" role="alert">
            <p className="font-bold">Connection Status</p>
            <p>Reconnecting to chat service... Messages may be delayed.</p>
          </div>
        )}
        
        {error && (
          <div key="error-message" className="text-red-300 text-center p-3 bg-red-900/50 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div key="no-messages" className="flex items-center justify-center h-64 text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === user?.profile_id;
            const senderProfileId = isCurrentUser ? user?.profile_id : chatPartner?.profile_id;
            const senderName = isCurrentUser ? user?.name : chatPartner?.name;
            
            return (
              <div
                key={message._id}
                className={`flex items-end space-x-2 ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isCurrentUser && (
                  <div className="relative">
                    <img 
                      src={senderProfileId ? 
                        `https://res.cloudinary.com/${cloudName}/image/upload/${senderProfileId}.png` : 
                        ''
                      }
                      alt={senderName || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-600 text-gray-200 flex items-center justify-center text-xs hidden">
                      {senderName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
                {isCurrentUser && (
                  <div className="relative">
                    <img 
                      src={senderProfileId ? 
                        `https://res.cloudinary.com/${cloudName}/image/upload/${senderProfileId}.png` : 
                        ''
                      }
                      alt={senderName || 'You'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs hidden">
                      {senderName?.charAt(0).toUpperCase() || 'Y'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

