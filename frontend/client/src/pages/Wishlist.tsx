import { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../api/wishlist";
import { Heart, Trash2 } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

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

  const handleRemoveClick = (bookId: string) => {
    setSelectedBookId(bookId);
    setIsModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedBookId) return;
    try {
      await removeFromWishlist(selectedBookId);
      setWishlist(prev => prev.filter(w => w.bookId._id !== selectedBookId));
      toast.success("Book removed from wishlist");
    } catch (e) {
      toast.error("Failed to remove book");
      console.error(e);
    } finally {
      setIsModalOpen(false);
      setSelectedBookId(null);
    }
  };

  if (loading) return <Loader fullPage message="Fetching your wishlist..." />;

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title">
        My Wishlist <Heart size={32} fill="#ef4444" color="#ef4444" />
      </h1>

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
              onClick={() => handleRemoveClick(item.bookId._id)}
            >
              <Trash2 size={18} /> Remove
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Remove from Wishlist"
        message="Are you sure you want to remove this book from your wishlist?"
        onConfirm={handleConfirmRemove}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
}
