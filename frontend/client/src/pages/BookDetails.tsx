import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/auth";
import "../styles/bookDetails.css";
import { borrowBook } from "../api/borrow";
import { toast } from "react-toastify";
import { addToWishlist } from "../api/wishlist";

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  rating: number;
  coverImage: string;
  pdfUrl?: string;
  category?: { _id: string; name: string; description?: string };
  price?: number;
  stock: number;
}

export default function BookDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    api.get(`/books/${id}`)
      .then((res: { data: Book }) => setBook(res.data))
      .catch(() => console.log("Book fetch error"));
  }, [id]);

  const handleRate = async () => {
    try {
      if (!book) return;
      await api.post(`/books/${book._id}/rate`, { rating: userRating, comment });
      toast.success("⭐ Rating submitted!");
      // Refresh book data
      const res = await api.get(`/books/${id}`);
      setBook(res.data as Book);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please login to submit a review");
      } else {
        toast.error(err.response?.data?.message || "Rating failed");
      }
    }
  };

  if (!book) return <h2 className="loading">Loading book...</h2>;

  return (
    <div className="book-details-container">

      <img src={book.coverImage} alt={book.title} className="book-cover" />

      <div className="details-box">
        <h1>{book.title}</h1>
        <p className="author">by {book.author}</p>
        <p className="desc">{book.description}</p>

        <div className="meta-info">
          <p className="rating">⭐ {book.rating} / 5</p>
          <p className="price">💰 ${book.price || "Free"}</p>
          <p className={`stock ${book.stock > 0 ? "in-stock" : "out-of-stock"}`}>
            {book.stock > 0 ? `In Stock (${book.stock})` : "Out of Stock"}
          </p>
          <p className="category">Category: {book.category?.name || "N/A"}</p>
        </div>

        <div className="actions">

          {/* BORROW BUTTON */}
          <button
            className="btn primary"
            disabled={book.stock < 1}
            onClick={async () => {
              try {
                await borrowBook(book._id);
                toast.success("📘 Book borrowed successfully!");
                setTimeout(() => navigate("/dashboard"), 900);
              } catch (err: any) {
                if (err.response?.status === 401) {
                  toast.error("Login to borrow and wishlist");
                } else {
                  const errorMsg =
                    err instanceof Error
                      ? err.message
                      : err.response?.data?.message || "Borrow failed";
                  toast.error(errorMsg);
                }
              }
            }}
          >
            {book.stock > 0 ? "Borrow 📘" : "Out of Stock 🚫"}
          </button>

          <button
            className="btn secondary"
            onClick={async () => {
              try {
                await addToWishlist(book._id);
                toast.success("❤️ Added to wishlist");
              } catch (err: any) {
                if (err.response?.status === 401) {
                  toast.error("Login to borrow and wishlist");
                } else {
                  const errorMsg =
                    err instanceof Error
                      ? err.message
                      : err.response?.data?.message || "Wishlist action failed";
                  toast.error(errorMsg);
                }
              }
            }}
          >
            ❤️ Add to Wishlist
          </button>

          {book.pdfUrl && (
            <>
              <a className="btn pdf" href={book.pdfUrl} target="_blank" rel="noreferrer">
                Read Online 📄
              </a>
              <a className="btn download" href={book.pdfUrl} download>
                Download ⬇️
              </a>
            </>
          )}
        </div>

        {/* RATING SECTION */}
        <div className="rating-section">
          <h3>Rate this Book</h3>
          <div className="star-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${userRating >= star ? "filled" : ""}`}
                onClick={() => setUserRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Write a review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn rate-submit" onClick={handleRate}>Submit Review</button>
        </div>

      </div>
    </div>
  );
}
