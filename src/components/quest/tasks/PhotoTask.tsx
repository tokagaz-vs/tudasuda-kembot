import React, { useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { QuestPoint } from '@/types';
import { supabase } from '@/services/supabase';
import { Camera, Image as ImageIcon, Check } from '@phosphor-icons/react';

interface PhotoTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any, photoUrl?: string) => void;
}

export const PhotoTask: React.FC<PhotoTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskData = point.task_data || {
    instruction: 'Сделайте фотографию места',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    setIsUploading(true);

    try {
      // Конвертируем base64 в blob
      const response = await fetch(photo);
      const blob = await response.blob();

      const fileName = `quest-photos/${point.id}/${Date.now()}.jpg`;

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

      onComplete(true, { photoUrl: urlData.publicUrl }, urlData.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Не удалось загрузить фото');
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
          }}
        >
          {taskData.instruction}
        </h3>

        {photo ? (
          <div
            style={{
              position: 'relative',
              marginBottom: `${spacing.md}px`,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
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
              height: '200px',
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
            }}
            onPress={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={48} color={colors.textLight} />
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
              Сделайте или выберите фото
            </p>
          </Card>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
          {photo ? (
            <>
              <Button
                title="Загрузить фото"
                variant="primary"
                onClick={uploadPhoto}
                disabled={isUploading}
                loading={isUploading}
                icon={<Check size={20} color="#FFFFFF" weight="bold" />}
                fullWidth
              />
              <Button
                title="Переснять"
                variant="glass"
                onClick={() => {
                  setPhoto(null);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                icon={<Camera size={20} color={colors.text} weight="bold" />}
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