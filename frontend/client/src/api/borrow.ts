import axios from "axios";

// 🔥 BASE URL — required or API breaks
const API = "http://localhost:4000/api/borrow";

// Borrow a book
export async function borrowBook(bookId: string) {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/${bookId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
}

// Get user's borrowed books
export async function getMyBorrowedBooks() {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/mybooks`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
}

// Request to return a book
export async function requestReturn(borrowId: string) {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/request-return/${borrowId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
}

// Pay fine
export async function payFine(borrowId: string) {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/pay-fine/${borrowId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
}

// Admin confirms a return
export async function confirmReturn(borrowId: string) {
  const token = localStorage.getItem("token");
  return axios.post(`${API}/confirm-return/${borrowId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
}
