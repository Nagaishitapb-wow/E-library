import { Router, Request, Response } from "express";
import { upload } from "../middleware/upload";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

router.post("/cover", authRequired, adminRequired, upload.single("cover"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Construct the URL to the file
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/book-covers/${req.file.filename}`;

    res.json({
        message: "File uploaded successfully",
        url: fileUrl,
        filename: req.file.filename
    });
});

export default router;
