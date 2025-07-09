import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-800 z-50 flex items-center justify-between px-8 py-4 shadow-lg">
      <div
        className="cursor-pointer flex flex-col group"
        onClick={() => navigate("/books")}
      >
        <span className="text-2xl font-extrabold text-orange-400 tracking-tight drop-shadow group-hover:text-orange-300 transition">
          BookNest
        </span>
        <span className="text-xs text-orange-200 tracking-wide italic group-hover:text-orange-100 transition">
          Where readers gather and stories grow
        </span>
      </div>
      <div className="flex gap-4 items-center">
        {username && (
          <span className="bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700 text-orange-300 font-semibold flex items-center gap-1 shadow">
            <svg
              className="w-4 h-4 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v1a1 1 0 001 1h12a1 1 0 001-1v-1c0-2-3-4-7-4z" />
            </svg>
            {username}
            <span className="text-xs text-zinc-400 ml-1">({role})</span>
          </span>
        )}
        <button
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
          onClick={handleLogout}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}