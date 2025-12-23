import { api } from "./auth";

const API = "https://e-library-jtx2.onrender.com/api/wishlist";

export function addToWishlist(bookId: string) {
  return api.post(API, { bookId }, {
    withCredentials: true
  });
}

export function getWishlist() {
  return api.get(API, {
    withCredentials: true
  });
}

export function removeFromWishlist(bookId: string) {
  return api.delete(`${API}/${bookId}`, {
    withCredentials: true
  });
}
