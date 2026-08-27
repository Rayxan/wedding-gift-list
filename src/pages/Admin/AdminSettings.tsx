import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, SettingsFormData } from '../../types/settings';
import {
  getSettings,
  updateSettings,
  uploadPixQrCode,
  updateQrCodePath,
  deletePixQrCode,
  getQrCodeUrl,
  uploadHeaderImage,
  updateHeaderImagePath,
  deleteHeaderImage,
  getHeaderImageUrl,
} from '../../services/settingsService';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [headerUploading, setHeaderUploading] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SettingsFormData>({
    couple_name: '',
    wedding_message: '',
    pix_key: '',
  });

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data) {
          setSettings(data);
          setFormData({
            couple_name: data.couple_name,
            wedding_message: data.wedding_message ?? '',
            pix_key: data.pix_key ?? '',
          });
          if (data.pix_qr_code_path) {
            setQrPreview(getQrCodeUrl(data.pix_qr_code_path));
          }
          if (data.header_image_path) {
            setHeaderPreview(getHeaderImageUrl(data.header_image_path));
          }
        }
      })
      .catch(() => setError('Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof SettingsFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    if (!formData.couple_name.trim()) {
      setError('O nome do casal é obrigatório.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateSettings(settings.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Não foi possível salvar as configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
    setQrError(null);
  };

  const handleQrUpload = async () => {
    if (!qrFile || !settings) return;
    setQrUploading(true);
    setQrError(null);
    try {
      const path = await uploadPixQrCode(qrFile, settings.pix_qr_code_path);
      await updateQrCodePath(settings.id, path);
      setSettings((prev) => prev ? { ...prev, pix_qr_code_path: path } : prev);
      setQrPreview(getQrCodeUrl(path));
      setQrFile(null);
      if (qrInputRef.current) qrInputRef.current.value = '';
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setQrError('Não foi possível fazer o upload do QR code.');
    } finally {
      setQrUploading(false);
    }
  };

  const handleQrDelete = async () => {
    if (!settings?.pix_qr_code_path) return;
    setQrUploading(true);
    try {
      await deletePixQrCode(settings.id, settings.pix_qr_code_path);
      setSettings((prev) => prev ? { ...prev, pix_qr_code_path: null } : prev);
      setQrPreview(null);
      setQrFile(null);
      if (qrInputRef.current) qrInputRef.current.value = '';
    } catch {
      setQrError('Não foi possível remover o QR code.');
    } finally {
      setQrUploading(false);
    }
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeaderFile(file);
    setHeaderPreview(URL.createObjectURL(file));
    setHeaderError(null);
  };

  const handleHeaderUpload = async () => {
    if (!headerFile || !settings) return;
    setHeaderUploading(true);
    setHeaderError(null);
    try {
      const path = await uploadHeaderImage(headerFile, settings.header_image_path);
      await updateHeaderImagePath(settings.id, path);
      setSettings((prev) => prev ? { ...prev, header_image_path: path } : prev);
      setHeaderPreview(getHeaderImageUrl(path));
      setHeaderFile(null);
      if (headerInputRef.current) headerInputRef.current.value = '';
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setHeaderError('Não foi possível fazer o upload da foto.');
    } finally {
      setHeaderUploading(false);
    }
  };

  const handleHeaderDelete = async () => {
    if (!settings?.header_image_path) return;
    setHeaderUploading(true);
    try {
      await deleteHeaderImage(settings.id, settings.header_image_path);
      setSettings((prev) => prev ? { ...prev, header_image_path: null } : prev);
      setHeaderPreview(null);
      setHeaderFile(null);
      if (headerInputRef.current) headerInputRef.current.value = '';
    } catch {
      setHeaderError('Não foi possível remover a foto.');
    } finally {
      setHeaderUploading(false);
    }
  };

  if (loading) return <Loading fullscreen />;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__content">
          <h1 className="admin-header__title">Configurações do Casamento</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Voltar
          </Button>
        </div>
      </header>

      <main className="admin-main admin-form-page">
        {error && (
          <p className="error-message" role="alert">{error}</p>
        )}
        {success && (
          <p className="success-message" role="status">
            ✓ Salvo com sucesso!
          </p>
        )}

        {settings ? (
          <>
            <form onSubmit={handleSubmit} noValidate className="gift-form" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cfg-couple">
                  Nome do Casal <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cfg-couple"
                  type="text"
                  className="form-input"
                  value={formData.couple_name}
                  onChange={set('couple_name')}
                  placeholder="Ex: Ana & João"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cfg-message">
                  Mensagem do Casamento
                </label>
                <textarea
                  id="cfg-message"
                  className="form-input form-textarea"
                  value={formData.wedding_message}
                  onChange={set('wedding_message')}
                  rows={4}
                  placeholder="Uma mensagem especial para os seus convidados..."
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cfg-pix">
                  Chave PIX
                </label>
                <input
                  id="cfg-pix"
                  type="text"
                  className="form-input"
                  value={formData.pix_key}
                  onChange={set('pix_key')}
                  placeholder="E-mail, CPF, telefone ou chave aleatória"
                  disabled={saving}
                />
                <p className="form-hint">
                  Deixe em branco para não exibir a seção PIX.
                </p>
              </div>

              <div className="form-actions">
                <Button type="submit" loading={saving}>
                  Salvar Configurações
                </Button>
              </div>
            </form>

            {/* QR Code do PIX */}
            <div className="gift-form">
              <h2 className="form-label" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                QR Code do PIX
              </h2>

              {qrPreview && (
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={qrPreview}
                    alt="QR Code PIX"
                    style={{ width: 160, height: 160, objectFit: 'contain', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'block', marginBottom: '0.5rem' }}
                  />
                  {settings.pix_qr_code_path && (
                    <Button variant="danger" size="sm" onClick={handleQrDelete} loading={qrUploading}>
                      Remover QR Code
                    </Button>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="cfg-qr">
                  {settings.pix_qr_code_path ? 'Substituir imagem' : 'Adicionar QR Code'}
                </label>
                <input
                  ref={qrInputRef}
                  id="cfg-qr"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="form-input-file"
                  onChange={handleQrChange}
                  disabled={qrUploading}
                />
                <p className="form-hint">JPEG ou PNG, máximo 5 MB.</p>
              </div>

              {qrError && <p className="form-error" role="alert">{qrError}</p>}

              {qrFile && (
                <Button onClick={handleQrUpload} loading={qrUploading}>
                  Salvar QR Code
                </Button>
              )}
            </div>

            {/* Foto do casal no cabeçalho */}
            <div className="gift-form">
              <h2 className="form-label" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                Foto do Casal (fundo do título)
              </h2>

              {headerPreview && (
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={headerPreview}
                    alt="Foto do casal"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', display: 'block', marginBottom: '0.5rem' }}
                  />
                  {settings.header_image_path && (
                    <Button variant="danger" size="sm" onClick={handleHeaderDelete} loading={headerUploading}>
                      Remover foto
                    </Button>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="cfg-header">
                  {settings.header_image_path ? 'Substituir foto' : 'Adicionar foto'}
                </label>
                <input
                  ref={headerInputRef}
                  id="cfg-header"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="form-input-file"
                  onChange={handleHeaderChange}
                  disabled={headerUploading}
                />
                <p className="form-hint">JPEG ou PNG, máximo 5 MB. A foto aparece como fundo do título na página principal.</p>
              </div>

              {headerError && <p className="form-error" role="alert">{headerError}</p>}

              {headerFile && (
                <Button onClick={handleHeaderUpload} loading={headerUploading}>
                  Salvar Foto
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="error-message">
            Nenhuma configuração encontrada no banco de dados.
          </p>
        )}
      </main>
    </div>
  );
}
