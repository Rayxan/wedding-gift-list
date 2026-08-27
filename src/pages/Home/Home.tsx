import { useState, useEffect } from 'react';
import { Settings } from '../../types/settings';
import { Gift } from '../../types/gift';
import { getSettings, getQrCodeUrl, getHeaderImageUrl } from '../../services/settingsService';
import { setGiftPurchased } from '../../services/giftService';
import { Header } from '../../components/Header';
import { GiftSections } from '../../components/GiftSections';
import { GiftFilters, priceInRange } from '../../components/GiftFilters';
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

      <section className="gifts-section" aria-label="Lista de presentes">
        <div className="container">
          <h2 className="gifts-section__title">Lista de Presentes</h2>
          {giftsError ? (
            <p className="error-message" role="alert">{giftsError}</p>
          ) : (
            <>
              <GiftFilters
                gifts={gifts}
                selectedPriceRange={selectedPriceRange}
                onPriceRangeChange={setSelectedPriceRange}
                totalVisible={gifts.filter((g) => priceInRange(g.price, selectedPriceRange)).length}
              />
              <GiftSections
                gifts={gifts.filter((g) => priceInRange(g.price, selectedPriceRange))}
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
          message={`Você vai dar "${confirmGift.name}" de presente? Após confirmar, somente os noivos poderão desfazer.`}
          confirmLabel="Sim, vou dar este presente!"
          cancelLabel="Cancelar"
          onConfirm={handlePresentConfirm}
          onCancel={() => setConfirmGift(null)}
        />
      )}
    </main>
  );
}
