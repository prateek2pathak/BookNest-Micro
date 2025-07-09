import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-800 text-zinc-400 py-4 mt-10 border-t border-zinc-700 text-center">
      <span>
        &copy; {new Date().getFullYear()} BookNest &mdash; Made by <span className="text-orange-400">Prateek Pathak</span>
      </span>
    </footer>
  );
}