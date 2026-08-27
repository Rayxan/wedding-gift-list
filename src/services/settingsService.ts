import { supabase } from './supabase';
import { Settings, SettingsFormData } from '../types/settings';

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
