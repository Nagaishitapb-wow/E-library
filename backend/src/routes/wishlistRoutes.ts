import { Router } from "express";
import { addToWishlist, removeFromWishlist, getUserWishlist } from "../controllers/wishlistController";
import { authRequired } from "../middleware/auth";


const router = Router();

router.post("/", authRequired, addToWishlist);
router.get("/", authRequired, getUserWishlist);
router.delete("/:bookId", authRequired, removeFromWishlist);

export default router;
