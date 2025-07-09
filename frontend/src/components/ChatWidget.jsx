import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatWindow from "./ChatWindow";

export default function ChatWidget({ genres }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <ChatWindow genres={genres} onClose={() => setIsOpen(false)} />}
      <div
        className="fixed bottom-5 right-5 bg-orange-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform z-50"
        onClick={() => setIsOpen(true)}
        title="Open Chat"
      >
        <FaComments size={24} />
      </div>
    </>
  );
}