export interface Gift {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_path: string | null;
  product_url: string | null;
  purchased: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftFormData {
  name: string;
  description: string;
  price: string;
  product_url: string;
}
