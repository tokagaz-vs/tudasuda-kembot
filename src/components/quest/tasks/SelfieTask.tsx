import React, { useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { QuestPoint } from '@/types';
import { supabase } from '@/services/supabase';
import { Camera, User, Check } from '@phosphor-icons/react';

interface SelfieTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any, photoUrl?: string) => void;
}

export const SelfieTask: React.FC<SelfieTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskData = point.task_data || {
    instruction: 'Сделайте селфи на фоне достопримечательности',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelfie(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadSelfie = async () => {
    if (!selfie) return;

    setIsUploading(true);

    try {
      const response = await fetch(selfie);
      const blob = await response.blob();

      const fileName = `selfies/${point.id}/${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('quest-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('quest-photos')
        .getPublicUrl(fileName);

      onComplete(true, { selfieUrl: urlData.publicUrl }, urlData.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Не удалось загрузить селфи');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        opacity: 0,
        animation: 'fadeInUp 0.5s ease forwards',
      }}
    >
      <Card variant="glass">
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: colors.text,
            marginBottom: `${spacing.lg}px`,
            letterSpacing: '-0.3px',
            textAlign: 'center',
          }}
        >
          {taskData.instruction}
        </h3>

        {selfie ? (
          <div
            style={{
              position: 'relative',
              marginBottom: `${spacing.md}px`,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
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
            {isUploading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${spacing.md}px`,
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #FFFFFF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  Загрузка...
                </span>
              </div>
            )}
            {!isUploading && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '18px',
                  background: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={20} color="#FFFFFF" weight="bold" />
              </div>
            )}
          </div>
        ) : (
          <Card
            variant="outlined"
            style={{
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: '2px',
              borderStyle: 'dashed',
              borderColor: colors.border,
              gap: `${spacing.md}px`,
              marginBottom: `${spacing.md}px`,
              cursor: 'pointer',
              padding: `${spacing.lg}px`,
            }}
            onPress={() => fileInputRef.current?.click()}
          >
            <User size={64} color={colors.textLight} weight="light" />
            <p
              style={{
                fontSize: '14px',
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: '20px',
                margin: 0,
              }}
            >
              Сделайте селфи на фоне
              <br />
              достопримечательности
            </p>
          </Card>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
          {selfie ? (
            <>
              <Button
                title="Загрузить селфи"
                variant="primary"
                onClick={uploadSelfie}
                disabled={isUploading}
                loading={isUploading}
                icon={<Check size={20} color="#FFFFFF" weight="bold" />}
                fullWidth
              />
              <Button
                title="Переснять"
                variant="glass"
                onClick={() => {
                  setSelfie(null);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                icon={<Camera size={20} color={colors.text} weight="bold" />}
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

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};