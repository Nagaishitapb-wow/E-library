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
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, activeBorrows: 0 });

  useEffect(() => {
    console.log("📡 Fetching Top Picks...");
    api.get("/books?page=1&limit=5&sortBy=rating")
      .then((res: any) => {
        setBooks(res.data.data || res.data);
      })
      .catch((err: any) => {
        console.log("❌ BOOK FETCH ERROR:", err);
      });

    // Fetch live stats
    api.get("/books/stats")
      .then((res: any) => {
        setStats(res.data);
      })
      .catch((err: any) => {
        console.log("❌ STATS FETCH ERROR:", err);
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
        <h2>🔥 Top Picks {searchTerm && `(${filteredBooks.length} results)`}</h2>

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

      {/* CATEGORIES PREVIEW */}
      <section className="categories-preview">
        <div className="section-header">
          <h2>Popular Categories</h2>
          <p>Find your next read in our most popular genres</p>
        </div>
        <div className="category-grid">
          {[
            { name: "Fiction", icon: "📖", color: "#f43f5e" },
            { name: "Children", icon: "👶", color: "#fbbf24" },
            { name: "Programming", icon: "💻", color: "#3b82f6" },
            { name: "Science", icon: "🧠", color: "#8b5cf6" }
          ].map((cat, idx) => (
            <Link key={idx} to={`/books`} className="category-card" style={{ "--cat-color": cat.color } as any}>
              <span className="cat-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <span className="cat-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="section-header">
          <h2 style={{ color: 'white' }}>Library Growth</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Real-time impact of our community and collection</p>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalBooks}+</span>
            <span className="stat-label">Books</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalUsers}+</span>
            <span className="stat-label">Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.activeBorrows}+</span>
            <span className="stat-label">Active Borrows</span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-header">
          <h2>Loved by Readers</h2>
          <p>See what our community has to say about their experience</p>
        </div>
        <div className="testimonial-grid">
          {[
            {
              text: "This library made managing borrowed books simple and efficient. The digital catalog is a life-saver for students!",
              author: "Ishita Singh",
              role: "Computer Science Student"
            },
            {
              text: "I love the wide variety of programming books available. The borrowing process is seamless and fast.",
              author: "Rahul Verma",
              role: "Engineering Student"
            },
            {
              text: "The science section is updated with the latest research papers and books. Highly recommended!",
              author: "Ananya Sharma",
              role: "Science Major"
            }
          ].map((item, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="quote-icon">“</div>
              <p>{item.text}</p>
              <div className="testimonial-author">
                <strong>{item.author}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
