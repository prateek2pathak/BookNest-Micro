import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Non-Fiction",
  "Other"
];

export default function BookForm({ editMode }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    publishedDate: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // fetch book data if in edit mode
  useEffect(() => {
    if (editMode && id) {
      const fetchBook = async () => {
        const toastId = toast.loading("Loading book...");
        try {
          const res = await fetch(`${BACKEND_URL}/api/books/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch book");
          const data = await res.json();
          setForm({
            title: data.title || "",
            author: data.author || "",
            genre: GENRES.includes(data.genre) ? data.genre : "Other",
            publishedDate: data.publishedDate ? data.publishedDate.slice(0, 10) : "",
            description: data.description || "",
            otherGenre: !GENRES.includes(data.genre) ? data.genre : "",
          });
          setPreview(data.imageUrl || null);
          toast.success("Book loaded!", { id: toastId });
        } catch (err) {
          toast.error("Failed to load book", { id: toastId });
        }
      };
      fetchBook();
    }
  }, [editMode, id, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      genre: value,
      otherGenre: value === "Other" ? prev.otherGenre || "" : "",
    }));
  };

  const handleOtherGenreChange = (e) => {
    setForm((prev) => ({
      ...prev,
      otherGenre: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `${BACKEND_URL}/api/books/${id}`
      : `${BACKEND_URL}/api/books`;
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "otherGenre") return;
      formData.append(key, value);
    });
    // if genre is "Other", use otherGenre value
    if (form.genre === "Other") {
      formData.set("genre", form.otherGenre || "Other");
    }
    if (image) formData.append("image", image);

    const toastId = toast.loading(editMode ? "Updating book..." : "Adding book...");
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to save book");
      toast.success(editMode ? "Book updated!" : "Book added!", { id: toastId });
      navigate("/books");
    } catch (err) {
      toast.error("Failed to save book", { id: toastId });
    }
  };

  return (
    <div className="bg-zinc-900 text-white min-h-screen">
      <Navbar />
      <div className="pt-24 flex flex-col items-center">
        <div className="w-full max-w-md bg-zinc-800 p-8 rounded-2xl shadow-2xl border border-zinc-700">
          <h2 className="text-2xl font-bold mb-4 text-center text-orange-400 drop-shadow">
            {editMode ? "Edit Book" : "Add Book"}
          </h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <input
              name="title"
              placeholder="Title"
              className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="author"
              placeholder="Author"
              className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.author}
              onChange={handleChange}
              required
            />
            <select
              name="genre"
              className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.genre}
              onChange={handleGenreChange}
              required
            >
              <option value="">Select Genre</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {form.genre === "Other" && (
              <input
                name="otherGenre"
                placeholder="Enter genre"
                className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.otherGenre || ""}
                onChange={handleOtherGenreChange}
                required
              />
            )}
            <input
              name="publishedDate"
              type="date"
              className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.publishedDate}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              className="p-3 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.description}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block mb-1 text-orange-400 font-semibold">
                Book Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-white"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 rounded shadow max-h-40 object-contain border border-zinc-700"
                />
              )}
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition">
              {editMode ? "Update" : "Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}