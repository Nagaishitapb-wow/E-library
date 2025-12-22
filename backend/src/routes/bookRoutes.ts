import { Router } from "express";
import {
    getAllBooks,
    getBookById,
    rateBook,
    createBook,
    updateBook,
    deleteBook
} from "../controllers/bookController";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", authRequired, adminRequired, createBook);
router.put("/:id", authRequired, adminRequired, updateBook);
router.delete("/:id", authRequired, adminRequired, deleteBook);
router.post("/:id/rate", authRequired, rateBook);

export default router;
