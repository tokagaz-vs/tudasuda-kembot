import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { QuestPoint } from '@/types';
import { PencilSimple, Lightbulb, Check } from '@phosphor-icons/react';

interface TextInputTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const TextInputTask: React.FC<TextInputTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskData = point.task_data || {
    question: 'Введите ответ',
    hint: '',
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswer = (point.correct_answer || '').toLowerCase();
    const isCorrect = normalizedAnswer === correctAnswer;

    setTimeout(() => {
      onComplete(isCorrect, answer);
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
            marginBottom: `${spacing.md}px`,
            letterSpacing: '-0.3px',
          }}
        >
          {taskData.question}
        </h3>

        {taskData.hint && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing.md}px`,
              padding: `${spacing.md}px`,
              borderRadius: '12px',
              background: colors.warning + '15',
              marginBottom: `${spacing.lg}px`,
            }}
          >
            <Lightbulb size={20} color={colors.warning} weight="fill" />
            <p
              style={{
                flex: 1,
                fontSize: '14px',
                lineHeight: '20px',
                color: colors.text,
                margin: 0,
              }}
            >
              {taskData.hint}
            </p>
          </div>
        )}

        <Input
          placeholder="Введите ваш ответ"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          leftIcon={<PencilSimple size={20} color={colors.textSecondary} />}
          containerStyle={{ marginBottom: `${spacing.md}px` }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && answer.trim() && !isSubmitting) {
              handleSubmit();
            }
          }}
        />

        <Button
          title="Ответить"
          variant="primary"
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
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