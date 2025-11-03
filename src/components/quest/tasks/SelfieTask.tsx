import React, { useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import type { QuestPoint } from '@/types';
import { Camera, User, X, Check } from '@phosphor-icons/react';

interface SelfieTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any, photoUrl?: string) => void;
}

export const SelfieTask: React.FC<SelfieTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const [selfie, setSelfie] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskData = point.task_data || {
    description: 'Сделайте селфи на фоне достопримечательности',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    hapticFeedback.impact('light');

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelfie(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selfie) return;

    hapticFeedback.impact('medium');
    setIsSubmitting(true);

    setTimeout(() => {
      onComplete(true, { selfieUrl: selfie }, selfie);
      setIsSubmitting(false);
    }, 500);
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
          textAlign: 'center',
        }}>
          🤳 Селфи-задание
        </h3>

        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: spacing.lg,
          lineHeight: '20px',
          textAlign: 'center',
        }}>
          {taskData.description || taskData.instruction || 'Сделайте селфи на фоне достопримечательности'}
        </p>

        {selfie ? (
          <div style={{
            position: 'relative',
            marginBottom: spacing.md,
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <img
              src={selfie}
              alt="Selfie"
              style={{
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />
            {!isSubmitting && (
              <>
                <button
                  onClick={() => {
                    hapticFeedback.impact('light');
                    setSelfie('');
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
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: `${spacing.xs}px ${spacing.md}px`,
                  borderRadius: '999px',
                  background: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}>
                  <Check size={16} color="#FFFFFF" weight="bold" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                    Отличное селфи!
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
              minHeight: '280px',
            }}
          >
            <User size={64} color={colors.textLight} weight="light" />
            <span style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginTop: spacing.md,
              textAlign: 'center',
              lineHeight: '20px',
            }}>
              Сделайте селфи на фоне<br />достопримечательности
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {selfie ? (
            <>
              <Button
                title="Отправить селфи"
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                fullWidth
              />
              <Button
                title="Переснять"
                variant="secondary"
                onClick={() => {
                  setSelfie('');
                  fileInputRef.current?.click();
                }}
                disabled={isSubmitting}
                fullWidth
              />
            </>
          ) : (
            <Button
              title="Сделать селфи"
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