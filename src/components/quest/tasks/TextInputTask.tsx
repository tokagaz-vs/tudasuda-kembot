import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import type { QuestPoint } from '@/types';
import { PencilSimple, Lightbulb } from '@phosphor-icons/react';

interface TextInputTaskProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const TextInputTask: React.FC<TextInputTaskProps> = ({ point, onComplete }) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskData = point.task_data || {
    question: 'Введите ответ',
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    hapticFeedback.impact('medium');
    setIsSubmitting(true);

    setTimeout(() => {
      onComplete(true, answer.trim());
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
          marginBottom: spacing.md,
          letterSpacing: '-0.3px',
        }}>
          {taskData.question || taskData.description}
        </h3>

        {point.hint && (
          <div style={{ marginBottom: spacing.lg }}>
            {showHint ? (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: spacing.md,
                padding: spacing.md,
                borderRadius: '12px',
                background: colors.warning + '15',
                borderLeft: `4px solid ${colors.warning}`,
              }}>
                <Lightbulb size={20} color={colors.warning} weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: colors.text,
                    margin: 0,
                  }}>
                    <strong>Подсказка:</strong> {point.hint}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  hapticFeedback.impact('light');
                  setShowHint(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  borderRadius: '8px',
                  border: `2px dashed ${colors.warning}`,
                  background: colors.warning + '10',
                  color: colors.warning,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Lightbulb size={18} weight="fill" />
                Показать подсказку
              </button>
            )}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: spacing.md,
          marginBottom: spacing.md,
          padding: spacing.md,
          borderRadius: '12px',
          border: `2px solid ${colors.border}`,
          background: colors.surface,
        }}>
          <PencilSimple size={20} color={colors.textSecondary} />
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ваш ответ..."
            disabled={isSubmitting}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: colors.text,
              fontSize: '15px',
              fontFamily: 'inherit',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && answer.trim() && !isSubmitting) {
                handleSubmit();
              }
            }}
          />
        </div>

        <Button
          title="Отправить ответ"
          variant="primary"
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
          loading={isSubmitting}
          fullWidth
        />
      </Card>
    </div>
  );
};