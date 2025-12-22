import { Router } from "express";
import { importBooks } from "../controllers/importController";

import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

router.get("/", authRequired, adminRequired, importBooks);

export default router;
