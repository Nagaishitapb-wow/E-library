import { Router } from "express";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController";

import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", authRequired, adminRequired, createCategory);
router.put("/:id", authRequired, adminRequired, updateCategory);
router.delete("/:id", authRequired, adminRequired, deleteCategory);

export default router;
