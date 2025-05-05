import { useCallback, useRef } from "react";
import * as fabric from "fabric";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import { useNotification } from "./useNotification";
import { CLOTHING_ITEMS, type ClothingType } from "@/lib/utils";

interface UseCanvasEditorProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
}

export const useCanvasEditor = ({ canvasRef, fabricCanvasRef }: UseCanvasEditorProps) => {
  const baseImageRef = useRef<fabric.Image | null>(null);
  const clothingItemRef = useRef<fabric.Image | null>(null);
  const poseDetectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const keypointsRef = useRef<poseDetection.Keypoint[] | null>(null);
  const { showNotification } = useNotification();

  // Initialize pose detector
  const initPoseDetector = useCallback(async () => {
    try {
      await tf.ready();
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      poseDetectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      return true;
    } catch (error) {
      console.error("Error initializing pose detector:", error);
      return false;
    }
  }, []);

  // Detect pose from image
  const detectPose = useCallback(async (img: HTMLImageElement) => {
    if (!poseDetectorRef.current) {
      const initialized = await initPoseDetector();
      if (!initialized) {
        return null;
      }
    }

    try {
      const poses = await poseDetectorRef.current!.estimatePoses(img);
      if (poses.length > 0) {
        keypointsRef.current = poses[0].keypoints;
        return poses[0].keypoints;
      }
      return null;
    } catch (error) {
      console.error("Error detecting pose:", error);
      return null;
    }
  }, [initPoseDetector]);

  // Initialize canvas with an image
  const initializeCanvas = useCallback(
    async (img?: HTMLImageElement) => {
      if (!canvasRef.current) return;

      // Create Fabric.js canvas
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }

      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "transparent",
        preserveObjectStacking: true,
      });
      fabricCanvasRef.current = canvas;

      // If image is provided, add it to canvas
      if (img) {
        const fabricImage = new fabric.Image(img, {
          selectable: false,
          evented: false,
        });

        // Calculate image dimensions to fit canvas
        const canvasWidth = window.innerWidth > 768 ? 700 : window.innerWidth - 40;
        const canvasHeight = 500;
        canvas.setWidth(canvasWidth);
        canvas.setHeight(canvasHeight);

        const scale = Math.min(
          canvasWidth / img.width,
          canvasHeight / img.height
        );
        fabricImage.scale(scale);

        // Center the image
        fabricImage.set({
          left: (canvasWidth - img.width * scale) / 2,
          top: (canvasHeight - img.height * scale) / 2,
        });

        canvas.add(fabricImage);
        baseImageRef.current = fabricImage;

        // Detect pose
        await detectPose(img);
      }

      return canvas;
    },
    [canvasRef, fabricCanvasRef, detectPose]
  );

  // Add clothing item to canvas
  const addClothing = useCallback(
    async (clothingType: ClothingType) => {
      if (!fabricCanvasRef.current || !baseImageRef.current) {
        showNotification("error", "Error", "Please upload an image first.");
        return;
      }

      const canvas = fabricCanvasRef.current;

      // Remove previous clothing item if exists
      if (clothingItemRef.current) {
        canvas.remove(clothingItemRef.current);
      }

      // Find clothing item details
      const clothingItem = CLOTHING_ITEMS.find((item) => item.id === clothingType);
      if (!clothingItem) {
        showNotification("error", "Error", "Clothing item not found.");
        return;
      }

      try {
        // Load clothing image
        const clothingImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = clothingItem.imageUrl;
        });

        // Create fabric image
        const fabricClothingImage = new fabric.Image(clothingImg, {
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerColor: 'rgba(255, 54, 199, 0.5)',
          cornerStrokeColor: 'rgba(255, 54, 199, 1)',
          transparentCorners: false,
          cornerSize: 10,
        });

        // Position the clothing based on pose detection
        const keypoints = keypointsRef.current;
        const baseImg = baseImageRef.current;
        
        // Base scaling factor
        const baseWidth = baseImg.width! * baseImg.scaleX!;
        const baseHeight = baseImg.height! * baseImg.scaleY!;
        
        // Default position if no pose detected
        let scaleFactor = 0.5;
        let clothingLeft = baseImg.left! + baseWidth * 0.25;
        let clothingTop = baseImg.top! + baseHeight * 0.15;
        
        if (keypoints && keypoints.length > 0) {
          // Position based on clothing type and detected pose
          if (clothingType === "cap") {
            // Find nose and eyes for cap placement
            const nose = keypoints.find(kp => kp.name === "nose");
            const leftEye = keypoints.find(kp => kp.name === "left_eye");
            const rightEye = keypoints.find(kp => kp.name === "right_eye");
            
            if (nose && leftEye && rightEye) {
              // Calculate head width and position
              const headWidth = Math.max(
                Math.abs(leftEye.x - rightEye.x) * 2.5,
                baseWidth * 0.2
              );
              scaleFactor = headWidth / clothingImg.width;
              clothingLeft = baseImg.left! + nose.x * baseImg.scaleX! - (clothingImg.width * scaleFactor / 2);
              clothingTop = baseImg.top! + Math.min(leftEye.y, rightEye.y) * baseImg.scaleY! - (clothingImg.height * scaleFactor * 0.7);
            }
          } else {
            // For hoodies and jackets
            const leftShoulder = keypoints.find(kp => kp.name === "left_shoulder");
            const rightShoulder = keypoints.find(kp => kp.name === "right_shoulder");
            const leftHip = keypoints.find(kp => kp.name === "left_hip");
            const rightHip = keypoints.find(kp => kp.name === "right_hip");
            
            if (leftShoulder && rightShoulder && leftHip && rightHip) {
              // Calculate torso width and height
              const torsoWidth = Math.abs(leftShoulder.x - rightShoulder.x) * 1.3;
              const torsoHeight = Math.max(
                Math.abs(leftShoulder.y - leftHip.y),
                Math.abs(rightShoulder.y - rightHip.y)
              ) * 1.2;
              
              // Scale clothing to fit torso
              const widthScale = torsoWidth / clothingImg.width;
              const heightScale = torsoHeight / clothingImg.height;
              scaleFactor = Math.max(widthScale, heightScale);
              
              // Position at center of shoulders
              const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
              clothingLeft = baseImg.left! + shoulderCenterX * baseImg.scaleX! - (clothingImg.width * scaleFactor / 2);
              clothingTop = baseImg.top! + leftShoulder.y * baseImg.scaleY! - (clothingImg.height * scaleFactor * 0.2);
            }
          }
        }
        
        // Apply scaling and position
        fabricClothingImage.scale(scaleFactor);
        fabricClothingImage.set({
          left: clothingLeft,
          top: clothingTop,
        });
        
        // Add clothing to canvas
        canvas.add(fabricClothingImage);
        clothingItemRef.current = fabricClothingImage;
        canvas.setActiveObject(fabricClothingImage);
        canvas.renderAll();
        
      } catch (error) {
        console.error("Error adding clothing:", error);
        showNotification("error", "Error", "Failed to add clothing. Please try again.");
      }
    },
    [fabricCanvasRef, showNotification]
  );

  // Reset clothing position
  const resetClothingPosition = useCallback(() => {
    if (!fabricCanvasRef.current || !clothingItemRef.current) return;
    
    // Remove and re-add current clothing
    const currentClothing = CLOTHING_ITEMS.find(
      (item) => item.imageUrl === clothingItemRef.current?.getSrc()
    );
    
    if (currentClothing) {
      addClothing(currentClothing.id);
    }
  }, [fabricCanvasRef, addClothing]);

  // Update background
  const updateBackground = useCallback(
    (type: string, customColor: string) => {
      if (!fabricCanvasRef.current) return;
      
      const canvas = fabricCanvasRef.current;
      
      switch (type) {
        case "transparent":
          canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
          break;
        case "pink":
          canvas.setBackgroundColor("#FF36C7", canvas.renderAll.bind(canvas));
          break;
        case "custom":
          canvas.setBackgroundColor(customColor, canvas.renderAll.bind(canvas));
          break;
        default:
          canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      }
    },
    [fabricCanvasRef]
  );

  // Get canvas data URL
  const getCanvasDataUrl = useCallback(() => {
    if (!fabricCanvasRef.current) return null;
    return fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    });
  }, [fabricCanvasRef]);

  return {
    initializeCanvas,
    addClothing,
    resetClothingPosition,
    updateBackground,
    getCanvasDataUrl,
  };
};

export default useCanvasEditor;
