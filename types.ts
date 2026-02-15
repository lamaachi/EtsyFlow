export interface ProductIdea {
  title: string;
  description: string;
  targetAudience: string;
  priceRange: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  format: string; // e.g., PDF, Canva Template, PNG
}

export interface TrendResult {
  trendName: string;
  description: string;
  searchVolumeLevel: 'High' | 'Medium' | 'Rising';
  groundingUrls: string[];
}

export enum AppView {
  IDEATOR = 'IDEATOR',
  TRENDS = 'TRENDS',
  VISUALIZER = 'VISUALIZER',
  SAVED = 'SAVED',
}

export interface SavedItem extends ProductIdea {
  id: string;
  createdAt: number;
  imageUrl?: string;
}
