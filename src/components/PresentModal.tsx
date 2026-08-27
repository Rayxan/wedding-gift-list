import { useState, useEffect } from 'react';
import { Gift } from '../types/gift';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatCurrency';

interface PresentModalProps {
  gift: Gift;
  pixKey: string | null;
  qrCodeUrl: string | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function PresentModal({
  gift,
  pixKey,
  qrCodeUrl,
  loading,
  onConfirm,
  onClose,
}: PresentModalProps) {
  const [showDesistoConfirm, setShowDesistoConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        if (showDesistoConfirm) setShowDesistoConfirm(false);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, loading, showDesistoConfirm]);

  const handleCopyPix = async () => {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  if (showDesistoConfirm) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="desisto-title">
        <div className="modal">
          <h2 id="desisto-title" className="modal__title">Vai mesmo desistir? 😢</h2>
          <p className="modal__message">
            Você quer mesmo desistir da compra de <strong>{gift.name}</strong>?
          </p>
          <div className="modal__actions">
            <Button variant="ghost" onClick={() => setShowDesistoConfirm(false)}>
              Não, vou presentear!
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Sim, desisto
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="present-title"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="modal present-modal">
        <h2 id="present-title" className="modal__title">Confirmar presente</h2>
        <p className="modal__message">
          Você vai dar <strong>{gift.name}</strong> ({formatCurrency(gift.price)}) de presente?
        </p>

        {(pixKey || qrCodeUrl) && (
          <div className="present-modal__pix">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code PIX" className="present-modal__qr" />
            )}
            <div className="present-modal__pix-info">
              {pixKey && (
                <>
                  <p className="present-modal__pix-label">Chave PIX</p>
                  <p className="present-modal__pix-key">{pixKey}</p>
                  <button
                    className={`pix-section__copy${copied ? ' pix-section__copy--copied' : ''}`}
                    onClick={handleCopyPix}
                    aria-label="Copiar chave PIX"
                  >
                    {copied ? '✓ Copiado!' : 'Copiar PIX'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <p className="present-modal__notice">
          Após confirmar, avise os noivos. Somente eles poderão desfazer.
        </p>

        <div className="present-modal__actions">
          <button
            className="present-modal__desisto"
            onClick={() => setShowDesistoConfirm(true)}
            disabled={loading}
          >
            Desisto da compra
          </button>
          <Button onClick={onConfirm} loading={loading}>
            Sim, vou presentear! 🎁
          </Button>
        </div>
      </div>
    </div>
  );
}
