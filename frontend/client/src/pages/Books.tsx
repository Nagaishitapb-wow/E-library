import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/auth";
import "../styles/books.css";


interface Book {
  _id: string;
  title: string;
  author: string;
  rating: number;
  category?: { _id: string; name: string };
  pdfUrl?: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch books
    api.get("/books")
      .then((res: any) => setBooks(res.data))
      .catch(() => alert("Failed to fetch books"))
      .finally(() => setLoading(false));

    // Fetch categories
    api.get("/categories")
      .then((res: any) => setCategories(res.data))
      .catch(() => console.log("Failed to fetch categories"));
  }, []);

  // Filter books based on category and search term
  const filteredBooks = books.filter(book => {
    const matchesCategory = !selectedCategory || book.category?._id === selectedCategory;
    const matchesSearch = !searchTerm ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading Books...</h2>;

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>Browse Books</h1>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="books-container">
        {filteredBooks.length === 0 ? (
          <p className="no-books">No books found matching your criteria.</p>
        ) : (
          filteredBooks.map(book => (
            <div key={book._id} className="book-card">
              <h3>{book.title}</h3>
              <p><b>Author:</b> {book.author}</p>
              {book.category && (
                <p className="category-badge">
                  <span>{book.category.name}</span>
                </p>
              )}
              <p><b>Rating:</b> {book.rating} ⭐</p>
              <button
                className="view-btn"
                onClick={() => navigate(`/book/${book._id}`)}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
