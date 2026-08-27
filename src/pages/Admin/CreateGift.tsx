import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiftForm } from '../../components/GiftForm';
import { GiftFormData } from '../../types/gift';
import { createGift } from '../../services/giftService';
import { Button } from '../../components/Button';

export function CreateGift() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: GiftFormData, imageFile?: File) => {
    setLoading(true);
    setError(null);
    try {
      await createGift(
        {
          name: data.name.trim(),
          description: data.description.trim() || null,
          price: parseFloat(data.price),
          product_url: data.product_url.trim() || null,
          purchased: false,
          image_path: null,
        },
        imageFile
      );
      navigate('/admin');
    } catch {
      setError('Não foi possível salvar o presente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__content">
          <h1 className="admin-header__title">Novo Presente</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Voltar
          </Button>
        </div>
      </header>

      <main className="admin-main admin-form-page">
        {error && (
          <p className="error-message" role="alert">{error}</p>
        )}
        <GiftForm onSubmit={handleSubmit} loading={loading} />
      </main>
    </div>
  );
}
