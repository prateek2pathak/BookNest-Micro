import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const url = `${BACKEND_URL}/api/books/${id}`;

  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBook(data);
    };
    
    const fetchComments = async () => {
      const res = await fetch(`${BACKEND_URL}/api/comments/books/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(data);
    };
    
    // Fetch both, then set loading to false
    Promise.all([fetchBook(), fetchComments()]).finally(() => setLoading(false));
  }, [id, token, url]);

  const handleAddComment = async () => {
    if (!commentText.trim() || isAddingComment) return;
    
    setIsAddingComment(true);
    
    // Create optimistic comment for immediate UI update
    const optimisticComment = {
      _id: `temp-${Date.now()}`, // Temporary ID
      text: commentText.trim(),
      user: username,
      date: new Date().toISOString(),
      bookId: id,
      isOptimistic: true // Flag to identify optimistic comments
    };
    
    // Add optimistic comment immediately to UI
    setComments(prevComments => [optimisticComment, ...prevComments]);
    const currentCommentText = commentText;
    setCommentText(""); // Clear input immediately
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/comments/books/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          text: currentCommentText.trim()
        }),
      });
      
      if (res.ok) {
        const newComment = await res.json();
        
        // Replace optimistic comment with real comment from server
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === optimisticComment._id 
              ? { ...newComment, isOptimistic: false }
              : comment
          )
        );
      } else {
        // If API call fails, remove optimistic comment and show error
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== optimisticComment._id)
        );
        setCommentText(currentCommentText); // Restore comment text
        
        const errorData = await res.json();
        alert(errorData.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      
      // Remove optimistic comment on error
      setComments(prevComments => 
        prevComments.filter(comment => comment._id !== optimisticComment._id)
      );
      setCommentText(currentCommentText); // Restore comment text
      alert("Failed to add comment");
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        // Remove comment from local state
        setComments(comments.filter(comment => comment._id !== commentId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  // Sort comments latest to oldest
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="bg-zinc-900 text-white min-h-screen relative">
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
      {book && (
        <div className="pt-24 px-6 max-w-2xl mx-auto">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl p-8">
            {book.imageUrl && (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="mb-6 mx-auto rounded-lg max-h-64 object-contain border border-zinc-700 bg-zinc-900"
              />
            )}
            <h1 className="text-3xl font-bold text-orange-400 mb-2">{book.title}</h1>
            <p className="text-lg text-zinc-300 mb-1">by {book.author}</p>
            <p className="italic text-zinc-400 mb-4">{book.genre}</p>
            <p className="mb-6">{book.description}</p>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2 text-orange-400">Comments</h2>
              {/* Comment box on top */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentText.trim() && !isAddingComment) {
                      handleAddComment();
                    }
                  }}
                  disabled={isAddingComment}
                />
                <button
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isAddingComment}
                >
                  {isAddingComment ? "Adding..." : "Comment"}
                </button>
              </div>
              <div className="space-y-2">
                {sortedComments.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  sortedComments.map((c, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-bold text-orange-400">{c.user}</span>: {c.text}
                          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                            {new Date(c.date).toLocaleString()}
                            {c.isOptimistic && (
                              <span className="text-yellow-400 text-xs">
                                <svg className="inline w-3 h-3 animate-spin mr-1" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"></circle>
                                  <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0l-4 4-4-4v4z"></path>
                                </svg>
                                Sending...
                              </span>
                            )}
                          </div>
                        </div>
                        {(role === "admin" || c.user === username) && !c.isOptimistic && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="ml-2 text-red-400 hover:text-red-300 text-sm font-medium"
                            title="Delete comment"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}