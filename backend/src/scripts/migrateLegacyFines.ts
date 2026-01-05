
import mongoose from "mongoose";
import dotenv from "dotenv";
import Borrow from "../models/Borrow";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Connection Failed", err);
        process.exit(1);
    }
};

const migrate = async () => {
    await connectDB();

    console.log("Starting Migration...");

    try {
        const result = await Borrow.updateMany(
            { returned: true, isFinePaid: false },
            { $set: { isFinePaid: true } }
        );

        console.log(`Migration Complete. matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
    } catch (error) {
        console.error("Migration Failed", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

migrate();
