export interface Settings {
  id: number;
  couple_name: string;
  wedding_message: string | null;
  pix_key: string | null;
  pix_qr_code_path: string | null;
  header_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsFormData {
  couple_name: string;
  wedding_message: string;
  pix_key: string;
}
