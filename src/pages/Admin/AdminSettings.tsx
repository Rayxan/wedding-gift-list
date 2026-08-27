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
      const path = await uploadPixQrCode(qrFile);
      await updateQrCodePath(settings.id, path);
      setSettings((prev) => prev ? { ...prev, pix_qr_code_path: path } : prev);
      setQrFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setQrError('Não foi possível fazer o upload do QR code.');
    } finally {
      setQrUploading(false);
    }
  };

  const handleQrDelete = async () => {
    if (!settings) return;
    setQrUploading(true);
    try {
      await deletePixQrCode(settings.id);
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
