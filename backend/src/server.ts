import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import bookRoutes from "./routes/bookRoutes";
import borrowRoutes from "./routes/borrowRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import importRoutes from "./routes/importRoutes";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { Category } from "./models/Category";


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL1
];

app.use(
    cors({
        origin: [
            "https://e-library-kohl.vercel.app",   // main production frontend
            "https://e-library-git-main-naga-ishita-p-bs-projects.vercel.app", // preview
            "https://e-library-dcqbe6014-naga-ishita-p-bs-projects.vercel.app", // preview
            "http://localhost:5173"
        ],
        credentials: true,
    })
);





app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/import", importRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
