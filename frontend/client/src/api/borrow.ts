import { api } from "./auth";

// 🔥 BASE URL — required or API breaks
const API = "https://e-library-jtx2.onrender.com/api/borrow";

// Borrow a book
export async function borrowBook(bookId: string) {
  return api.post(`${API}/${bookId}`, {}, {
    withCredentials: true
  }).then(res => res.data);
}

// Get user's borrowed books
export async function getMyBorrowedBooks() {
  return api.get(`${API}/mybooks`, {
    withCredentials: true
  }).then(res => res.data);
}

// Request to return a book
export async function requestReturn(borrowId: string) {
  return api.post(`${API}/request-return/${borrowId}`, {}, {
    withCredentials: true
  }).then(res => res.data);
}

// Pay fine
export async function payFine(borrowId: string) {
  return api.post(`${API}/pay-fine/${borrowId}`, {}, {
    withCredentials: true
  }).then(res => res.data);
}

// Admin confirms a return
export async function confirmReturn(borrowId: string) {
  return api.post(`${API}/confirm-return/${borrowId}`, {}, {
    withCredentials: true
  }).then(res => res.data);
}
