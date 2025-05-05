import React from "react";
import type { ClothingItem as ClothingItemType } from "@/lib/utils";

interface ClothingItemProps {
  item: ClothingItemType;
  selected: boolean;
  onClick: () => void;
}

const ClothingItem: React.FC<ClothingItemProps> = ({
  item,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`clothing-option ${
        selected ? "border-primary" : "border-transparent hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <div className="clothing-thumbnail">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full object-contain"
        />
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-neutral-400">{item.description}</p>
      </div>
      <div className="ml-auto flex items-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
          {selected && <div className="w-3 h-3 rounded-full bg-primary"></div>}
        </div>
      </div>
    </div>
  );
};

export default ClothingItem;
