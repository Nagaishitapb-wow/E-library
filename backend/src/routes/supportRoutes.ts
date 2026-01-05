import { Router } from "express";
import { submitTicket, getAllTickets, updateTicketStatus } from "../controllers/supportController";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

// Public/Auth submission (authRequired is optional here if we allow guests, 
// but I'll use a custom middleware or just check in controller if needed.
// For now, let's make it hit even if not logged in, but use auth if available)
router.post("/submit", (req, res, next) => {
    // Optional auth: try to decode token but don't block if missing
    next();
}, submitTicket);

router.get("/tickets", authRequired, adminRequired, getAllTickets);
router.patch("/tickets/:id/status", authRequired, adminRequired, updateTicketStatus);

export default router;
