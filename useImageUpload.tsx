import { useState, useCallback } from "react";
import { useNotification } from "./useNotification";

export interface UseImageUploadReturn {
  isUploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  getImageFromUrl: (url: string) => Promise<HTMLImageElement>;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file) return null;

      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        showNotification("success", "Upload successful", "Your image has been uploaded successfully.");
        return data.imageUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification(
          "error",
          "Upload failed",
          "We couldn't upload your image. Please try again."
        );
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [showNotification]
  );

  const getImageFromUrl = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }, []);

  return {
    isUploading,
    uploadImage,
    getImageFromUrl,
  };
};

export default useImageUpload;
