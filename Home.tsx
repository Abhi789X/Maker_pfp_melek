import React, { useState, useRef, useCallback } from "react";
import * as fabric from "fabric";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import EditorPanel from "@/components/EditorPanel";
import ControlsPanel from "@/components/ControlsPanel";
import FeaturesSection from "@/components/FeaturesSection";
import SampleGallery from "@/components/SampleGallery";
import { useNotification } from "@/hooks/useNotification";
import useCanvasEditor from "@/hooks/useCanvasEditor";
import { dataURItoBlob } from "@/lib/utils";
import type { ClothingType } from "@/lib/utils";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState<ClothingType | null>(null);
  const [backgroundType, setBackgroundType] = useState("transparent");
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#FF36C7");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const { showNotification } = useNotification();
  const { getCanvasDataUrl } = useCanvasEditor({ canvasRef, fabricCanvasRef });
  
  const handleClothingSelect = useCallback((clothingId: ClothingType) => {
    setSelectedClothing(clothingId);
  }, []);
  
  const handleBackgroundChange = useCallback((type: string) => {
    setBackgroundType(type);
  }, []);
  
  const handleCustomBackgroundChange = useCallback((color: string) => {
    setCustomBackgroundColor(color);
  }, []);
  
  const handleDownload = useCallback(() => {
    if (!isImageUploaded) {
      showNotification("error", "No image", "Please upload an image first.");
      return;
    }
    
    try {
      showNotification("info", "Preparing download", "Your image is being prepared...");
      
      const dataUrl = getCanvasDataUrl();
      if (!dataUrl) {
        throw new Error("Failed to get canvas data");
      }
      
      // Create download link
      const link = document.createElement("a");
      link.download = `virtualfit-${new Date().getTime()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification("success", "Download complete", "Your image has been downloaded successfully.");
    } catch (error) {
      console.error("Error downloading image:", error);
      showNotification("error", "Download failed", "We couldn't download your image. Please try again.");
    }
  }, [isImageUploaded, getCanvasDataUrl, showNotification]);
  
  const handleReset = useCallback(() => {
    setSelectedClothing(null);
    setBackgroundType("transparent");
    setCustomBackgroundColor("#FF36C7");
    
    // Reset canvas background
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setBackgroundColor("transparent", fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
      
      // Remove clothing overlays if any
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      if (activeObjects.length > 0) {
        fabricCanvasRef.current.discardActiveObject();
        activeObjects.forEach((obj) => {
          if (obj !== fabricCanvasRef.current?.backgroundImage) {
            fabricCanvasRef.current?.remove(obj);
          }
        });
        fabricCanvasRef.current.renderAll();
      }
    }
    
    showNotification("success", "Reset complete", "All changes have been reset.");
  }, [showNotification]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto py-8 px-4 flex-grow">
        <HeroSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <EditorPanel
            selectedClothing={selectedClothing}
            backgroundType={backgroundType}
            customBackgroundColor={customBackgroundColor}
            onImageUploaded={setIsImageUploaded}
          />
          
          <ControlsPanel
            isImageUploaded={isImageUploaded}
            isProcessing={isProcessing}
            selectedClothing={selectedClothing}
            backgroundType={backgroundType}
            customBackgroundColor={customBackgroundColor}
            onClothingSelect={handleClothingSelect}
            onBackgroundChange={handleBackgroundChange}
            onCustomBackgroundChange={handleCustomBackgroundChange}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        </div>
        
        <FeaturesSection />
        <SampleGallery />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
