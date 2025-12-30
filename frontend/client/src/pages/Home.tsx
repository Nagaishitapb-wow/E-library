import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { Link } from "react-router-dom";
import "../styles/home.css";

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  description?: string;
  rating?: number;
  pdfUrl?: string;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x600?text=No+Cover+Available";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [visibleBooksCount, setVisibleBooksCount] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("📡 Fetching books...");

    api.get("/books?page=1&limit=100")
      .then((res: any) => {
        console.log("📘 Books received:", res.data);
        // Handle paginated response structure
        setBooks(res.data.data || res.data);
      })
      .catch((err: any) => {
        console.log("❌ BOOK FETCH ERROR:", err);
      });
  }, []);

  const handleLoadMore = () => {
    setVisibleBooksCount(prev => prev + 8);
  };

  console.log("Home Mounted");

  // Filter books based on search term
  const filteredBooks = books.filter(book => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower)
    );
  });

  const visibleBooks = filteredBooks.slice(0, visibleBooksCount);

  return (
    <div className="home-container">

      {/* HERO SECTION */}
      <section className="hero">
        <h1>Explore Books, Read & Learn</h1>
        <p>Free Browsing • Login to Borrow • Save to Wishlist</p>

        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="home-search-input"
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* BOOK LIST */}
      <section className="book-section">
        <h2>Books {searchTerm && `(${filteredBooks.length} results)`}</h2>

        {filteredBooks.length === 0 ? (
          <p className="no-results">No books found matching "{searchTerm}". Try a different search term.</p>
        ) : (
          <>
            <div className="book-grid">
              {visibleBooks.map(book => (
                <div key={book._id} className="book-card">
                  <Link to={`/book/${book._id}`}>
                    <img
                      src={book.coverImage || PLACEHOLDER_IMAGE}
                      alt={book.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </Link>
                  <h4>{book.title}</h4>
                  <p className="author">{book.author}</p>

                  <Link className="btn" to={`/book/${book._id}`}>
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            {visibleBooksCount < filteredBooks.length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}
