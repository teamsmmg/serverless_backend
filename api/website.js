import dbConnect from "../lib/mongodb";
import mongoose from "mongoose";
import Cors from "cors";

// ✅ Enable CORS
const cors = Cors({
    origin: "*", // 🛑 Change this for production (specific frontend domain)
    methods: ["GET"],
});

// ✅ Website Schema
const websiteSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    heading: String,
    subheading: String,
    address: String,
}, { collection: "websites" });

const Website = mongoose.models.Website || mongoose.model("Website", websiteSchema);

// ✅ Middleware function to handle CORS
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    console.log("📡 API Request Received:", req.method);

    try {
        await runMiddleware(req, res, cors);
        await dbConnect(); // 🔹 Ensure MongoDB connection
        console.log("✅ Connected to MongoDB");

        if (req.method === "GET") {
            return getWebsiteBySlug(req, res);
        }

        console.log("❌ Method Not Allowed:", req.method);
        return res.status(405).json({ message: "Method Not Allowed" });

    } catch (error) {
        console.error("🔥 Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// ✅ Get Website By Slug
async function getWebsiteBySlug(req, res) {
    const { slug } = req.query;

    try {
        console.log(`🔎 Searching for website with slug: ${slug}`);
        const websiteData = await Website.findOne({ slug });

        if (!websiteData) {
            console.log("❌ Website not found");
            return res.status(404).json({ message: "Website not found" });
        }

        console.log("✅ Website found:", websiteData);
        res.status(200).json(websiteData);

    } catch (error) {
        console.error("🔥 Error fetching website:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
