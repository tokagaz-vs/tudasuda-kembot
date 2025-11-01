import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Input, Skeleton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { questService } from '@/services/quest.service';
import { Quest, QuestDifficulty } from '@/types';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '@/constants';
import { useNavigate } from 'react-router-dom';

export const QuestsPage: React.FC = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestDifficulty | null>(null);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    setIsLoading(true);
    const data = await questService.getActiveQuests(100, 0);
    setQuests(data);
    setIsLoading(false);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    quests.forEach((q) => q.category && set.add(q.category));
    return Array.from(set);
  }, [quests]);

  const filteredQuests = useMemo(() => {
    let list = quests;

    if (selectedCategory) {
      list = list.filter((q) => q.category === selectedCategory);
    }
    if (selectedDifficulty) {
      list = list.filter((q) => q.difficulty === selectedDifficulty);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.short_description || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [quests, selectedCategory, selectedDifficulty, searchQuery]);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  }, []);

  const CategoryChip: React.FC<{
    id: string;
    active: boolean;
    onClick: () => void;
  }> = ({ id, active, onClick }) => {
    const cfg = CATEGORY_CONFIG[id as keyof typeof CATEGORY_CONFIG];
    const color = cfg?.color || colors.primary;
    return (
      <button
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${spacing.xs}px`,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: '999px',
          border: `2px solid ${active ? color : colors.border}`,
          background: active ? color : colors.background,
          color: active ? '#FFFFFF' : colors.text,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        <span>{cfg?.icon || '🎯'}</span>
        <span style={{ whiteSpace: 'nowrap' }}>{cfg ? t(`quests.categories.${id}`) : id}</span>
      </button>
    );
  };

  const DifficultyChip: React.FC<{
    id: QuestDifficulty;
    active: boolean;
    onClick: () => void;
  }> = ({ id, active, onClick }) => {
    const cfg = DIFFICULTY_CONFIG[id];
    const color = cfg.color;
    return (
      <button
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${spacing.xs}px`,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: '999px',
          border: `2px solid ${active ? color : colors.border}`,
          background: active ? color : colors.background,
          color: active ? '#FFFFFF' : colors.text,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        <span>{cfg.emoji}</span>
        <span style={{ whiteSpace: 'nowrap' }}>{t(`quests.difficulties.${id}`)}</span>
      </button>
    );
  };

  const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
    const catCfg = CATEGORY_CONFIG[quest.category as keyof typeof CATEGORY_CONFIG];
    const accentColor = catCfg?.color || colors.primary;

    return (
      <Card
        hover
        onClick={() => navigate(`/quests/${quest.id}`)}
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '4px',
            background: accentColor,
          }}
        />

        <div style={{ display: 'flex', gap: `${spacing.md}px` }}>
          {/* Icon block */}
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
            {catCfg?.icon || '🎯'}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${spacing.sm}px`,
                marginBottom: `${spacing.xs}px`,
              }}
            >
              <h3
                style={{
                  ...typography.h4,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}
              >
                {quest.title}
              </h3>
              {quest.is_featured && <span>⭐</span>}
            </div>

            {quest.description && (
              <p
                style={{
                  ...typography.sub,
                  color: colors.textSecondary,
                  margin: `0 0 ${spacing.sm}px 0`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {quest.description}
              </p>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, marginBottom: `${spacing.sm}px`, flexWrap: 'wrap' }}>
              {/* Category badge */}
              {quest.category && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: `${spacing.xs}px`,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: colors.surfaceAlt,
                    color: catCfg?.color || colors.textSecondary,
                    padding: `${spacing.xs}px ${spacing.sm}px`,
                    borderRadius: borderRadius.sm,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: catCfg?.color || colors.primary,
                    }}
                  />
                  {t(`quests.categories.${quest.category}`)}
                </span>
              )}

              {/* Difficulty badge */}
              {quest.difficulty && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: `${spacing.xs}px`,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: DIFFICULTY_CONFIG[quest.difficulty].color,
                    color: '#FFFFFF',
                    padding: `${spacing.xs}px ${spacing.sm}px`,
                    borderRadius: borderRadius.sm,
                  }}
                >
                  {DIFFICULTY_CONFIG[quest.difficulty].emoji}{' '}
                  {t(`quests.difficulties.${quest.difficulty}`)}
                </span>
              )}
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
    );
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) + (selectedDifficulty ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  return (
    <Layout>
      <div style={{ padding: `${spacing.lg}px` }}>
        {/* Header */}
        <h1 style={{ ...typography.h1, marginBottom: `${spacing.md}px` }}>
          {t('quests.title')} 🎯
        </h1>

        {/* Search & Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: `${spacing.sm}px`,
            alignItems: 'center',
            marginBottom: `${spacing.md}px`,
          }}
        >
          <Input
            placeholder="Поиск квестов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Button
            variant={activeFiltersCount > 0 ? 'primary' : 'outline'}
            onClick={() => {
              if (activeFiltersCount > 0) {
                clearFilters();
              }
            }}
          >
            {activeFiltersCount > 0 ? `Сбросить (${activeFiltersCount})` : 'Фильтры'}
          </Button>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div style={{ marginBottom: `${spacing.sm}px` }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: `${spacing.sm}px` }}>
              Категория
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing.sm}px` }}>
              <CategoryChip
                id="all"
                active={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              />
              {categories.map((id) => (
                <CategoryChip
                  key={id}
                  id={id}
                  active={selectedCategory === id}
                  onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Difficulty filters */}
        <div style={{ marginBottom: `${spacing.lg}px` }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: `${spacing.sm}px` }}>
            Сложность
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing.sm}px` }}>
            <DifficultyChip
              id="easy"
              active={selectedDifficulty === 'easy'}
              onClick={() =>
                setSelectedDifficulty(selectedDifficulty === 'easy' ? null : 'easy')
              }
            />
            <DifficultyChip
              id="medium"
              active={selectedDifficulty === 'medium'}
              onClick={() =>
                setSelectedDifficulty(selectedDifficulty === 'medium' ? null : 'medium')
              }
            />
            <DifficultyChip
              id="hard"
              active={selectedDifficulty === 'hard'}
              onClick={() =>
                setSelectedDifficulty(selectedDifficulty === 'hard' ? null : 'hard')
              }
            />
            <DifficultyChip
              id="expert"
              active={selectedDifficulty === 'expert'}
              onClick={() =>
                setSelectedDifficulty(selectedDifficulty === 'expert' ? null : 'expert')
              }
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="140px" />
            ))}
          </div>
        ) : filteredQuests.length === 0 ? (
          <Card padding="lg">
            <div style={{ textAlign: 'center', padding: `${spacing.xl}px` }}>
              <p style={{ fontSize: '48px', marginBottom: `${spacing.md}px` }}>🔍</p>
              <p style={{ color: colors.textSecondary }}>
                {t('common.noData')}
              </p>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px`, marginBottom: `${spacing.xxl}px` }}>
            {filteredQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};