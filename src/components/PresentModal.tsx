import { useState, useEffect } from 'react';
import { Gift } from '../types/gift';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatCurrency';

interface PresentModalProps {
  gift: Gift;
  pixKey: string | null;
  qrCodeUrl: string | null;
  whatsappGroom: string | null;
  whatsappBride: string | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function PresentModal({
  gift,
  pixKey,
  qrCodeUrl,
  whatsappGroom,
  whatsappBride,
  loading,
  onConfirm,
  onClose,
}: PresentModalProps) {
  const [showDesistoConfirm, setShowDesistoConfirm] = useState(false);
  const [showAvise, setShowAvise] = useState(false);
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

  if (showAvise) {
    return (
      <AviseModal
        whatsappGroom={whatsappGroom}
        whatsappBride={whatsappBride}
        onClose={onClose}
      />
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
          <Button
            onClick={() => { onConfirm(); setShowAvise(true); }}
            loading={loading}
          >
            Sim, vou presentear! 🎁
          </Button>
        </div>
      </div>
    </div>
  );
}

function AviseModal({
  whatsappGroom,
  whatsappBride,
  onClose,
}: {
  whatsappGroom: string | null;
  whatsappBride: string | null;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="avise-title">
      <div className="modal avise-modal">
        <p className="avise-modal__emoji" aria-hidden="true">💌</p>
        <h2 id="avise-title" className="modal__title avise-modal__title">AVISE OS NOIVOS!</h2>
        <p className="modal__message">
          Obrigado por escolher um presente! Envie uma mensagem para que os noivos saibam.
        </p>
        <div className="avise-modal__buttons">
          {whatsappGroom && (
            <a
              href={`https://wa.me/${whatsappGroom.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="avise-modal__wa-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              🤵 Avisar o Noivo
            </a>
          )}
          {whatsappBride && (
            <a
              href={`https://wa.me/${whatsappBride.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="avise-modal__wa-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              👰 Avisar a Noiva
            </a>
          )}
        </div>
        <button className="avise-modal__close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
