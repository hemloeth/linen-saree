import mongoose from "mongoose";
import MarketingCollection from "./backend/modal/marketingCollectionModal.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/linen-saree"; // Adjust if different

async function cleanup() {
    try {
        await mongoose.connect(MONGO_URI);
        const result = await MarketingCollection.deleteOne({ key: "none" });
        console.log("Cleanup result:", result);
        await mongoose.disconnect();
    } catch (e) {
        console.error("Cleanup failed:", e);
    }
}

cleanup();
