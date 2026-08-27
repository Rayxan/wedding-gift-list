import { Gift } from '../types/gift';
import { getGiftImageUrl } from '../services/giftService';
import { formatCurrency } from '../utils/formatCurrency';

interface GiftCardProps {
  gift: Gift;
  /** Fornecido apenas na página pública; abre confirmação de presente */
  onPresent?: (gift: Gift) => void;
  presentingId?: number | null;
}

export function GiftCard({ gift, onPresent, presentingId }: GiftCardProps) {
  const imageUrl = gift.image_path ? getGiftImageUrl(gift.image_path) : null;
  const isPresenting = presentingId === gift.id;

  return (
    <article className={`gift-card${gift.purchased ? ' gift-card--purchased' : ''}`}>
      <div className="gift-card__image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={gift.name}
            className="gift-card__image"
            loading="lazy"
          />
        ) : (
          <div className="gift-card__image-placeholder" aria-hidden="true">
            <span>🎁</span>
          </div>
        )}
        {gift.purchased && (
          <div className="gift-card__badge" aria-label="Presente já escolhido">
            Escolhido
          </div>
        )}
      </div>

      <div className="gift-card__body">
        <h2 className="gift-card__name">{gift.name}</h2>

        {gift.description && (
          <p className="gift-card__description">{gift.description}</p>
        )}

        <p className="gift-card__price">{formatCurrency(gift.price)}</p>

        {gift.purchased ? (
          <p className="gift-card__status gift-card__status--purchased" role="status">
            💕 Presente já escolhido
          </p>
        ) : (
          <div className="gift-card__actions-row">
            {gift.product_url && (
              <a
                href={gift.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gift-card__link"
                aria-label={`Ver anúncio de ${gift.name}`}
              >
                Ver anúncio
              </a>
            )}
            {onPresent && (
              <button
                className="gift-card__present-btn"
                onClick={() => onPresent(gift)}
                disabled={isPresenting}
                aria-label={`Marcar ${gift.name} como presenteado`}
              >
                {isPresenting ? '...' : '🎁 Presenteado'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
