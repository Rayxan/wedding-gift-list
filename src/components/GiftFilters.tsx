import { Gift } from '../types/gift';
import { categorySlug } from './GiftSections';

export const PRICE_RANGES = [
  { key: 'all',      label: 'Todos os preços', min: 0,    max: Infinity },
  { key: '0-200',    label: 'Até R$200',        min: 0,    max: 200 },
  { key: '200-500',  label: 'R$200–500',         min: 200,  max: 500 },
  { key: '500-1000', label: 'R$500–1.000',       min: 500,  max: 1000 },
  { key: '1000+',    label: 'Acima de R$1.000',  min: 1000, max: Infinity },
] as const;

export function priceInRange(price: number, rangeKey: string): boolean {
  const range = PRICE_RANGES.find((r) => r.key === rangeKey);
  if (!range) return true;
  return price >= range.min && price <= range.max;
}

interface GiftFiltersProps {
  gifts: Gift[];
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
  totalVisible: number;
}

export function GiftFilters({
  gifts,
  selectedPriceRange,
  onPriceRangeChange,
  totalVisible,
}: GiftFiltersProps) {
  const categories = Array.from(
    new Set(gifts.map((g) => g.category).filter((c): c is string => Boolean(c)))
  );

  const scrollTo = (cat: string) => {
    const el = document.getElementById(categorySlug(cat));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="gift-filters">
      {categories.length > 0 && (
        <div className="gift-filters__row">
          <span className="gift-filters__label">Ir para</span>
          <div className="gift-filters__chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className="filter-chip filter-chip--nav"
                onClick={() => scrollTo(cat)}
                aria-label={`Ir para a seção ${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="gift-filters__row">
        <span className="gift-filters__label">Preço</span>
        <div className="gift-filters__chips">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.key}
              className={`filter-chip${selectedPriceRange === range.key ? ' filter-chip--active' : ''}`}
              onClick={() => onPriceRangeChange(range.key)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gift-filters__summary">
        <span>{totalVisible} presente{totalVisible !== 1 ? 's' : ''}</span>
        {selectedPriceRange !== 'all' && (
          <button className="gift-filters__clear" onClick={() => onPriceRangeChange('all')}>
            Limpar filtro ✕
          </button>
        )}
      </div>
    </div>
  );
}
