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
import uploadRoutes from "./routes/uploadRoutes";
import activityRoutes from "./routes/activityRoutes";
import { Category } from "./models/Category";
import path from "path";


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
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check against allowed origins list
        if (allowedOrigins.includes(origin)) return callback(null, true);

        // Allow Vercel deployments pattern
        if (origin.startsWith("https://e-library-") && origin.endsWith(".vercel.app")) return callback(null, true);

        // Allow Local Network IPs (192.168.x.x, 10.x.x.x, 172.x.x.x) for development
        // This is safe-ish for local dev, and essential for mobile testing
        const isLocalNetwork =
            origin.startsWith("http://192.168.") ||
            origin.startsWith("http://10.") ||
            origin.startsWith("http://172.");

        if (isLocalNetwork) return callback(null, true);

        callback(null, false);
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
app.use("/api/upload", uploadRoutes);
app.use("/api/activity", activityRoutes);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
