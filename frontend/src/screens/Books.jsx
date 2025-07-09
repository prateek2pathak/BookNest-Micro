import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import Footer from "../components/Footer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    setLoading(true);
    await fetch(`${BACKEND_URL}/api/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks(books.filter((b) => b._id !== id));
    setLoading(false);
  };

  const genres = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Non-Fiction",
    "Other"
  ];

  // filter books based on search
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.genre.toLowerCase().includes(search.toLowerCase())
  );

  // group books by genre
  const booksByGenre = genres.reduce((acc, genre) => {
    acc[genre] = filteredBooks.filter((book) => book.genre === genre);
    return acc;
  }, {});
  // books with genres not in the predefined list
  const otherBooks = filteredBooks.filter(
    (book) => !genres.includes(book.genre)
  );

  return (
    <div className="bg-zinc-900 text-white min-h-screen relative flex flex-col">
      <Navbar />
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-orange-400 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span className="text-orange-300 font-semibold">Loading...</span>
          </div>
        </div>
      )}
      <div className="pt-24 px-6 text-3xl font-extrabold text-orange-400 drop-shadow mb-4 text-center tracking-tight">
        Books
      </div>
      <div className="container mx-auto px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          {role === "admin" && (
            <button
              className="bg-orange-600 hover:from-orange-600 hover:to-orange-500 px-5 py-2 rounded-lg font-semibold shadow transition"
              onClick={() => navigate("/books/new")}
            >
              + Add Book
            </button>
          )}
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            className="flex-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* List books grouped by genre */}
        {genres.map((genre) =>
          booksByGenre[genre] && booksByGenre[genre].length > 0 ? (
            <div key={genre} className="mb-10">
              <h2 className="text-2xl font-bold text-orange-300 mb-4 border-l-4 border-orange-400 pl-3">
                {genre}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {booksByGenre[genre].map((book) => (
                  <div
                    key={book._id}
                    className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.025] transition-transform"
                  >
                    <div>
                      {book.imageUrl && (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="mb-4 mx-auto rounded-lg max-h-40 object-contain border border-zinc-700 bg-zinc-900 shadow"
                        />
                      )}
                      <h2 className="text-xl font-bold text-orange-400 mb-1 truncate">
                        {book.title}
                      </h2>
                      <p className="text-zinc-300 mb-1 truncate">by {book.author}</p>
                      <p className="italic text-zinc-400">{book.genre}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        className="bg-zinc-900 text-orange-400 px-3 py-1 rounded hover:bg-zinc-700 transition"
                        onClick={() => navigate(`/books/${book._id}`)}
                      >
                        View Details
                      </button>
                      {role === "admin" && (
                        <div className="flex gap-2">
                          <button
                            className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded"
                            onClick={() => navigate(`/books/edit/${book._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                            onClick={() => handleDelete(book._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
        {/* Other genres */}
        {otherBooks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-orange-300 mb-4 border-l-4 border-orange-400 pl-3">Other</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {otherBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.025] transition-transform"
                >
                  <div>
                    {book.imageUrl && (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="mb-4 mx-auto rounded-lg max-h-40 object-contain border border-zinc-700 bg-zinc-900 shadow"
                      />
                    )}
                    <h2 className="text-xl font-bold text-orange-400 mb-1 truncate">
                      {book.title}
                    </h2>
                    <p className="text-zinc-300 mb-1 truncate">by {book.author}</p>
                    <p className="italic text-zinc-400">{book.genre}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      className="bg-zinc-900 text-orange-400 px-3 py-1 rounded hover:bg-zinc-700 transition"
                      onClick={() => navigate(`/books/${book._id}`)}
                    >
                      View Details
                    </button>
                    {role === "admin" && (
                      <div className="flex gap-2">
                        <button
                          className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded"
                          onClick={() => navigate(`/books/edit/${book._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                          onClick={() => handleDelete(book._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatWidget genres={genres} />
      <Footer />
    </div>
  );
}