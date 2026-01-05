import { Router } from "express";
import {
    getAllBooks,
    getBookById,
    rateBook,
    createBook,
    updateBook,
    deleteBook,
    bulkUpdateCategory
} from "../controllers/bookController";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.patch("/bulk-update-category", authRequired, adminRequired, bulkUpdateCategory);
router.post("/", authRequired, adminRequired, createBook);
router.put("/:id", authRequired, adminRequired, updateBook);
router.delete("/:id", authRequired, adminRequired, deleteBook);
router.post("/:id/rate", authRequired, rateBook);

export default router;
