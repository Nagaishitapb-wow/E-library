import axios from "axios";

const API = "http://localhost:4000/api/wishlist";

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
