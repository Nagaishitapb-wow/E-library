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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("📡 Fetching books...");

    api.get("/books?page=1&limit=5")
      .then((res: any) => {
        console.log("📘 Books received:", res.data);
        setBooks(res.data.data || res.data);
      })
      .catch((err: any) => {
        console.log("❌ BOOK FETCH ERROR:", err);
      });
  }, []);


  console.log("Home Mounted");

  const filteredBooks = books.filter(book => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower)
    );
  });

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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/books?search=${encodeURIComponent(searchTerm)}`;
              }
            }}
            className="home-search-input"
          />
          <button
            className="search-submit-btn"
            onClick={() => {
              window.location.href = `/books?search=${encodeURIComponent(searchTerm)}`;
            }}
          >
            Search
          </button>
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
              {filteredBooks.map(book => (
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

            <div className="load-more-container">
              <Link to="/books" className="load-more-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Browse More Books
              </Link>
            </div>
          </>
        )}
      </section>

    </div>
  );
}
