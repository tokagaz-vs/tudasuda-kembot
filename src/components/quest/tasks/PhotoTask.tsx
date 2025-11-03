import React, { useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { storageService } from '@/services/storage.service';
import type { QuestPoint } from '@/types';
import { Camera, X, Check, Upload } from '@phosphor-icons/react';

interface PhotoTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any, photoUrl?: string) => void;
}

export const PhotoTask: React.FC<PhotoTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback, showAlert } = useTelegram();
  const { user } = useAuthStore();
  const [photo, setPhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskData = point.task_data || {
    description: 'Сделайте фотографию места',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Размер файла не должен превышать 5MB');
      return;
    }

    hapticFeedback.impact('light');

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!photo || !user) return;

    hapticFeedback.impact('medium');
    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Загружаем фото в Supabase Storage
      setUploadProgress(30);
      const { data: photoUrl, error } = await storageService.uploadPhotoFromBase64(
        user.id,
        point.quest_id,
        point.id,
        photo,
        'photo'
      );

      setUploadProgress(70);

      if (error || !photoUrl) {
        throw new Error('Не удалось загрузить фото');
      }

      setUploadProgress(100);

      // Отправляем результат
      setTimeout(() => {
        onComplete(true, { photoUrl }, photoUrl);
        setIsSubmitting(false);
        setUploadProgress(0);
      }, 300);

    } catch (error: any) {
      console.error('Photo upload error:', error);
      await showAlert('Не удалось загрузить фото. Попробуйте еще раз.');
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div style={{ padding: `0 ${spacing.lg}px` }}>
      <Card variant="glass">
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: colors.text,
          marginBottom: spacing.md,
          letterSpacing: '-0.3px',
        }}>
          📷 Фото-задание
        </h3>

        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: spacing.lg,
          lineHeight: '20px',
        }}>
          {taskData.description || taskData.instruction || 'Сделайте фото в указанном месте'}
        </p>

        {photo ? (
          <div style={{
            position: 'relative',
            marginBottom: spacing.md,
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <img
              src={photo}
              alt="Quest photo"
              style={{
                width: '100%',
                height: '240px',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />

            {/* Прогресс загрузки */}
            {isSubmitting && uploadProgress > 0 && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: colors.success,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            )}

            {!isSubmitting && (
              <>
                <button
                  onClick={() => {
                    hapticFeedback.impact('light');
                    setPhoto('');
                  }}
                  style={{
                    position: 'absolute',
                    top: spacing.sm,
                    right: spacing.sm,
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} color="#FFFFFF" weight="bold" />
                </button>
                <div style={{
                  position: 'absolute',
                  bottom: spacing.sm,
                  right: spacing.sm,
                  padding: `${spacing.xs}px ${spacing.md}px`,
                  borderRadius: '999px',
                  background: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}>
                  <Check size={16} color="#FFFFFF" weight="bold" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                    Готово
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${spacing.xxl}px`,
              borderRadius: '16px',
              border: `2px dashed ${colors.border}`,
              background: colors.surface,
              cursor: 'pointer',
              marginBottom: spacing.md,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.background = colors.primary + '05';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.surface;
            }}
          >
            <Camera size={48} color={colors.textLight} weight="regular" />
            <span style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginTop: spacing.md,
              textAlign: 'center',
            }}>
              Нажмите для загрузки фото
            </span>
            <span style={{
              fontSize: '12px',
              color: colors.textLight,
              marginTop: spacing.xs,
            }}>
              Максимум 5MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {photo ? (
            <>
              <Button
                title={isSubmitting ? `Загрузка... ${uploadProgress}%` : "Отправить фото"}
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                icon={isSubmitting ? <Upload size={20} color="#FFFFFF" weight="bold" /> : undefined}
                fullWidth
              />
              <Button
                title="Переснять"
                variant="secondary"
                onClick={() => {
                  setPhoto('');
                  fileInputRef.current?.click();
                }}
                disabled={isSubmitting}
                fullWidth
              />
            </>
          ) : (
            <Button
              title="Сделать фото"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              icon={<Camera size={20} color="#FFFFFF" weight="bold" />}
              fullWidth
            />
          )}
        </div>
      </Card>
    </div>
  );
};