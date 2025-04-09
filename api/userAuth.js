import dbConnect from "../lib/mongodb";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Cors from "cors";

// --- CORS Middleware ---
const cors = Cors({
  origin: "*", // ⚠️ Change to specific domain in production
  methods: ["POST"],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// --- Mongoose User Schema ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePhoto: String,
  phoneNumber: String,
  companyName: String,
  projects: [
    {
      projectName: String,
      projectType: [String],
      projectPurpose: String,
      techStack: String,
      referenceLinks: String,
      budget: String,
      deadline: Date,
      additionalServices: [String],
    }
  ]
});
  
const User = mongoose.model("User2", userSchema);



// --- Serverless Handler ---
export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await dbConnect();

  const { method, body } = req;

  try {
    if (method === "POST") {
      const { name, email, password, type } = body;

      if (!type || !["signup", "login"].includes(type)) {
        return res.status(400).json({ message: "Invalid request type" });
      }

      if (type === "signup") {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(201).json({ message: "User created", token });
      }

      if (type === "login") {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token });
      }
    }

    res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
