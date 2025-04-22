export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

export interface SearchState {
  query: string;
  page: number;
  hitsPerPage: number;
  category?: string;
  brand?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}