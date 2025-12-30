import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/auth";
import "../styles/books.css";
import SkeletonBook from "../components/SkeletonBook";

interface Book {
  _id: string;
  title: string;
  author: string;
  rating: number;
  category?: { _id: string; name: string };
  pdfUrl?: string;
  coverImage?: string;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x600?text=No+Cover+Available";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const navigate = useNavigate();

  const BOOKS_PER_PAGE = 12;

  useEffect(() => {
    fetchBooks();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    // Fetch categories once
    api.get("/categories?page=1&limit=100")
      .then((res: any) => setCategories(res.data.data || res.data))
      .catch(() => console.log("Failed to fetch categories"));
  }, []);

  const fetchBooks = () => {
    setLoading(true);
    const categoryParam = selectedCategory ? `&category=${selectedCategory}` : "";

    api.get(`/books?page=${currentPage}&limit=${BOOKS_PER_PAGE}${categoryParam}`)
      .then((res: any) => {
        setBooks(res.data.data || res.data);
        setPagination(res.data.pagination);
      })
      .catch(() => alert("Failed to fetch books"))
      .finally(() => setLoading(false));
  };

  // Filter books based on search term (client-side for current page)
  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchTerm ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            onChange={(e) => handleCategoryChange(e.target.value)}
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
        {loading ? (
          // Show 8 skeletons while loading
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBook key={i} />
          ))
        ) : filteredBooks.length === 0 ? (
          <p className="no-books">No books found matching your criteria.</p>
        ) : (
          filteredBooks.map(book => (
            <div key={book._id} className="book-card">
              <div
                className="book-card-img-wrapper"
                onClick={() => navigate(`/book/${book._id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={book.coverImage || PLACEHOLDER_IMAGE}
                  alt={book.title}
                  className="book-card-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
            <span className="total-books"> ({pagination.total} books)</span>
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
