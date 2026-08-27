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

export function getQrCodeUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// currentPath: caminho salvo no banco — usado para deletar o arquivo antigo
export async function uploadPixQrCode(file: File, currentPath?: string | null): Promise<string> {
  const validationError = validateImage(file);
  if (validationError) throw new Error(validationError);

  if (currentPath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([currentPath]);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uniquePath = `pix-qr-code/qr-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(uniquePath, file, { cacheControl: '3600', upsert: false });

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

export async function deletePixQrCode(id: number, currentPath: string): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([currentPath]);
  await updateQrCodePath(id, null);
}

export function getHeaderImageUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// currentPath: caminho salvo no banco — usado para deletar o arquivo antigo
export async function uploadHeaderImage(file: File, currentPath?: string | null): Promise<string> {
  const validationError = validateImage(file);
  if (validationError) throw new Error(validationError);

  if (currentPath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([currentPath]);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uniquePath = `header/couple-photo-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(uniquePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  return data.path;
}

export async function updateHeaderImagePath(
  id: number,
  path: string | null
): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ header_image_path: path, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteHeaderImage(id: number, currentPath: string): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([currentPath]);
  await updateHeaderImagePath(id, null);
}
