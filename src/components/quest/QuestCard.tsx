import React from 'react';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Quest } from '@/types';
import { Star, ArrowRight } from '@phosphor-icons/react';

interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onPress }) => {
  const { colors, spacing } = useTheme();

  return (
    <Card variant="glass" onPress={onPress}>
      <div style={{ display: 'flex', gap: `${spacing.md}px` }}>
        {quest.image_url && (
          <img
            src={quest.image_url}
            alt={quest.title}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: colors.text,
              marginBottom: `${spacing.xs}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {quest.title}
          </h4>
          {quest.description && (
            <p
              style={{
                fontSize: '14px',
                color: colors.textSecondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {quest.description}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: `${spacing.sm}px`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color={colors.warning} weight="fill" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textSecondary }}>
                {quest.reward_points || quest.points_reward || 0}
              </span>
            </div>
            <ArrowRight size={20} color={colors.textLight} />
          </div>
        </div>
      </div>
    </Card>
  );
};