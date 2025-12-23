import axios from "axios";

const API = "https://e-library-jtx2.onrender.com/api/wishlist";

export function addToWishlist(bookId: string) {
  return axios.post(API, { bookId }, {
    withCredentials: true
  });
}

export function getWishlist() {
  return axios.get(API, {
    withCredentials: true
  });
}

export function removeFromWishlist(bookId: string) {
  return axios.delete(`${API}/${bookId}`, {
    withCredentials: true
  });
}
