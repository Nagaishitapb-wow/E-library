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

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));




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
