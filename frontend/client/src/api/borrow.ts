import { api } from "./auth";

// Borrow a book
export async function borrowBook(bookId: string) {
  return api.post(`/borrow/${bookId}`).then((res: any) => res.data);
}

export async function getMyBorrowedBooks() {
  return api.get("/borrow/mybooks").then((res: any) => res.data);
}

// Request to return a book
export async function requestReturn(borrowId: string) {
  return api.post(`/borrow/request-return/${borrowId}`).then((res: any) => res.data);
}

// Pay fine
export async function payFine(borrowId: string) {
  return api.post(`/borrow/pay-fine/${borrowId}`).then((res: any) => res.data);
}

// Admin confirms a return
export async function confirmReturn(borrowId: string) {
  return api.post(`/borrow/confirm-return/${borrowId}`).then((res: any) => res.data);
}
