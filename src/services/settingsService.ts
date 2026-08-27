import { supabase, STORAGE_BUCKET } from './supabase';
import { Settings, SettingsFormData } from '../types/settings';
import { validateImage } from '../utils/image';

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1);

  if (error) throw error;
  return (data?.[0] as Settings) ?? null;
}

export async function updateSettings(
  id: number,
  updates: SettingsFormData
): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Settings;
}

const QR_CODE_PATH = 'pix-qr-code/qr-code.jpg';

export function getQrCodeUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPixQrCode(file: File): Promise<string> {
  const validationError = validateImage(file);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(QR_CODE_PATH, file, { cacheControl: '3600', upsert: true });

  if (error) throw error;
  return data.path;
}

export async function updateQrCodePath(
  id: number,
  path: string | null
): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ pix_qr_code_path: path, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deletePixQrCode(id: number): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([QR_CODE_PATH]);
  await updateQrCodePath(id, null);
}
