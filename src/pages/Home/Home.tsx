import { useState, useEffect } from 'react';
import { Settings } from '../../types/settings';
import { Gift } from '../../types/gift';
import { getSettings, getQrCodeUrl, getHeaderImageUrl } from '../../services/settingsService';
import { setGiftPurchased } from '../../services/giftService';
import { Header } from '../../components/Header';
import { GiftSections } from '../../components/GiftSections';
import { GiftFilters, priceInRange, PurchasedFilter } from '../../components/GiftFilters';
import { SearchBar } from '../../components/SearchBar';
import { Loading } from '../../components/Loading';
import { Modal } from '../../components/Modal';
import { useGifts } from '../../hooks/useGifts';

export function Home() {
  const { gifts, loading: giftsLoading, error: giftsError, refetch } = useGifts();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [confirmGift, setConfirmGift] = useState<Gift | null>(null);
  const [presentingId, setPresentingId] = useState<number | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedPurchased, setSelectedPurchased] = useState<PurchasedFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcome, setShowWelcome] = useState(
    () => !sessionStorage.getItem('welcome-shown')
  );

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcome-shown', '1');
    setShowWelcome(false);
  };

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleCopyPix = async () => {
    if (!settings?.pix_key) return;
    try {
      await navigator.clipboard.writeText(settings.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handlePresentConfirm = async () => {
    if (!confirmGift) return;
    setPresentingId(confirmGift.id);
    setConfirmGift(null);
    try {
      await setGiftPurchased(confirmGift.id, true);
      await refetch();
    } catch {
      // RLS vai bloquear se já estiver purchased — refetch mostra o estado real
      await refetch();
    } finally {
      setPresentingId(null);
    }
  };

  if (settingsLoading || giftsLoading) {
    return <Loading fullscreen />;
  }

  function matchesSearch(gift: { name: string; description: string | null }, query: string): boolean {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      gift.name.toLowerCase().includes(q) ||
      (gift.description?.toLowerCase().includes(q) ?? false)
    );
  }

  function matchesPurchased(gift: { purchased: boolean }, filter: PurchasedFilter): boolean {
    if (filter === 'available') return !gift.purchased;
    if (filter === 'purchased') return gift.purchased;
    return true;
  }

  function applyFilters(list: typeof gifts) {
    return list.filter(
      (g) =>
        priceInRange(g.price, selectedPriceRange) &&
        matchesSearch(g, searchQuery) &&
        matchesPurchased(g, selectedPurchased)
    );
  }

  const qrCodeUrl = settings?.pix_qr_code_path
    ? getQrCodeUrl(settings.pix_qr_code_path)
    : null;

  const headerImageUrl = settings?.header_image_path
    ? getHeaderImageUrl(settings.header_image_path)
    : null;

  return (
    <main>
      <Header
        coupleName={settings?.couple_name ?? 'Lista de Presentes'}
        weddingMessage={settings?.wedding_message}
      />

      {headerImageUrl && (
        <div className="couple-photo-section">
          <img
            src={headerImageUrl}
            alt={`Foto de ${settings?.couple_name ?? 'o casal'}`}
            className="couple-photo"
          />
        </div>
      )}

      {settings?.pix_key && (
        <section className="pix-section" aria-label="Chave PIX para presente">
          <div className={`pix-section__content${qrCodeUrl ? ' pix-section__content--with-qr' : ''}`}>
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code PIX"
                className="pix-section__qr"
              />
            )}
            <div className="pix-section__info">
              <p className="pix-section__label">Chave PIX</p>
              <p className="pix-section__key">{settings.pix_key}</p>
              <button
                className={`pix-section__copy${copied ? ' pix-section__copy--copied' : ''}`}
                onClick={handleCopyPix}
                aria-label="Copiar chave PIX"
                aria-live="polite"
              >
                {copied ? '✓ PIX copiado!' : 'Copiar PIX'}
              </button>
            </div>
          </div>
        </section>
      )}

      {settings?.wedding_address && (
        <div className="address-section" aria-label="Local do casamento">
          <div className="address-section__content">
            <span className="address-section__icon" aria-hidden="true">📍</span>
            <p className="address-section__text">{settings.wedding_address}</p>
          </div>
        </div>
      )}

      <section className="gifts-section" aria-label="Lista de presentes">
        <div className="container">
          <h2 className="gifts-section__title">Lista de Presentes</h2>
          {giftsError ? (
            <p className="error-message" role="alert">{giftsError}</p>
          ) : (
            <>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                className="home-search"
              />
              <GiftFilters
                gifts={gifts}
                selectedPriceRange={selectedPriceRange}
                selectedPurchased={selectedPurchased}
                onPriceRangeChange={setSelectedPriceRange}
                onPurchasedChange={setSelectedPurchased}
                totalVisible={applyFilters(gifts).length}
              />
              <GiftSections
                gifts={applyFilters(gifts)}
                onPresent={setConfirmGift}
                presentingId={presentingId}
              />
            </>
          )}
        </div>
      </section>

      {confirmGift && (
        <Modal
          title="Confirmar presente"
          message={`Deseja presentear "${confirmGift.name}" ? Após confirmar, somente os noivos poderão desfazer.`}
          confirmLabel="Sim, vou dar este presente!"
          cancelLabel="Cancelar"
          onConfirm={handlePresentConfirm}
          onCancel={() => setConfirmGift(null)}
        />
      )}

      {(settings?.whatsapp_groom || settings?.whatsapp_bride) && (
        <div className="whatsapp-fabs" aria-label="Falar com os noivos">
          {settings.whatsapp_groom && (
            <a
              href={`https://wa.me/${settings.whatsapp_groom.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-fab"
              aria-label="Falar com o noivo pelo WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="whatsapp-fab__icon">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span aria-hidden="true">🤵</span>
              <span className="whatsapp-fab__label">Noivo</span>
            </a>
          )}
          {settings.whatsapp_bride && (
            <a
              href={`https://wa.me/${settings.whatsapp_bride.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-fab"
              aria-label="Falar com a noiva pelo WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="whatsapp-fab__icon">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span aria-hidden="true">👰</span>
              <span className="whatsapp-fab__label">Noiva</span>
            </a>
          )}
        </div>
      )}

      {showWelcome && (
        <Modal
          title="💌 Aviso importante"
          message="Caso compre em sites ou fora da lista, avise os noivos!"
          confirmLabel="Entendido!"
          cancelLabel=""
          onConfirm={handleCloseWelcome}
          onCancel={handleCloseWelcome}
        />
      )}
    </main>
  );
}
