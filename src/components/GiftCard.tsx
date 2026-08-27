import { Gift } from '../types/gift';
import { getGiftImageUrl } from '../services/giftService';
import { formatCurrency } from '../utils/formatCurrency';

interface GiftCardProps {
  gift: Gift;
}

export function GiftCard({ gift }: GiftCardProps) {
  const imageUrl = gift.image_path ? getGiftImageUrl(gift.image_path) : null;

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
          gift.product_url && (
            <a
              href={gift.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gift-card__link"
              aria-label={`Ver anúncio de ${gift.name}`}
            >
              Ver anúncio
            </a>
          )
        )}
      </div>
    </article>
  );
}
