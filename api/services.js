import dbConnect from "../lib/mongodb";
import mongoose from "mongoose";
import Cors from "cors";

const cors = Cors({
    origin: "*", // Production में इसे specific frontend domain से बदलें
    methods: ["GET"],
});

// 📌 Service Schema
const ServiceSchema = new mongoose.Schema(
    {
        // Hero Section: Service Overview
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        image: { type: String, required: true },
    
        // About the Service
        about_service: { type: String, required: true, trim: true },
        about_service_description: { type: String, required: true, trim: true },
        about_service_image: { type: String, required: true },
    
        // What We Provide
        what_we_provide: { type: String, required: true, trim: true },
        what_we_provide_cards: [
          {
            image: { type: String, required: true },
            heading: { type: String, required: true, trim: true },
          },
        ],
        what_we_provide_extra_image: { type: String, required: true },
    
        // Why You Need This Service
        service_need: { type: String, required: true, trim: true },
        service_need_card: {
          points: {
            type: [{ type: String, required: true }],
            validate: [arrayLimit, "{PATH} must have exactly 5 points"],
          },
        },
        service_need_image: { type: String, required: true },
    
        // Service Qualities
        service_qualities: { type: String, required: true, trim: true },
        service_qualities_description: { type: String, required: true, trim: true },
        service_qualities_cards: [
          {
            points: {
              type: [{ type: String, required: true }],
              validate: [arrayLimit, "{PATH} must have exactly 5 points"],
            },
          },
        ],
    
        // Additional metadata
        type: { type: String, required: true, index: true },
    
        // Pricing Section
        pricing: {
          basic: {
            individual_pricing: { type: Number, required: true },
            type: {
              type: [{ type: String, trim: true }],
              validate: [arrayNotEmpty, "Basic plan should have at least one feature"],
            },
          },
          medium: {
            individual_pricing: { type: Number, required: true },
            type: {
              type: [{ type: String, trim: true }],
              validate: [arrayNotEmpty, "Medium plan should have at least one feature"],
            },
          },
          premium: {
            individual_pricing: { type: Number, required: true },
            type: {
              type: [{ type: String, trim: true }],
              validate: [arrayNotEmpty, "Premium plan should have at least one feature"],
            },
          },
        },
      },
  { timestamps: true }
);

// Validators
function arrayLimit(val) {
    return val.length === 5;
  }
  
  function arrayNotEmpty(val) {
    return val.length > 0;
  }
  
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

// Middleware को रन करने का function
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

// API Handler
export default async function handler(req, res) {
    console.log("📡 API Request Received:", req.method);

    try {
        await runMiddleware(req, res, cors);
        await dbConnect(); // MongoDB कनेक्शन सुनिश्चित करें

        if (req.method === "GET") {
            if (req.query.id) {
                return getServiceById(req, res);
            }
            return getAllServices(req, res);
        }

        console.log("❌ Method Not Allowed:", req.method);
        return res.status(405).json({ message: "Method Not Allowed" });

    } catch (error) {
        console.error("🔥 Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// ✅ Get All Services
async function getAllServices(req, res) {
    try {
        const services = await Service.find().lean();
        res.status(200).json(services);
    } catch (error) {
        console.error("❌ Error fetching services:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ✅ Get Service By ID
async function getServiceById(req, res) {
    try {
        const service = await Service.findById(req.query.id);
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.status(200).json(service);
    } catch (error) {
        console.error("❌ Error fetching service:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
