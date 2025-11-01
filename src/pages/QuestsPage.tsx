import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Skeleton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { questService } from '@/services/quest.service';
import { Quest, QuestDifficulty } from '@/types';
import { DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '@/constants';

export const QuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'featured'>('all');

  const loadQuests = useCallback(async () => {
    setIsLoading(true);
    if (filter === 'featured') {
      const data = await questService.getFeaturedQuests();
      setQuests(data);
    } else {
      const data = await questService.getActiveQuests();
      setQuests(data);
    }
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const getDifficultyColor = (difficulty: QuestDifficulty) => {
    return DIFFICULTY_CONFIG[difficulty].color;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.icon || '🎯';
  };

  const getDifficultyLabel = (difficulty: QuestDifficulty) => {
    const labels: Record<QuestDifficulty, string> = {
      easy: t('quests.difficulties.easy'),
      medium: t('quests.difficulties.medium'),
      hard: t('quests.difficulties.hard'),
      expert: t('quests.difficulties.expert'),
    };
    return labels[difficulty];
  };

  const getCategoryLabel = (category: string) => {
    const validCategories = ['exploration', 'photo', 'challenge', 'social', 'educational'] as const;
    type ValidCategory = typeof validCategories[number];
    
    if (validCategories.includes(category as ValidCategory)) {
      const labels: Record<ValidCategory, string> = {
        exploration: t('quests.categories.exploration'),
        photo: t('quests.categories.photo'),
        challenge: t('quests.categories.challenge'),
        social: t('quests.categories.social'),
        educational: t('quests.categories.educational'),
      };
      return labels[category as ValidCategory];
    }
    return category;
  };

  return (
    <Layout>
      <div style={{ padding: `${spacing.lg}px` }}>
        {/* Header */}
        <h1 style={{ ...typography.h1, marginBottom: `${spacing.md}px` }}>
          {t('quests.title')} 🎯
        </h1>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: `${spacing.sm}px`,
            marginBottom: `${spacing.lg}px`,
            overflowX: 'auto',
          }}
        >
          {(['all', 'available', 'featured'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'primary' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? t('quests.available') : f === 'available' ? t('quests.available') : 'Featured'}
            </Button>
          ))}
        </div>

        {/* Quests List */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="140px" />
            ))}
          </div>
        ) : quests.length === 0 ? (
          <Card padding="lg">
            <div style={{ textAlign: 'center', padding: `${spacing.xl}px` }}>
              <p style={{ fontSize: '48px', marginBottom: `${spacing.md}px` }}>🔍</p>
              <p style={{ color: colors.textSecondary }}>{t('common.noData')}</p>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
            {quests.map((quest) => (
              <Card
                key={quest.id}
                hover
                onClick={() => navigate(`/quests/${quest.id}`)}
              >
                <div style={{ display: 'flex', gap: `${spacing.md}px` }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: borderRadius.md,
                      background: colors.surfaceAlt,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                      flexShrink: 0,
                    }}
                  >
                    {getCategoryIcon(quest.category)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${spacing.sm}px`,
                        marginBottom: `${spacing.xs}px`,
                      }}
                    >
                      <h3 style={{ ...typography.h4 }}>{quest.title}</h3>
                      {quest.is_featured && <span>⭐</span>}
                    </div>

                    <p
                      style={{
                        ...typography.sub,
                        color: colors.textSecondary,
                        marginBottom: `${spacing.sm}px`,
                      }}
                    >
                      {quest.short_description}
                    </p>

                    {/* Tags */}
                    <div
                      style={{
                        display: 'flex',
                        gap: `${spacing.sm}px`,
                        flexWrap: 'wrap',
                        marginBottom: `${spacing.sm}px`,
                      }}
                    >
                      <span
                        style={{
                          padding: `${spacing.xs}px ${spacing.sm}px`,
                          borderRadius: borderRadius.sm,
                          fontSize: '11px',
                          fontWeight: 600,
                          background: getDifficultyColor(quest.difficulty),
                          color: '#FFFFFF',
                        }}
                      >
                        {DIFFICULTY_CONFIG[quest.difficulty].emoji}{' '}
                        {getDifficultyLabel(quest.difficulty)}
                      </span>
                      <span
                        style={{
                          padding: `${spacing.xs}px ${spacing.sm}px`,
                          borderRadius: borderRadius.sm,
                          fontSize: '11px',
                          background: colors.surfaceAlt,
                          color: colors.textSecondary,
                        }}
                      >
                        {getCategoryLabel(quest.category)}
                      </span>
                    </div>

                    {/* Rewards */}
                    <div
                      style={{
                        display: 'flex',
                        gap: `${spacing.md}px`,
                        fontSize: '12px',
                        color: colors.textTertiary,
                      }}
                    >
                      <span>🏆 {quest.reward_points}</span>
                      <span>💰 {quest.reward_coins}</span>
                      <span>⭐ {quest.reward_experience} XP</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};