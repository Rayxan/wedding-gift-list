import { Gift } from '../types/gift';
import { GiftCard } from './GiftCard';

interface GiftListProps {
  gifts: Gift[];
  onPresent?: (gift: Gift) => void;
  presentingId?: number | null;
}

export function GiftList({ gifts, onPresent, presentingId }: GiftListProps) {
  if (gifts.length === 0) {
    return (
      <div className="gift-list__empty">
        <p>Nenhum presente cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <ul className="gift-list" role="list">
      {gifts.map((gift) => (
        <li key={gift.id} className="gift-list__item">
          <GiftCard gift={gift} onPresent={onPresent} presentingId={presentingId} />
        </li>
      ))}
    </ul>
  );
}
