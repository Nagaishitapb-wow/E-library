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

const allowedOrigins: string[] = [
    process.env.CLIENT_URL,
    "https://e-library-kohl.vercel.app",
    "*",
    "https://e-library-git-main-naga-ishita-p-bs-projects.vercel.app",
    "https://e-library-dcqbe6014-naga-ishita-p-bs-projects.vercel.app",
    "http://localhost:5173"
].filter((o): o is string => !!o);


const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin) || (origin.startsWith("https://e-library-") && origin.endsWith(".vercel.app"))) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));





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
