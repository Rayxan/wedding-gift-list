import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGifts } from '../../hooks/useGifts';
import { Gift } from '../../types/gift';
import {
  deleteGift,
  setGiftPurchased,
  getGiftImageUrl,
} from '../../services/giftService';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Loading } from '../../components/Loading';
import { SearchBar } from '../../components/SearchBar';
import { formatCurrency } from '../../utils/formatCurrency';

export function Admin() {
  const { user, signOut } = useAuth();
  const { gifts, loading, error, refetch } = useGifts();
  const navigate = useNavigate();

  const [deletingGift, setDeletingGift] = useState<Gift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedFilter, setPurchasedFilter] = useState<'all' | 'available' | 'purchased'>('all');

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleTogglePurchased = async (gift: Gift) => {
    setTogglingId(gift.id);
    setActionError(null);
    try {
      await setGiftPurchased(gift.id, !gift.purchased);
      await refetch();
    } catch {
      setActionError('Não foi possível alterar o status do presente.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGift) return;
    setDeleting(true);
    try {
      await deleteGift(deletingGift.id, deletingGift.image_path);
      await refetch();
      setDeletingGift(null);
    } catch {
      setActionError('Não foi possível excluir o presente.');
      setDeletingGift(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading fullscreen />;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__content">
          <h1 className="admin-header__title">Painel Administrativo</h1>
          <div className="admin-header__actions">
            <span className="admin-header__user">{user?.email}</span>
            <a href="/" className="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer">
              Ver site
            </a>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-toolbar">
          <h2 className="admin-toolbar__title">Presentes ({gifts.length})</h2>
          <div className="admin-toolbar__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/configuracoes')}
            >
              Configurações
            </Button>
            <Button size="sm" onClick={() => navigate('/admin/presentes/novo')}>
              + Novo Presente
            </Button>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nome..."
          className="admin-search"
        />

        <div className="admin-status-filter">
          {([
            { key: 'all',       label: 'Todos' },
            { key: 'available', label: '🎁 Disponíveis' },
            { key: 'purchased', label: '💕 Presenteados' },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              className={`filter-chip${purchasedFilter === opt.key ? ' filter-chip--active' : ''}`}
              onClick={() => setPurchasedFilter(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(error || actionError) && (
          <p className="error-message" role="alert">
            {error ?? actionError}
          </p>
        )}

        {(() => {
          const filtered = gifts.filter((g) => {
            const matchesSearch = !searchQuery.trim() ||
              g.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
            const matchesPurchased =
              purchasedFilter === 'all' ||
              (purchasedFilter === 'available' && !g.purchased) ||
              (purchasedFilter === 'purchased' && g.purchased);
            return matchesSearch && matchesPurchased;
          });
          if (gifts.length === 0) return (
            <div className="admin-empty">
              <p>Nenhum presente cadastrado ainda.</p>
              <Button onClick={() => navigate('/admin/presentes/novo')}>
                Adicionar primeiro presente
              </Button>
            </div>
          );
          if (filtered.length === 0) return (
            <div className="admin-empty">
              <p>Nenhum presente encontrado para "{searchQuery}".</p>
            </div>
          );
          return (
          <div className="admin-gifts-grid">
            {filtered.map((gift) => {
              const imageUrl = gift.image_path
                ? getGiftImageUrl(gift.image_path)
                : null;
              return (
                <div
                  key={gift.id}
                  className={`admin-gift-card${gift.purchased ? ' admin-gift-card--purchased' : ''}`}
                >
                  <div className="admin-gift-card__image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={gift.name} loading="lazy" />
                    ) : (
                      <div className="admin-gift-card__no-image" aria-hidden="true">
                        🎁
                      </div>
                    )}
                  </div>

                  <div className="admin-gift-card__info">
                    <h3 className="admin-gift-card__name">{gift.name}</h3>
                    <p className="admin-gift-card__price">
                      {formatCurrency(gift.price)}
                    </p>
                    <span
                      className={`admin-gift-card__status admin-gift-card__status--${
                        gift.purchased ? 'purchased' : 'available'
                      }`}
                    >
                      {gift.purchased ? 'Escolhido' : 'Disponível'}
                    </span>
                  </div>

                  <div className="admin-gift-card__actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTogglePurchased(gift)}
                      loading={togglingId === gift.id}
                      title={
                        gift.purchased
                          ? 'Marcar como disponível'
                          : 'Marcar como escolhido'
                      }
                    >
                      {gift.purchased ? 'Disponível' : 'Escolhido'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/admin/presentes/${gift.id}/editar`)
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingGift(gift)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          );
        })()}
      </main>

      {deletingGift && (
        <Modal
          title="Excluir Presente"
          message={`Tem certeza que deseja excluir "${deletingGift.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingGift(null)}
        />
      )}
    </div>
  );
}
