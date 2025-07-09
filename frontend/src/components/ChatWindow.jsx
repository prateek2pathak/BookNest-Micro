import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL);

export default function ChatWindow({ genres, onClose }) {
  const [room, setRoom] = useState(genres[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const username = localStorage.getItem("username") || "Guest";
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("join_room", room);
    fetch(`${BACKEND_URL}/api/messages?room=${room}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.emit("leave_room", room);
      socket.off("receive_message");
    };
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit("send_message", {
        room,
        username,
        message,
        time: new Date().toLocaleTimeString(),
      });
      setMessage("");
    }
  };

  return (
    <div className="fixed bottom-24 right-5 w-80 h-[460px] bg-zinc-900 rounded-xl shadow-2xl flex flex-col z-50 border border-zinc-700">
      <div className="flex justify-between items-center bg-orange-500 text-black px-4 py-2 rounded-t-xl">
        <span className="font-semibold">📚 Book Chat</span>
        <button onClick={onClose} className="text-lg font-bold hover:text-gray-300">
          ×
        </button>
      </div>
      <div className="flex flex-wrap gap-2 p-3 bg-orange-300">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setRoom(g)}
            className={`px-3 py-1 text-sm rounded-full transition ${
              room === g ? "bg-orange-500 text-black" : "bg-gray-200 text-black"
            }`}
          >
            #{g}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-zinc-800">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
            <strong className="text-orange-400">{msg.username}</strong>: {msg.message}
            <div className="text-[10px] text-gray-400 text-right">{msg.time}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-700 bg-zinc-900">
        <input
          type="text"
          className="flex-1 p-2 border border-zinc-700 rounded-md text-sm focus:outline-none text-white bg-zinc-800"
          placeholder={`Message #${room}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-orange-500 text-white px-4 py-1 rounded-md text-sm hover:bg-orange-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}