import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function ChatWindow({ genres, onClose }) {
  const [room, setRoom] = useState(genres[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const username = localStorage.getItem("username") || "Guest";
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat service');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat service');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle room changes and message fetching
  useEffect(() => {
    if (!socket) return;

    // Join the room
    socket.emit("join_room", room);

    // Fetch existing messages for the room
    fetch(`${BACKEND_URL}/api/chat/room/${room}/recent?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        // Fallback to old endpoint
        fetch(`${BACKEND_URL}/api/chat?room=${room}`)
          .then((res) => res.json())
          .then((data) => setMessages(data.messages || []))
          .catch((err) => console.error('Fallback fetch error:', err));
      });

    // Listen for new messages
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for typing indicators
    socket.on("user_typing", (data) => {
      if (data.username !== username) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      }
    });

    socket.on("user_stop_typing", (data) => {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    });

    // Cleanup when room changes
    return () => {
      socket.emit("leave_room", room);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [room, socket, username]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket) return;

    let typingTimer;
    
    if (isTyping) {
      socket.emit("typing", { room, username });
      
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        socket.emit("stop_typing", { room, username });
      }, 1000);
    }

    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [isTyping, socket, room, username]);

  const handleSend = () => {
    if (message.trim() && socket) {
      socket.emit("send_message", {
        room,
        username,
        message: message.trim(),
        time: new Date().toLocaleTimeString()
      });
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const handleRoomChange = (newRoom) => {
    setRoom(newRoom);
    setMessages([]);
    setTypingUsers([]);
  };

  return (
    <div className="fixed bottom-24 right-5 w-80 h-[460px] bg-zinc-900 rounded-xl shadow-2xl flex flex-col z-50 border border-zinc-700">
      <div className="flex justify-between items-center bg-orange-500 text-black px-4 py-2 rounded-t-xl">
        <span className="font-semibold">📚 Book Chat</span>
        <button 
          onClick={onClose} 
          className="text-lg font-bold hover:text-gray-300 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Genre/Room Selection */}
      <div className="flex flex-wrap gap-2 p-3 bg-orange-300">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => handleRoomChange(g)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              room === g 
                ? "bg-orange-500 text-black font-semibold" 
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            #{g}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-zinc-800">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No messages yet in #{room}</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
              <strong className="text-orange-400">{msg.username}</strong>: {msg.message}
              <div className="text-[10px] text-gray-400 text-right mt-1">
                {msg.time}
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-400 italic px-3">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-700 bg-zinc-900">
        <input
          type="text"
          className="flex-1 p-2 border border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-white bg-zinc-800 placeholder-gray-400"
          placeholder={`Message #${room}`}
          value={message}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={!socket}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || !socket}
          className="bg-orange-500 text-white px-4 py-1 rounded-md text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}