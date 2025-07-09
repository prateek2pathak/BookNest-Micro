import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user"
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } else setMessage(data.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white">
      <div className="w-full max-w-md bg-zinc-800 p-8 rounded-2xl shadow-2xl mt-5 border border-zinc-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-400 drop-shadow">
          Create your BookKeeper account
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition">
            Register
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-green-400 font-semibold">
            {message}
          </div>
        )}
        <div className="text-center mt-4">
          <span className="text-zinc-300">Already have an account? </span>
          <button
            className="text-orange-400 hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}