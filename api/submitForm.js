import dbConnect from "../lib/mongodb"; // MongoDB connection
import mongoose from "mongoose";
import Cors from "cors";

// --- Setup CORS ---
const cors = Cors({
    origin: "*", // ⚠️ In production, change this to your frontend domain
    methods: ["POST"]
});

// --- Run middleware utility ---
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

// --- Mongoose Schema and Model ---
const formSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

const Form = mongoose.models.Form || mongoose.model("Form", formSchema);

// --- API Handler ---
export default async function handler(req, res) {
    console.log("📡 API Request Received:", req.method);

    try {
        await runMiddleware(req, res, cors);
        await dbConnect();
        console.log("✅ Connected to MongoDB");

        if (req.method === "POST") {
            const { name, email, subject, message } = req.body;

            // Input validation
            if (!name || !email || !subject || !message) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const newForm = new Form({ name, email, subject, message });
            await newForm.save();

            console.log("✅ Form submitted:", newForm);
            return res.status(201).json({ message: "Form submitted successfully" });
        }

        console.log("❌ Method Not Allowed:", req.method);
        return res.status(405).json({ message: "Method Not Allowed" });

    } catch (error) {
        console.error("🔥 Internal Server Error:", error);
        return res.status(500).json({ error: "Server error", detail: error.message });
    }
}
