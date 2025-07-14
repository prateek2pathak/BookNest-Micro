import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Books from "./screens/Books";
import BookDetails from "./screens/BookDetails";
import BookForm from "./screens/BookForm";
import ServiceStatus from "./components/ServiceStatus";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  

  return (
    <>
      <Toaster position="top-center" />
      {isAuthenticated && <ServiceStatus />}
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/books"
            element={isAuthenticated ? <Books /> : <Navigate to="/login" />}
          />
          <Route
            path="/books/new"
            element={isAuthenticated ? <BookForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/books/edit/:id"
            element={isAuthenticated ? <BookForm editMode /> : <Navigate to="/login" />}
          />
          <Route
            path="/books/:id"
            element={isAuthenticated ? <BookDetails /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/books" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;