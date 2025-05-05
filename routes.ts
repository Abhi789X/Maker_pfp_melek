import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import * as tf from "@tensorflow/tfjs-node";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { imageProcessor } from "./imageProcessor";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create server
  const httpServer = createServer(app);
  
  // Ensure directories exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Initialize the image processor
  await imageProcessor.initialize();
  
  // API Routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const galleryItems = await storage.getGalleryItems();
      res.json(galleryItems);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ message: "Failed to fetch gallery items" });
    }
  });
  
  // Process uploaded image
  app.post("/api/process-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
      
      // Process the image with the image processor
      const processedImagePath = await imageProcessor.processImage(req.file.buffer);
      
      // Save to upload history
      const uploadRecord = await storage.createUploadHistory({
        originalImageUrl: `/uploads/${path.basename(processedImagePath)}`,
        processedImageUrl: null,
        clothingType: null,
      });
      
      res.json({ 
        success: true, 
        imageUrl: `/uploads/${path.basename(processedImagePath)}`,
        uploadId: uploadRecord.id
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ message: "Failed to process image" });
    }
  });
  
  // Serve clothing assets
  app.get("/api/clothing/:type", (req, res) => {
    const clothingType = req.params.type;
    const clothingMap: Record<string, string> = {
      jacket: path.join(process.cwd(), "assets", "jacket.png"),
      hoodie: path.join(process.cwd(), "assets", "hoodie.png"),
      cap: path.join(process.cwd(), "assets", "cap.png"),
    };
    
    if (!clothingMap[clothingType]) {
      return res.status(404).json({ message: "Clothing type not found" });
    }
    
    // Use SVG rendering for clothing items
    const clothingPath = clothingMap[clothingType];
    
    // Check if the file exists
    if (!fs.existsSync(clothingPath)) {
      // If not, create it by rendering an SVG
      let svgContent: string;
      
      if (clothingType === "jacket") {
        // SUCCINCT Jacket
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
          <path d="M75,50 L225,50 Q240,70 240,100 L240,230 Q180,250 150,250 Q120,250 60,230 L60,100 Q60,70 75,50 Z" fill="#121212" stroke="#333" stroke-width="2"/>
          <path d="M75,50 L225,50 Q240,70 240,100 L240,120 L60,120 L60,100 Q60,70 75,50 Z" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <path d="M60,230 L60,210 L240,210 L240,230 Q180,250 150,250 Q120,250 60,230 Z" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <path d="M100,50 L90,100 L80,50 Z" fill="#121212" stroke="#333" stroke-width="1"/>
          <path d="M200,50 L210,100 L220,50 Z" fill="#121212" stroke="#333" stroke-width="1"/>
          <path d="M148,65 Q148,60 152,60 L165,60 Q170,60 170,65 L170,75 Q170,80 165,80 L152,80 Q148,80 148,75 Z" fill="white"/>
          <text x="150" y="75" font-family="Arial" font-size="14" text-anchor="middle" fill="white">SUCCINCT</text>
        </svg>
        `;
      } else if (clothingType === "hoodie") {
        // GPROVE Hoodie
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
          <path d="M60,80 L240,80 L240,250 L60,250 Z" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <path d="M60,80 Q100,30 150,30 Q200,30 240,80" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <path d="M60,80 Q100,30 150,30 Q200,30 240,80" fill="none" stroke="#333" stroke-width="2"/>
          <path d="M130,30 Q150,10 170,30" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <path d="M90,130 L210,130 L210,170 L90,170 Z" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <rect x="110" y="90" width="40" height="20" rx="5" fill="white" stroke="#333"/>
          <text x="130" y="105" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">GPROVE</text>
          <path d="M90,210 L115,210 L115,190 L185,190 L185,210 L210,210" fill="none" stroke="#333" stroke-width="2"/>
        </svg>
        `;
      } else {
        // Cap
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
          <path d="M50,100 Q100,20 150,20 Q200,20 250,100 L230,120 Q190,60 150,60 Q110,60 70,120 Z" fill="white" stroke="#333" stroke-width="2"/>
          <path d="M50,100 L70,120 Q110,150 150,150 Q190,150 230,120 L250,100 Q250,120 240,140 Q200,180 150,180 Q100,180 60,140 Q50,120 50,100 Z" fill="#FF36C7" stroke="#333" stroke-width="2"/>
          <path d="M125,55 L115,70 L125,85 L135,70 Z" fill="#FF36C7"/>
          <path d="M140,45 L135,65 L150,65 Z" fill="#FF8AE2"/>
          <text x="150" y="105" font-family="Arial" font-size="14" text-anchor="middle" fill="white">S</text>
        </svg>
        `;
      }
      
      // Convert SVG to PNG and save
      sharp(Buffer.from(svgContent))
        .png()
        .toFile(clothingPath)
        .then(() => {
          res.sendFile(clothingPath);
        })
        .catch((err) => {
          console.error("Error creating clothing SVG:", err);
          res.status(500).json({ message: "Failed to create clothing image" });
        });
    } else {
      // If the file exists, send it
      res.sendFile(clothingPath);
    }
  });
  
  // Serve sample images
  app.get("/api/samples/:type", async (req, res) => {
    try {
      const sampleType = req.params.type;
      const samplesPath = path.join(process.cwd(), "assets", "samples");
      
      // Ensure samples directory exists
      if (!fs.existsSync(samplesPath)) {
        fs.mkdirSync(samplesPath, { recursive: true });
      }
      
      // Generate a sample if it doesn't exist
      const sampleFileName = `${sampleType}.jpg`;
      const sampleFilePath = path.join(samplesPath, sampleFileName);
      
      if (!fs.existsSync(sampleFilePath)) {
        // Generate a placeholder image
        const width = 800;
        const height = 1200;
        const placeholder = sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 200, g: 200, b: 200, alpha: 1 }
          }
        });
        
        // Add text for the sample type
        const svgText = `
        <svg width="${width}" height="${height}">
          <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(50, 50, 50, 0.1)"/>
          <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="32" text-anchor="middle" fill="#333">Sample ${sampleType}</text>
        </svg>
        `;
        
        await placeholder
          .composite([{ input: Buffer.from(svgText), gravity: 'center' }])
          .jpeg()
          .toFile(sampleFilePath);
      }
      
      res.sendFile(sampleFilePath);
    } catch (error) {
      console.error("Error serving sample:", error);
      res.status(500).json({ message: "Failed to serve sample image" });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Create assets directory if it doesn't exist
  const assetsDir = path.join(process.cwd(), "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Initialize gallery with sample items if empty
  storage.initializeGalleryIfEmpty();
  
  return httpServer;
}
