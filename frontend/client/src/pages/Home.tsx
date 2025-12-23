import { useEffect, useState } from "react";
import axios from "axios";
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

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    console.log("📡 Fetching books...");

    axios.get("https://e-library-jtx2.onrender.com/api/books")
      .then(res => {
        console.log("📘 Books received:", res.data);
        setBooks(res.data);
      })
      .catch(err => {
        console.log("❌ BOOK FETCH ERROR:", err);
      });
  }, []);

  console.log("Home Mounted");

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
          {books.map(book => (
            <div key={book._id} className="book-card">
              <img
                src={book.coverImage || "/placeholder-book.png"}
                alt={book.title}
              />
              <h4>{book.title}</h4>
              <p className="author">{book.author}</p>

              <Link className="btn" to={`/book/${book._id}`}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
