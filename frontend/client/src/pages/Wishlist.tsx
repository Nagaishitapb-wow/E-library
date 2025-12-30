import { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../api/wishlist";
import "../styles/wishlist.css";

interface WishlistItem {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  createdAt: string;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x600?text=No+Cover+Available";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);  // FIXED TYPE
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        const res = await getWishlist();
        setWishlist(res.data);
      } catch (err: unknown) {   // FIXED ERROR TYPE
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="wishlist-container">
      <h1>My Wishlist ❤️</h1>

      <div className="wishlist-grid">
        {wishlist.map(item => (
          <div key={item._id} className="wishlist-card">
            <img
              src={item.bookId.coverImage || PLACEHOLDER_IMAGE}
              alt={item.bookId.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />

            <h3>{item.bookId.title}</h3>
            <p>{item.bookId.author}</p>

            <button
              className="btn remove"
              onClick={async () => {
                try {
                  const confirmDelete = window.confirm("Are you sure you want to remove this book from your wishlist?");
                  if (!confirmDelete) return;

                  await removeFromWishlist(item.bookId._id);
                  setWishlist(prev => prev.filter(w => w.bookId._id !== item.bookId._id));
                  // optionally toast success
                } catch (e) { console.error(e); }
              }}
            >
              Remove ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
