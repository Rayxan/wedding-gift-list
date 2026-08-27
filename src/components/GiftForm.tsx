import { useState, useRef } from 'react';
import { Gift, GiftFormData } from '../types/gift';
import { Button } from './Button';
import { validateImage } from '../utils/image';
import { getGiftImageUrl } from '../services/giftService';

interface GiftFormProps {
  initialData?: Partial<Gift>;
  onSubmit: (data: GiftFormData, imageFile?: File, removeImage?: boolean) => Promise<void>;
  loading?: boolean;
}

type FormErrors = Partial<GiftFormData & { image: string }>;

export function GiftForm({ initialData, onSubmit, loading = false }: GiftFormProps) {
  const [formData, setFormData] = useState<GiftFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price != null ? String(initialData.price) : '',
    product_url: initialData?.product_url ?? '',
  });

  const hasInitialImage = Boolean(initialData?.image_path);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_path ? getGiftImageUrl(initialData.image_path) : null
  );
  const [imageRemoved, setImageRemoved] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof GiftFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) {
      errs.name = 'O nome é obrigatório.';
    }

    const priceNum = parseFloat(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      errs.price = 'Informe um valor válido (≥ 0).';
    }

    if (
      formData.product_url.trim() !== '' &&
      !/^https?:\/\/.+/.test(formData.product_url.trim())
    ) {
      errs.product_url = 'Informe uma URL válida (ex: https://...).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateImage(file);
    if (err) {
      setErrors((prev) => ({ ...prev, image: err }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (hasInitialImage) setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData, imageFile ?? undefined, imageRemoved);
  };

  return (
    <form className="gift-form" onSubmit={handleSubmit} noValidate>
      {/* Nome */}
      <div className="form-group">
        <label className="form-label" htmlFor="gf-name">
          Nome <span aria-hidden="true">*</span>
        </label>
        <input
          id="gf-name"
          type="text"
          className={`form-input${errors.name ? ' form-input--error' : ''}`}
          value={formData.name}
          onChange={set('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'gf-name-err' : undefined}
          disabled={loading}
          autoComplete="off"
        />
        {errors.name && (
          <p id="gf-name-err" className="form-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Descrição */}
      <div className="form-group">
        <label className="form-label" htmlFor="gf-desc">Descrição</label>
        <textarea
          id="gf-desc"
          className="form-input form-textarea"
          value={formData.description}
          onChange={set('description')}
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Valor */}
      <div className="form-group">
        <label className="form-label" htmlFor="gf-price">
          Valor (R$) <span aria-hidden="true">*</span>
        </label>
        <input
          id="gf-price"
          type="number"
          min="0"
          step="0.01"
          className={`form-input${errors.price ? ' form-input--error' : ''}`}
          value={formData.price}
          onChange={set('price')}
          aria-invalid={!!errors.price}
          aria-describedby={errors.price ? 'gf-price-err' : undefined}
          disabled={loading}
        />
        {errors.price && (
          <p id="gf-price-err" className="form-error" role="alert">
            {errors.price}
          </p>
        )}
      </div>

      {/* Link */}
      <div className="form-group">
        <label className="form-label" htmlFor="gf-url">Link do Anúncio</label>
        <input
          id="gf-url"
          type="url"
          className={`form-input${errors.product_url ? ' form-input--error' : ''}`}
          value={formData.product_url}
          onChange={set('product_url')}
          placeholder="https://"
          aria-invalid={!!errors.product_url}
          aria-describedby={errors.product_url ? 'gf-url-err' : undefined}
          disabled={loading}
        />
        {errors.product_url && (
          <p id="gf-url-err" className="form-error" role="alert">
            {errors.product_url}
          </p>
        )}
      </div>

      {/* Imagem */}
      <div className="form-group">
        <label className="form-label" htmlFor="gf-image">Imagem</label>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Pré-visualização" className="image-preview__img" />
            <button
              type="button"
              className="image-preview__remove"
              onClick={handleRemoveImage}
              disabled={loading}
              aria-label="Remover imagem"
            >
              ✕
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          id="gf-image"
          type="file"
          accept="image/jpeg,image/png"
          className="form-input-file"
          onChange={handleImageChange}
          disabled={loading}
        />
        {errors.image && (
          <p className="form-error" role="alert">{errors.image}</p>
        )}
        <p className="form-hint">JPEG ou PNG, máximo 5 MB.</p>
      </div>

      <div className="form-actions">
        <Button type="submit" loading={loading}>Salvar Presente</Button>
      </div>
    </form>
  );
}
