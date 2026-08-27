import { useState, useEffect, useCallback } from 'react';
import { Gift } from '../types/gift';
import { getGifts } from '../services/giftService';

export function useGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGifts();
      setGifts(data);
    } catch {
      setError('Não foi possível carregar os presentes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  return { gifts, loading, error, refetch: fetchGifts };
}
