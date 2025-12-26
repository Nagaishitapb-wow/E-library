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
  reviews?: { user: { _id: string; name: string }; rating: number; comment?: string }[];
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x600?text=No+Cover+Available";

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
      const res = await api.post(`/books/${book._id}/rate`, { rating: userRating, comment });
      toast.success("⭐ Rating submitted!");

      // Update book data with the populated one from response
      if (res.data.book) {
        setBook(res.data.book);
      } else {
        // Fallback if structure is different
        const refreshRes = await api.get(`/books/${id}`);
        setBook(refreshRes.data as Book);
      }

      setComment("");
      setUserRating(0);
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

      <img
        src={book.coverImage || PLACEHOLDER_IMAGE}
        alt={book.title}
        className="book-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
        }}
      />

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
                  const errorMsg = err.response?.data?.message || err.message || "Borrow failed";
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
                  const errorMsg = err.response?.data?.message || err.message || "Wishlist action failed";
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

        {/* REVIEWS LIST SECTION */}
        <div className="reviews-list">
          <h3>Community Reviews ({book.reviews?.length || 0})</h3>
          {book.reviews && book.reviews.length > 0 ? (
            book.reviews.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{rev.user?.name || "Anonymous"}</span>
                  <span className="reviewer-rating">⭐ {rev.rating}/5</span>
                </div>
                {rev.comment && <p className="review-comment">{rev.comment}</p>}
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to rate!</p>
          )}
        </div>

      </div>
    </div>
  );
}
