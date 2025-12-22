import axios from "axios";

const API = "http://localhost:4000/api/wishlist";

export function addToWishlist(bookId: string) {
  const token = localStorage.getItem("token");
  return axios.post(API, { bookId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getWishlist() {
  const token = localStorage.getItem("token");
  return axios.get(API, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function removeFromWishlist(bookId: string) {
  const token = localStorage.getItem("token");
  return axios.delete(`${API}/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
