import {
  users, type User, type InsertUser,
  galleryItems, type GalleryItem, type InsertGalleryItem,
  uploadHistory, type UploadHistory, type InsertUploadHistory
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItem(id: number): Promise<GalleryItem | undefined>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  
  getUploadHistory(): Promise<UploadHistory[]>;
  getUploadById(id: number): Promise<UploadHistory | undefined>;
  createUploadHistory(upload: InsertUploadHistory): Promise<UploadHistory>;
  updateUploadHistory(id: number, data: Partial<InsertUploadHistory>): Promise<UploadHistory | undefined>;
  
  initializeGalleryIfEmpty(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gallery: Map<number, GalleryItem>;
  private uploads: Map<number, UploadHistory>;
  private currentUserId: number;
  private currentGalleryId: number;
  private currentUploadId: number;

  constructor() {
    this.users = new Map();
    this.gallery = new Map();
    this.uploads = new Map();
    this.currentUserId = 1;
    this.currentGalleryId = 1;
    this.currentUploadId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Gallery methods
  async getGalleryItems(): Promise<GalleryItem[]> {
    return Array.from(this.gallery.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  async getGalleryItem(id: number): Promise<GalleryItem | undefined> {
    return this.gallery.get(id);
  }
  
  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const id = this.currentGalleryId++;
    const galleryItem: GalleryItem = { ...item, id, displayOrder: item.displayOrder || 0 };
    this.gallery.set(id, galleryItem);
    return galleryItem;
  }
  
  // Upload history methods
  async getUploadHistory(): Promise<UploadHistory[]> {
    return Array.from(this.uploads.values());
  }
  
  async getUploadById(id: number): Promise<UploadHistory | undefined> {
    return this.uploads.get(id);
  }
  
  async createUploadHistory(upload: InsertUploadHistory): Promise<UploadHistory> {
    const id = this.currentUploadId++;
    const now = new Date().toISOString();
    const uploadRecord: UploadHistory = { 
      ...upload, 
      id, 
      createdAt: now,
      processedImageUrl: upload.processedImageUrl || null,
      clothingType: upload.clothingType || null
    };
    this.uploads.set(id, uploadRecord);
    return uploadRecord;
  }
  
  async updateUploadHistory(id: number, data: Partial<InsertUploadHistory>): Promise<UploadHistory | undefined> {
    const existing = await this.getUploadById(id);
    if (!existing) return undefined;
    
    const updated: UploadHistory = { 
      ...existing, 
      ...data, 
      id: existing.id,
      createdAt: existing.createdAt
    };
    
    this.uploads.set(id, updated);
    return updated;
  }
  
  // Initialize gallery with sample items if empty
  async initializeGalleryIfEmpty(): Promise<void> {
    const items = await this.getGalleryItems();
    if (items.length === 0) {
      // Create sample gallery items
      const sampleItems: InsertGalleryItem[] = [
        {
          imageUrl: "/api/samples/human1",
          clothingType: "SUCCINCT Jacket",
          displayOrder: 1
        },
        {
          imageUrl: "/api/samples/human2",
          clothingType: "GPROVE Hoodie",
          displayOrder: 2
        },
        {
          imageUrl: "/api/samples/anime1",
          clothingType: "Logo Cap",
          displayOrder: 3
        },
        {
          imageUrl: "/api/samples/human3",
          clothingType: "SUCCINCT Jacket",
          displayOrder: 4
        },
        {
          imageUrl: "/api/samples/anime2",
          clothingType: "GPROVE Hoodie",
          displayOrder: 5
        },
        {
          imageUrl: "/api/samples/animal1",
          clothingType: "Logo Cap",
          displayOrder: 6
        },
        {
          imageUrl: "/api/samples/human4",
          clothingType: "SUCCINCT Jacket",
          displayOrder: 7
        },
        {
          imageUrl: "/api/samples/animal2",
          clothingType: "GPROVE Hoodie",
          displayOrder: 8
        }
      ];
      
      for (const item of sampleItems) {
        await this.createGalleryItem(item);
      }
    }
  }
}

export const storage = new MemStorage();
