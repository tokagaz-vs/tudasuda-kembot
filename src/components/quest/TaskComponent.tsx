import React, { useState } from 'react';
import type { QuestPoint, QuestTaskType } from '@/types';
import { Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { Camera, CheckCircle, X, MapPin, Question, PencilSimple } from '@phosphor-icons/react';

interface TaskComponentProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any, photoUrl?: string) => void;
}

export const TaskComponent: React.FC<TaskComponentProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  
  const [answer, setAnswer] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [photoData, setPhotoData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    hapticFeedback.impact('medium');
    setIsSubmitting(true);

    let finalAnswer: any = answer;
    
    const taskType: QuestTaskType = point.task_type;
    
    if (taskType === 'multiple_choice') {
      finalAnswer = selectedOptions;
    } else if (taskType === 'photo' || taskType === 'selfie') {
      finalAnswer = photoData ? 'photo_submitted' : '';
    } else if (taskType === 'location') {
      finalAnswer = 'location_confirmed';
    }

    await onComplete(true, finalAnswer, photoData || undefined);
    setIsSubmitting(false);
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleOption = (option: string) => {
    hapticFeedback.selection();
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const taskType: QuestTaskType = point.task_type;

  // Викторина или текстовый ввод
  if (taskType === 'quiz' || taskType === 'text' || taskType === 'text_input') {
    const icon = taskType === 'quiz' ? Question : PencilSimple;
    const title = taskType === 'quiz' ? '❓ Вопрос' : '✏️ Задание';
    
    return (
      <Card variant="glass">
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          color: colors.text, 
          marginBottom: spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          {React.createElement(icon, { size: 20, color: colors.primary, weight: 'fill' })}
          {title}
        </h3>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: spacing.lg }}>
          {point.task_data?.question || point.task_data?.description || 'Введите ответ'}
        </p>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Введите ответ..."
          style={{
            width: '100%',
            padding: `${spacing.md}px`,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.text,
            fontSize: '14px',
            marginBottom: spacing.md,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
          }}
        />
        <Button
          title="Отправить ответ"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!answer.trim()}
          fullWidth
        />
      </Card>
    );
  }

  // Множественный выбор
  if (taskType === 'multiple_choice') {
    const options = point.task_data?.options || [];
    
    return (
      <Card variant="glass">
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.text, marginBottom: spacing.md }}>
          ☑️ Выберите правильные ответы
        </h3>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: spacing.lg }}>
          {point.task_data?.question || 'Выберите один или несколько вариантов'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.lg }}>
          {options.map((option: string, index: number) => (
            <div
              key={index}
              onClick={() => toggleOption(option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                padding: spacing.md,
                borderRadius: '12px',
                border: `2px solid ${selectedOptions.includes(option) ? colors.primary : colors.border}`,
                background: selectedOptions.includes(option) ? colors.primary + '15' : colors.surface,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: `2px solid ${selectedOptions.includes(option) ? colors.primary : colors.border}`,
                  background: selectedOptions.includes(option) ? colors.primary : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selectedOptions.includes(option) && (
                  <CheckCircle size={12} color="#FFFFFF" weight="fill" />
                )}
              </div>
              <span style={{ fontSize: '14px', color: colors.text }}>
                {option}
              </span>
            </div>
          ))}
        </div>
        <Button
          title="Отправить ответ"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={selectedOptions.length === 0}
          fullWidth
        />
      </Card>
    );
  }

  // Фото или селфи задание
  if (taskType === 'photo' || taskType === 'selfie') {
    const isSelfie = taskType === 'selfie';
    
    return (
      <Card variant="glass">
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.text, marginBottom: spacing.md }}>
          {isSelfie ? '🤳 Селфи-задание' : '📷 Фото-задание'}
        </h3>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: spacing.lg }}>
          {point.task_data?.description || (isSelfie ? 'Сделайте селфи в указанном месте' : 'Сделайте фото в указанном месте')}
        </p>
        
        {photoData ? (
          <div style={{ position: 'relative', marginBottom: spacing.md }}>
            <img
              src={photoData}
              alt="Captured"
              style={{
                width: '100%',
                borderRadius: '12px',
                maxHeight: '300px',
                objectFit: 'cover',
              }}
            />
            <button
              onClick={() => setPhotoData('')}
              style={{
                position: 'absolute',
                top: spacing.sm,
                right: spacing.sm,
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#FFFFFF" />
            </button>
          </div>
        ) : (
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${spacing.xl}px`,
              borderRadius: '12px',
              border: `2px dashed ${colors.border}`,
              background: colors.surface,
              cursor: 'pointer',
              marginBottom: spacing.md,
            }}
          >
            <Camera size={48} color={colors.textLight} />
            <span style={{ fontSize: '14px', color: colors.textSecondary, marginTop: spacing.sm }}>
              Нажмите для загрузки фото
            </span>
            <input
              type="file"
              accept="image/*"
              capture={isSelfie ? "user" : "environment"}
              onChange={handlePhotoCapture}
              style={{ display: 'none' }}
            />
          </label>
        )}
        
        <Button
          title={photoData ? "Отправить фото" : "Сделать фото"}
          onClick={photoData ? handleSubmit : () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          loading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        />
      </Card>
    );
  }

  // Локационное задание
  if (taskType === 'location') {
    return (
      <Card variant="glass">
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          color: colors.text, 
          marginBottom: spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          <MapPin size={20} color={colors.success} weight="fill" />
          Вы на месте!
        </h3>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: spacing.lg }}>
          {point.task_data?.description || 'Отметьтесь в этой точке'}
        </p>
        <Button
          title="Отметиться"
          onClick={handleSubmit}
          loading={isSubmitting}
          fullWidth
          variant="primary"
        />
      </Card>
    );
  }

  // Если тип задания не распознан
  return (
    <Card variant="glass">
      <p style={{ fontSize: '14px', color: colors.textSecondary }}>
        Неизвестный тип задания: {point.task_type}
      </p>
    </Card>
  );
};