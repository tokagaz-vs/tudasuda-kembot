import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import type { QuestPoint } from '@/types';
import { CheckCircle, Circle } from '@phosphor-icons/react';

interface MultipleChoiceTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const MultipleChoiceTask: React.FC<MultipleChoiceTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskData = point.task_data || {
    question: 'Вопрос не указан',
    options: ['Вариант 1', 'Вариант 2', 'Вариант 3'],
  };

  // ✅ Безопасная проверка options
  const options = taskData.options || [];

  const toggleOption = (option: string) => {
    hapticFeedback.selection();
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    hapticFeedback.impact('medium');
    setIsSubmitting(true);

    setTimeout(() => {
      onComplete(true, selectedOptions);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div style={{ padding: `0 ${spacing.lg}px` }}>
      <Card variant="glass">
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: colors.text,
          marginBottom: spacing.lg,
          letterSpacing: '-0.3px',
        }}>
          {taskData.question}
        </h3>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: spacing.md, 
          marginBottom: spacing.lg 
        }}>
          {options.map((option: string, index: number) => {
            const isSelected = selectedOptions.includes(option);

            return (
              <div
                key={index}
                onClick={() => !isSubmitting && toggleOption(option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                  background: isSelected ? colors.primary + '15' : colors.surface,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSelected ? (
                  <CheckCircle size={24} color={colors.primary} weight="fill" />
                ) : (
                  <Circle size={24} color={colors.border} weight="regular" />
                )}
                <span style={{
                  flex: 1,
                  fontSize: '15px',
                  lineHeight: '22px',
                  color: isSelected ? colors.text : colors.textSecondary,
                  fontWeight: isSelected ? 600 : 400,
                }}>
                  {option}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          title="Подтвердить ответ"
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || isSubmitting}
          loading={isSubmitting}
          fullWidth
        />
      </Card>
    </div>
  );
};