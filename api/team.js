import dbConnect from "../lib/mongodb";
import mongoose from "mongoose";
import Cors from "cors";

const cors = Cors({
    origin: "*", // 🛑 Change this for production (specific frontend domain)
    methods: ["GET"],
});

const teamSchema = new mongoose.Schema({
    name: String,
    image: String,
    skills: [String],
    social: {
        threads: String,
        facebook: String,
        instagram: String,
        linkedin: String
    }
}, { collection: 'teammembers' });

const TeamMember = mongoose.models.TeamMember || mongoose.model("TeamMember", teamSchema);

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
        await dbConnect(); // Ensure MongoDB connection
        console.log("✅ Connected to MongoDB");

        if (req.method === "GET") {
            console.log("📥 Fetching team members...");
            const teamMembers = await TeamMember.find();
            console.log("✅ Data fetched successfully:", teamMembers);
            return res.status(200).json(teamMembers);
        }

        console.log("❌ Method Not Allowed:", req.method);
        return res.status(405).json({ message: "Method Not Allowed" });

    } catch (error) {
        console.error("🔥 Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
