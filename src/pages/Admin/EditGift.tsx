import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GiftForm } from '../../components/GiftForm';
import { GiftFormData, Gift } from '../../types/gift';
import {
  getGiftById,
  updateGift,
  deleteGiftImage,
} from '../../services/giftService';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export function EditGift() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [gift, setGift] = useState<Gift | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getGiftById(Number(id))
      .then(setGift)
      .catch(() => setError('Presente não encontrado.'))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleSubmit = async (
    data: GiftFormData,
    imageFile?: File,
    removeImage?: boolean
  ) => {
    if (!gift) return;
    setSaving(true);
    setError(null);

    try {
      const updates: Partial<Omit<Gift, 'id' | 'created_at'>> = {
        name: data.name.trim(),
        description: data.description.trim() || null,
        price: parseFloat(data.price),
        product_url: data.product_url.trim() || null,
        category: data.category.trim() || null,
      };

      // Image removed without replacement
      if (removeImage && !imageFile) {
        if (gift.image_path) {
          await deleteGiftImage(gift.image_path);
        }
        updates.image_path = null;
        await updateGift(gift.id, updates);
      } else {
        await updateGift(
          gift.id,
          updates,
          imageFile,
          imageFile ? gift.image_path : undefined
        );
      }

      navigate('/admin');
    } catch {
      setError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (fetchLoading) return <Loading fullscreen />;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__content">
          <h1 className="admin-header__title">Editar Presente</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Voltar
          </Button>
        </div>
      </header>

      <main className="admin-main admin-form-page">
        {error && (
          <p className="error-message" role="alert">{error}</p>
        )}
        {gift ? (
          <GiftForm initialData={gift} onSubmit={handleSubmit} loading={saving} />
        ) : (
          !error && <p>Carregando...</p>
        )}
      </main>
    </div>
  );
}
