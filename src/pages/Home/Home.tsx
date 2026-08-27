import { useState, useEffect } from 'react';
import { Settings } from '../../types/settings';
import { getSettings } from '../../services/settingsService';
import { Header } from '../../components/Header';
import { GiftList } from '../../components/GiftList';
import { Loading } from '../../components/Loading';
import { useGifts } from '../../hooks/useGifts';

export function Home() {
  const { gifts, loading: giftsLoading, error: giftsError } = useGifts();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {
        // Settings são opcionais; fallback sem erro visível ao visitante
      })
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleCopyPix = async () => {
    if (!settings?.pix_key) return;
    try {
      await navigator.clipboard.writeText(settings.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API indisponível
    }
  };

  if (settingsLoading || giftsLoading) {
    return <Loading fullscreen />;
  }

  return (
    <main>
      <Header
        coupleName={settings?.couple_name ?? 'Lista de Presentes'}
        weddingMessage={settings?.wedding_message}
      />

      {settings?.pix_key && (
        <section className="pix-section" aria-label="Chave PIX para presente">
          <div className="pix-section__content">
            <p className="pix-section__label">Chave PIX - Raylan</p>
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
        </section>
      )}

      <section className="gifts-section" aria-label="Lista de presentes">
        <div className="container">
          <h2 className="gifts-section__title">Lista de Presentes</h2>
          {giftsError ? (
            <p className="error-message" role="alert">{giftsError}</p>
          ) : (
            <GiftList gifts={gifts} />
          )}
        </div>
      </section>
    </main>
  );
}
