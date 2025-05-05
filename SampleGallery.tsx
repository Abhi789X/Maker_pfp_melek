import React from "react";
import { useQuery } from "@tanstack/react-query";

interface GalleryItem {
  id: string;
  imageUrl: string;
  clothingType: string;
}

interface SampleGalleryProps {}

const SampleGallery: React.FC<SampleGalleryProps> = () => {
  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  return (
    <section className="mt-16 mb-12" id="gallery">
      <h2 className="section-title">Sample Results</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-neutral-800 rounded-lg animate-pulse"
              ></div>
            ))
        ) : (
          // Gallery items
          galleryItems.map((item) => (
            <div
              key={item.id}
              className="aspect-square bg-neutral-800 rounded-lg overflow-hidden group relative cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={`Sample with ${item.clothingType}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <span className="text-white font-medium text-sm">
                  {item.clothingType}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default SampleGallery;
