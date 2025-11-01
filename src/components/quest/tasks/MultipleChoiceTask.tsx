import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { QuestPoint } from '@/types';
import { CheckCircle, Check } from '@phosphor-icons/react';

interface MultipleChoiceTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const MultipleChoiceTask: React.FC<MultipleChoiceTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskData = point.task_data || {
    question: 'Вопрос не указан',
    options: ['Вариант 1', 'Вариант 2', 'Вариант 3'],
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);
    const selectedAnswer = taskData.options[selectedOption];
    const isCorrect = selectedAnswer === point.correct_answer;

    setTimeout(() => {
      onComplete(isCorrect, selectedAnswer);
      setIsSubmitting(false);
    }, 500);
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
          {taskData.question}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px`, marginBottom: `${spacing.lg}px` }}>
          {taskData.options.map((option: string, index: number) => {
            const isSelected = selectedOption === index;

            return (
              <div
                key={index}
                onClick={() => setSelectedOption(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${spacing.md}px`,
                  padding: `${spacing.md}px`,
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                  background: isSelected ? colors.primary + '15' : colors.surface,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSelected ? (
                  <CheckCircle size={24} color={colors.primary} weight="fill" />
                ) : (
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      border: `2px solid ${colors.textLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                )}
                <span
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    lineHeight: '22px',
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {option}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          title="Подтвердить"
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          loading={isSubmitting}
          icon={<Check size={20} color="#FFFFFF" weight="bold" />}
          fullWidth
        />
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
        `}
      </style>
    </div>
  );
};