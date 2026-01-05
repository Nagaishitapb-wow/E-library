import { Router } from "express";
import { authRequired, adminRequired } from "../middleware/auth";
import { borrowBook, requestReturn, confirmReturn, getUserBorrowedBooks, getAllBorrowedBooks, payFine, getUserFines } from "../controllers/borrowController";

const router = Router();

// protected routes
router.get("/all", authRequired, adminRequired, getAllBorrowedBooks);
router.post("/:bookId", authRequired, borrowBook);
router.post("/pay-fine/:borrowId", authRequired, payFine);
router.post("/request-return/:borrowId", authRequired, requestReturn);
router.post("/confirm-return/:borrowId", authRequired, adminRequired, confirmReturn);
router.get("/mybooks", authRequired, getUserBorrowedBooks);
router.get("/myfines", authRequired, getUserFines);

export default router;
