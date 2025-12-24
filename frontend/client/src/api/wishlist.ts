import { api } from "./auth";

export function addToWishlist(bookId: string) {
  return api.post("/wishlist", { bookId });
}

export function getWishlist() {
  return api.get("/wishlist");
}

export function removeFromWishlist(bookId: string) {
  return api.delete(`/wishlist/${bookId}`);
}
