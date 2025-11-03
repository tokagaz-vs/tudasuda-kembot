import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import { ArrowLeft, Camera, Check, User as UserIcon } from '@phosphor-icons/react';

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing } = useTheme();
  const { hapticFeedback, showAlert } = useTelegram();
  const { user, updateUser, refreshUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
  if (!user) return;

  if (!formData.first_name.trim()) {
    hapticFeedback.notification('error');
    await showAlert('❌ Имя не может быть пустым');
    return;
  }

  hapticFeedback.impact('medium');
  setIsLoading(true);

  try {
    // Формируем полное имя
    const full_name = `${formData.first_name} ${formData.last_name || ''}`.trim();

    // ✅ ИСПРАВЛЕНО: Фильтруем undefined значения
    const rawUpdates = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim() || null,  // используем null вместо undefined
      username: formData.username.trim() || null,    // используем null вместо undefined
      full_name: full_name,
    };

    // Убираем поля с null из объекта (опционально)
    const updates = Object.fromEntries(
      Object.entries(rawUpdates).filter(([_, value]) => value !== null && value !== '')
    ) as Partial<User>;

    // Если нужно явно очистить поле (установить null), добавляем его отдельно
    if (!formData.last_name.trim()) {
      (updates as any).last_name = null;
    }
    if (!formData.username.trim()) {
      (updates as any).username = null;
    }

    console.log('📝 [ProfileEdit] Отправка обновлений:', updates);

    // Обновляем через authStore
    const success = await updateUser(updates);

    if (success) {
      // Обновляем пользователя из БД
      await refreshUser();
      
      hapticFeedback.notification('success');
      await showAlert('✅ Профиль успешно обновлен!');
      navigate(-1);
    } else {
      throw new Error('Не удалось обновить профиль');
    }
  } catch (error: any) {
    console.error('❌ [ProfileEdit] Update profile error:', error);
    hapticFeedback.notification('error');
    await showAlert('❌ Не удалось обновить профиль. Попробуйте позже.');
  } finally {
    setIsLoading(false);
  }
};

  const handlePhotoUpload = async () => {
    hapticFeedback.impact('light');
    await showAlert(
      'Фото профиля синхронизируется с Telegram\n\n' +
      'Чтобы изменить фото:\n' +
      '1. Откройте настройки Telegram\n' +
      '2. Измените фото профиля\n' +
      '3. Перезапустите приложение\n\n' +
      'Фото обновится автоматически!'
    );
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Заголовок */}
        <div style={{
          padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.lg}px`,
          background: `linear-gradient(180deg, ${colors.primary}, ${colors.background})`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
          }}>
            <button
              onClick={() => navigate(-1)}
              disabled={isLoading}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <ArrowLeft size={24} color="#FFFFFF" weight="bold" />
            </button>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}>
              Редактирование профиля
            </h1>
          </div>
        </div>

        {/* Аватар */}
        <div style={{
          padding: `${spacing.lg}px`,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}99)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: `4px solid ${colors.surface}`,
            }}>
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UserIcon size={60} color="#FFFFFF" weight="fill" />
              )}
            </div>
            <button
              onClick={handlePhotoUpload}
              disabled={isLoading}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                background: colors.primary,
                border: `3px solid ${colors.background}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Camera size={18} color="#FFFFFF" weight="bold" />
            </button>
          </div>
        </div>

        {/* Форма */}
        <div style={{ padding: `0 ${spacing.lg}px` }}>
          <Card variant="glass">
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              {/* Имя */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Имя *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Введите имя"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: `${spacing.md}px`,
                    borderRadius: '12px',
                    border: `2px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                />
              </div>

              {/* Фамилия */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Фамилия
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Введите фамилию"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: `${spacing.md}px`,
                    borderRadius: '12px',
                    border: `2px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Введите username"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: `${spacing.md}px`,
                    borderRadius: '12px',
                    border: `2px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                />
              </div>

              {/* Информационное сообщение */}
              <div style={{
                padding: spacing.md,
                background: colors.info + '15',
                borderRadius: '8px',
                borderLeft: `4px solid ${colors.info}`,
              }}>
                <p style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  lineHeight: '18px',
                  margin: 0,
                }}>
                  💡 Telegram ID и язык определяются автоматически и не могут быть изменены
                </p>
              </div>
            </div>
          </Card>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
            marginTop: spacing.lg,
          }}>
            <Button
              title="Сохранить изменения"
              variant="primary"
              size="large"
              onClick={handleSave}
              loading={isLoading}
              disabled={!formData.first_name.trim() || isLoading}
              icon={<Check size={20} color="#FFFFFF" weight="bold" />}
              fullWidth
            />
            <Button
              title="Отмена"
              variant="secondary"
              size="large"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              fullWidth
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};