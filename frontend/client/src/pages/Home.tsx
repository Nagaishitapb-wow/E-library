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

  useEffect(() => {
    console.log("📡 Fetching books...");

    api.get("/books")
      .then((res: any) => {
        console.log("📘 Books received:", res.data);
        setBooks(res.data);
      })
      .catch((err: any) => {
        console.log("❌ BOOK FETCH ERROR:", err);
      });
  }, []);

  const handleLoadMore = () => {
    setVisibleBooksCount(prev => prev + 8);
  };

  console.log("Home Mounted");

  const visibleBooks = books.slice(0, visibleBooksCount);

  return (
    <div className="home-container">

      {/* HERO SECTION */}
      <section className="hero">
        <h1>Explore Books, Read & Learn</h1>
        <p>Free Browsing • Login to Borrow • Save to Wishlist</p>
      </section>

      {/* BOOK LIST */}
      <section className="book-section">
        <h2>Books</h2>

        <div className="book-grid">
          {visibleBooks.map(book => (
            <div key={book._id} className="book-card">
              <img
                src={book.coverImage || PLACEHOLDER_IMAGE}
                alt={book.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
              <h4>{book.title}</h4>
              <p className="author">{book.author}</p>

              <Link className="btn" to={`/book/${book._id}`}>
                View Details
              </Link>
            </div>
          ))}
        </div>

        {visibleBooksCount < books.length && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={handleLoadMore}>
              Load More
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
