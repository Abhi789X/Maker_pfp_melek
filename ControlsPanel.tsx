import React from "react";
import { Shirt, Palette, Download, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClothingItem from "@/components/ClothingItem";
import { CLOTHING_ITEMS, type ClothingType } from "@/lib/utils";
import { useNotification } from "@/hooks/useNotification";

interface ControlsPanelProps {
  isImageUploaded: boolean;
  isProcessing: boolean;
  selectedClothing: ClothingType | null;
  backgroundType: string;
  customBackgroundColor: string;
  onClothingSelect: (clothingId: ClothingType) => void;
  onBackgroundChange: (type: string) => void;
  onCustomBackgroundChange: (color: string) => void;
  onDownload: () => void;
  onReset: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isImageUploaded,
  isProcessing,
  selectedClothing,
  backgroundType,
  customBackgroundColor,
  onClothingSelect,
  onBackgroundChange,
  onCustomBackgroundChange,
  onDownload,
  onReset,
}) => {
  const { showNotification } = useNotification();

  const handleDownload = () => {
    if (!isImageUploaded) {
      showNotification("error", "No image", "Please upload an image first.");
      return;
    }
    
    onDownload();
  };

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Clothing Options */}
      <div className="bg-secondary border border-neutral-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Shirt className="mr-2 text-primary" />
          Choose Clothing
        </h3>

        <div className="space-y-4">
          {CLOTHING_ITEMS.map((item) => (
            <ClothingItem
              key={item.id}
              item={item}
              selected={selectedClothing === item.id}
              onClick={() => onClothingSelect(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Background Options */}
      <div className="bg-secondary border border-neutral-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Palette className="mr-2 text-primary" />
          Background
        </h3>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-2 rounded hover:bg-neutral-800 cursor-pointer">
            <input
              type="radio"
              name="background"
              value="transparent"
              className="w-4 h-4 accent-primary"
              checked={backgroundType === "transparent"}
              onChange={() => onBackgroundChange("transparent")}
            />
            <div className="w-8 h-8 border border-neutral-600 rounded grid grid-cols-2 grid-rows-2 overflow-hidden">
              <div className="bg-neutral-300"></div>
              <div className="bg-neutral-500"></div>
              <div className="bg-neutral-500"></div>
              <div className="bg-neutral-300"></div>
            </div>
            <span>Transparent</span>
          </label>

          <label className="flex items-center space-x-3 p-2 rounded hover:bg-neutral-800 cursor-pointer">
            <input
              type="radio"
              name="background"
              value="pink"
              className="w-4 h-4 accent-primary"
              checked={backgroundType === "pink"}
              onChange={() => onBackgroundChange("pink")}
            />
            <div className="w-8 h-8 bg-primary rounded"></div>
            <span>Pink</span>
          </label>

          <label className="flex items-center space-x-3 p-2 rounded hover:bg-neutral-800 cursor-pointer">
            <input
              type="radio"
              name="background"
              value="custom"
              className="w-4 h-4 accent-primary"
              checked={backgroundType === "custom"}
              onChange={() => onBackgroundChange("custom")}
            />
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded"></div>
            <span>Custom Color</span>
          </label>

          <div className={`pt-2 pl-9 ${backgroundType === "custom" ? "block" : "hidden"}`}>
            <input
              type="color"
              value={customBackgroundColor}
              className="w-full h-8 rounded bg-transparent cursor-pointer"
              onChange={(e) => onCustomBackgroundChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-secondary border border-neutral-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Download className="mr-2 text-primary" />
          Actions
        </h3>

        <div className="space-y-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={handleDownload}
            disabled={!isImageUploaded || isProcessing}
          >
            <Download className="mr-2 h-4 w-4" /> Download Image
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={onReset}
            disabled={!isImageUploaded || isProcessing}
          >
            <RotateCw className="mr-2 h-4 w-4" /> Reset All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;
