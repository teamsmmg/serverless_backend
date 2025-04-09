import dbConnect from "../lib/mongodb";
import mongoose from "mongoose";
import Cors from "cors";

// 🧠 CORS Setup
const cors = Cors({
    origin: "*", 
    methods: ["GET"],
});

// 📦 Model Setup
const portfolioSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    brief: { type: String },
    link: { type: String },
    technologies: [{ type: String }],
    teamMembers: [{
        name: String,
        role: String
    }],
    totalMembers: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['Completed', 'In Progress', 'On Hold'],
        default: 'In Progress'
    }
}, { timestamps: true });

const Portfolio = mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);

// 📍 Middleware Runner
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

// 🔌 Handler
export default async function handler(req, res) {
    console.log("📡 Portfolio API hit:", req.method);

    try {
        await runMiddleware(req, res, cors);
        await dbConnect();

        if (req.method === "GET") {
            const { id } = req.query;

            // ✅ GET Single Project by ID
            if (id) {
                const project = await Portfolio.findById(id);
                if (!project) {
                    return res.status(404).json({ message: "Project not found" });
                }
                return res.status(200).json(project);
            }

            // ✅ GET All Projects
            const projects = await Portfolio.find();
            return res.status(200).json(projects);
        }

        // ❌ Other methods not allowed
        return res.status(405).json({ message: "Method Not Allowed" });

    } catch (error) {
        console.error("🔥 API Error:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
