import mongoose from "mongoose";
import Cors from "cors";
import dbConnect from "../lib/mongodb"; // Apne MongoDB connection file ka path set karo

const cors = Cors({
  origin: "*", // Production me specific domain set karo
  methods: ["GET"]
});

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

// Model definition (same as blogModel.js)
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  description: { type: String, required: true },
  htmlcode: { type: String, required: true },
  publishDate: { type: Date, default: Date.now },
  author: {
    name: { type: String, required: true },
    profileLink: { type: String, required: true }
  }
});

// Prevent recompilation in dev mode
const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { id } = req.query;

      if (id) {
        const blog = await Blog.findById(id);
        if (!blog) {
          return res.status(404).json({ message: "Blog not found" });
        }
        return res.status(200).json(blog);
      }

      const blogs = await Blog.find().sort({ publishDate: -1 });
      return res.status(200).json(blogs);

    } catch (error) {
      return res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
