import * as tf from "@tensorflow/tfjs-node";
import * as poseDetection from "@tensorflow-models/pose-detection";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

class ImageProcessor {
  private detector: poseDetection.PoseDetector | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Load TensorFlow and PoseNet model
      await tf.ready();
      
      // Create pose detector with MoveNet model
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      
      console.log("Pose detector initialized successfully");
    } catch (error) {
      console.error("Error initializing pose detector:", error);
      // Continue without pose detection if there's an error
      this.detector = null;
    }
  }
  
  async processImage(imageBuffer: Buffer): Promise<string> {
    try {
      // Process image with Sharp
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 1200;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const filename = `processed_${nanoid()}.png`;
      const outputPath = path.join(uploadsDir, filename);
      
      // Save processed image
      await sharp(imageBuffer)
        .resize({ 
          width: Math.min(width, 1200), 
          height: Math.min(height, 1600), 
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Failed to process image");
    }
  }
  
  async detectPose(imagePath: string): Promise<poseDetection.Keypoint[] | null> {
    if (!this.detector) {
      await this.initialize();
      if (!this.detector) {
        return null;
      }
    }
    
    try {
      // Load image
      const imageBuffer = fs.readFileSync(imagePath);
      const tfImage = tf.node.decodeImage(imageBuffer, 3);
      
      // Detect pose
      const poses = await this.detector.estimatePoses(tfImage as any);
      
      // Clean up tensor
      (tfImage as any).dispose();
      
      if (poses.length === 0) {
        return null;
      }
      
      return poses[0].keypoints;
    } catch (error) {
      console.error("Error detecting pose:", error);
      return null;
    }
  }
  
  async overlayClothing(
    imagePath: string, 
    clothingPath: string, 
    keypoints: poseDetection.Keypoint[]
  ): Promise<string> {
    try {
      // Get image dimensions
      const imageMetadata = await sharp(imagePath).metadata();
      const width = imageMetadata.width || 800;
      const height = imageMetadata.height || 1200;
      
      // Get clothing dimensions
      const clothingMetadata = await sharp(clothingPath).metadata();
      
      // Generate output path
      const filename = `overlaid_${nanoid()}.png`;
      const outputPath = path.join(process.cwd(), "uploads", filename);
      
      // Determine clothing position based on keypoints
      // This is a simplified example, real implementation would be more complex
      let left = 0;
      let top = 0;
      let clothingWidth = width * 0.5;
      
      if (keypoints.length > 0) {
        // Example positioning based on shoulders and neck
        const nose = keypoints.find(kp => kp.name === "nose");
        const leftShoulder = keypoints.find(kp => kp.name === "left_shoulder");
        const rightShoulder = keypoints.find(kp => kp.name === "right_shoulder");
        
        if (nose && leftShoulder && rightShoulder) {
          // For hoodie or jacket
          const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
          clothingWidth = shoulderWidth * 3;
          left = (rightShoulder.x + leftShoulder.x) / 2 - clothingWidth / 2;
          top = Math.min(leftShoulder.y, rightShoulder.y) - clothingWidth * 0.2;
        }
      }
      
      // Composite images
      await sharp(imagePath)
        .composite([
          {
            input: await sharp(clothingPath)
              .resize({ width: Math.round(clothingWidth) })
              .toBuffer(),
            left: Math.round(left),
            top: Math.round(top)
          }
        ])
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error("Error overlaying clothing:", error);
      throw new Error("Failed to overlay clothing");
    }
  }
}

export const imageProcessor = new ImageProcessor();
