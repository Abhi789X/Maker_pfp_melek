import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}

export function getImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export const SAMPLE_IMAGES = [
  // Human poses
  "/api/samples/human1",
  "/api/samples/human2",
  "/api/samples/human3",
  "/api/samples/human4",
  "/api/samples/human5",
  "/api/samples/human6",
  // Anime characters
  "/api/samples/anime1",
  "/api/samples/anime2",
  "/api/samples/anime3",
  "/api/samples/anime4",
  // Animals
  "/api/samples/animal1",
  "/api/samples/animal2",
  "/api/samples/animal3",
  "/api/samples/animal4",
];

export type ClothingType = "jacket" | "hoodie" | "cap";

export interface ClothingItem {
  id: ClothingType;
  name: string;
  description: string;
  imageUrl: string;
}

export const CLOTHING_ITEMS: ClothingItem[] = [
  {
    id: "jacket",
    name: "SUCCINCT Jacket",
    description: "Pink & Black",
    imageUrl: "/api/clothing/jacket"
  },
  {
    id: "hoodie",
    name: "GPROVE Hoodie",
    description: "Pink",
    imageUrl: "/api/clothing/hoodie"
  },
  {
    id: "cap",
    name: "Logo Cap",
    description: "Pink & White",
    imageUrl: "/api/clothing/cap"
  }
];
