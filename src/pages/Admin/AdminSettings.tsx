import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, SettingsFormData } from '../../types/settings';
import { getSettings, updateSettings } from '../../services/settingsService';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
            ✓ Configurações salvas com sucesso!
          </p>
        )}

        {settings ? (
          <form onSubmit={handleSubmit} noValidate>
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
        ) : (
          <p className="error-message">
            Nenhuma configuração encontrada no banco de dados.
            Execute o SQL de inicialização no painel do Supabase.
          </p>
        )}
      </main>
    </div>
  );
}
