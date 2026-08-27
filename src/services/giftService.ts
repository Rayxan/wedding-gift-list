import { supabase, STORAGE_BUCKET } from './supabase';
import { Gift } from '../types/gift';
import { generateUniqueFileName } from '../utils/image';

export async function getGifts(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Gift[];
}

export async function getGiftById(id: number): Promise<Gift> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Gift;
}

export async function createGift(
  gift: Omit<Gift, 'id' | 'created_at' | 'updated_at'>,
  imageFile?: File
): Promise<Gift> {
  let image_path: string | null = gift.image_path ?? null;

  if (imageFile) {
    image_path = await uploadGiftImage(imageFile);
  }

  const { data, error } = await supabase
    .from('gifts')
    .insert({ ...gift, image_path })
    .select()
    .single();

  if (error) throw error;
  return data as Gift;
}

export async function updateGift(
  id: number,
  updates: Partial<Omit<Gift, 'id' | 'created_at'>>,
  imageFile?: File,
  oldImagePath?: string | null
): Promise<Gift> {
  let image_path = updates.image_path;

  if (imageFile) {
    if (oldImagePath) {
      await deleteGiftImage(oldImagePath);
    }
    image_path = await uploadGiftImage(imageFile);
  }

  const { data, error } = await supabase
    .from('gifts')
    .update({ ...updates, image_path, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Gift;
}

export async function deleteGift(id: number, imagePath?: string | null): Promise<void> {
  if (imagePath) {
    await deleteGiftImage(imagePath);
  }

  const { error } = await supabase.from('gifts').delete().eq('id', id);
  if (error) throw error;
}

export async function setGiftPurchased(id: number, purchased: boolean): Promise<Gift> {
  const { data, error } = await supabase
    .from('gifts')
    .update({ purchased, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Gift;
}

async function uploadGiftImage(file: File): Promise<string> {
  const fileName = generateUniqueFileName(file.name);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  return data.path;
}

export async function deleteGiftImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) console.error('Falha ao excluir imagem do Storage:', error.message);
}

export function getGiftImageUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
