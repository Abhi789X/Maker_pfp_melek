import React, { useRef, useCallback, useState, useEffect } from "react";
import * as fabric from "fabric";
import { apiRequest } from "@/lib/queryClient";
import { useDropzone } from "react-dropzone";
import { Upload, RotateCw, Move, ZoomIn, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_IMAGES } from "@/lib/utils";
import { useNotification } from "@/hooks/useNotification";
import useCanvasEditor from "@/hooks/useCanvasEditor";
import { useQueryClient } from "@tanstack/react-query";
import type { ClothingType } from "@/lib/utils";

interface EditorPanelProps {
  selectedClothing: ClothingType | null;
  backgroundType: string;
  customBackgroundColor: string;
  onImageUploaded: (status: boolean) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  selectedClothing,
  backgroundType,
  customBackgroundColor,
  onImageUploaded,
}) => {
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState<"move" | "resize" | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  
  const { initializeCanvas, addClothing, resetClothingPosition, updateBackground } = useCanvasEditor({
    canvasRef,
    fabricCanvasRef
  });
  
  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && isImageUploaded && !fabricCanvasRef.current) {
      initializeCanvas();
    }
    
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [isImageUploaded, initializeCanvas]);
  
  // Handle background changes
  useEffect(() => {
    if (isImageUploaded && fabricCanvasRef.current) {
      updateBackground(backgroundType, customBackgroundColor);
    }
  }, [backgroundType, customBackgroundColor, isImageUploaded, updateBackground]);
  
  // Handle clothing changes
  useEffect(() => {
    if (isImageUploaded && fabricCanvasRef.current && selectedClothing) {
      const addSelectedClothing = async () => {
        try {
          await addClothing(selectedClothing);
          showNotification("success", `${selectedClothing.charAt(0).toUpperCase() + selectedClothing.slice(1)} applied`, "You can drag and resize the clothing as needed.");
        } catch (error) {
          showNotification("error", "Error", "Failed to apply clothing item.");
        }
      };
      
      addSelectedClothing();
    }
  }, [selectedClothing, isImageUploaded, addClothing, showNotification]);
  
  // Handle edit mode changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !isImageUploaded) return;
    
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();
    
    if (!activeObject) return;
    
    if (editMode === "move") {
      activeObject.lockScalingX = true;
      activeObject.lockScalingY = true;
      activeObject.lockRotation = true;
    } else if (editMode === "resize") {
      activeObject.lockMovementX = false;
      activeObject.lockMovementY = false;
      activeObject.lockScalingX = false;
      activeObject.lockScalingY = false;
      activeObject.lockRotation = false;
    }
    
    canvas.renderAll();
  }, [editMode, isImageUploaded]);
  
  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to process image");
      }
      
      const data = await response.json();
      
      // Initialize canvas with the processed image
      if (canvasRef.current) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          initializeCanvas(img);
          setIsImageUploaded(true);
          onImageUploaded(true);
          setIsProcessing(false);
          showNotification("success", "Image processed", "Your image has been processed successfully. Now select clothing to try on.");
        };
        img.src = data.imageUrl;
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setIsProcessing(false);
      showNotification("error", "Processing failed", "We couldn't process your image. Please try another one.");
    }
  }, [initializeCanvas, onImageUploaded, showNotification]);
  
  const loadSampleImage = async () => {
    setIsProcessing(true);
    
    try {
      // Get a random sample image
      const randomIndex = Math.floor(Math.random() * SAMPLE_IMAGES.length);
      const sampleUrl = SAMPLE_IMAGES[randomIndex];
      
      const response = await fetch(sampleUrl);
      if (!response.ok) throw new Error("Failed to load sample image");
      
      const blob = await response.blob();
      const file = new File([blob], "sample-image.jpg", { type: "image/jpeg" });
      
      await processImage(file);
    } catch (error) {
      console.error("Error loading sample image:", error);
      setIsProcessing(false);
      showNotification("error", "Error", "Failed to load sample image. Please try again.");
    }
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 10485760, // 10MB
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        showNotification("error", "Invalid file", "Please upload an image file under 10MB.");
        return;
      }
      
      if (acceptedFiles.length > 0) {
        await processImage(acceptedFiles[0]);
      }
    }
  });
  
  const enableMoveMode = () => {
    setEditMode("move");
    showNotification("info", "Move mode enabled", "Click and drag the clothing to reposition it.");
  };
  
  const enableResizeMode = () => {
    setEditMode("resize");
    showNotification("info", "Resize mode enabled", "Click and drag the corners to resize the clothing.");
  };
  
  const handleResetPosition = () => {
    resetClothingPosition();
    showNotification("info", "Position reset", "Clothing position has been reset.");
  };
  
  return (
    <div className="lg:col-span-8 space-y-6">
      {/* Upload Area */}
      {!isImageUploaded && (
        <div 
          {...getRootProps()} 
          className="bg-secondary border-2 border-dashed border-primary/50 rounded-xl p-8 h-96 flex flex-col items-center justify-center relative cursor-pointer"
        >
          <div className="text-center">
            {!isProcessing ? (
              <>
                <Upload className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Your Photo</h3>
                <p className="text-neutral-400 mb-6">Drag and drop your image here or click to browse</p>
                <input {...getInputProps()} />
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Choose Photo
                </Button>
                <div className="mt-4 flex justify-center space-x-2">
                  <span className="text-sm text-neutral-400">or try a</span>
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadSampleImage();
                    }}
                  >
                    sample image
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-primary font-medium">Processing your image...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Image Editor (shows after upload) */}
      {isImageUploaded && (
        <div className="bg-secondary border border-neutral-700 rounded-xl p-4 h-[500px] relative">
          <div className="relative h-full flex items-center justify-center">
            {/* Canvas for editing */}
            <canvas ref={canvasRef} className="max-h-full max-w-full" />
            
            {/* Editing controls */}
            <div className="absolute bottom-4 right-4 bg-secondary/80 backdrop-blur-sm p-3 rounded-lg flex space-x-3 opacity-70 hover:opacity-100 transition-opacity">
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${editMode === 'move' ? 'bg-primary text-white' : 'bg-primary/20 hover:bg-primary/30 text-primary'}`}
                title="Move clothing"
                onClick={enableMoveMode}
              >
                <Move className="w-5 h-5" />
              </button>
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${editMode === 'resize' ? 'bg-primary text-white' : 'bg-primary/20 hover:bg-primary/30 text-primary'}`}
                title="Resize clothing"
                onClick={enableResizeMode}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary"
                title="Reset position"
                onClick={handleResetPosition}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
