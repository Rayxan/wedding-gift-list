import { Gift } from '../types/gift';
import { GiftCard } from './GiftCard';

const CATEGORY_ORDER = ['Sala', 'Cozinha', 'Banheiro', 'Quarto', 'Mordomias', 'Decoração'];

export function categorySlug(cat: string): string {
  return cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function groupGifts(gifts: Gift[]): { label: string; slug: string; items: Gift[] }[] {
  const map = new Map<string, Gift[]>();
  const uncategorized: Gift[] = [];

  for (const gift of gifts) {
    const key = gift.category;
    if (!key) { uncategorized.push(gift); continue; }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(gift);
  }

  const sorted = Array.from(map.keys()).sort((a, b) => {
    const ai = CATEGORY_ORDER.findIndex((c) => c.toLowerCase() === a.toLowerCase());
    const bi = CATEGORY_ORDER.findIndex((c) => c.toLowerCase() === b.toLowerCase());
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b, 'pt-BR');
  });

  const result = sorted.map((cat) => ({
    label: cat,
    slug: categorySlug(cat),
    items: map.get(cat)!,
  }));

  if (uncategorized.length > 0) {
    result.push({ label: 'Outros', slug: 'outros', items: uncategorized });
  }

  return result;
}

interface GiftSectionsProps {
  gifts: Gift[];
  onPresent?: (gift: Gift) => void;
  presentingId?: number | null;
}

export function GiftSections({ gifts, onPresent, presentingId }: GiftSectionsProps) {
  const sections = groupGifts(gifts);

  if (sections.length === 0) {
    return (
      <div className="gift-list__empty">
        <p>Nenhum presente encontrado para este filtro.</p>
      </div>
    );
  }

  return (
    <div className="gift-sections">
      {sections.map((section) => (
        <section
          key={section.slug}
          id={section.slug}
          className="gift-section"
          aria-label={section.label}
        >
          <div className="gift-section__header">
            <h3 className="gift-section__title">{section.label}</h3>
            <span className="gift-section__count">
              {section.items.length} presente{section.items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ul className="gift-list" role="list">
            {section.items.map((gift) => (
              <li key={gift.id} className="gift-list__item">
                <GiftCard gift={gift} onPresent={onPresent} presentingId={presentingId} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
