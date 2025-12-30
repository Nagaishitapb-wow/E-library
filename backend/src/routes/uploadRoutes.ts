import { Router, Request, Response } from "express";
import { upload } from "../middleware/upload";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

router.post("/cover", authRequired, adminRequired, upload.single("cover"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Return relative path for better portability across devices
    // Frontend will prepend the correct API_BASE_URL
    const fileUrl = `/uploads/book-covers/${req.file.filename}`;

    res.json({
        message: "File uploaded successfully",
        url: fileUrl,
        filename: req.file.filename
    });
});

export default router;
