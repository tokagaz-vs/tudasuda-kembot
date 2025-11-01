import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { questService } from '@/services/quest.service';
import { Quest, QuestCategory, QuestDifficulty, QuestFilters } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { 
  MagnifyingGlass, 
  Faders, 
  X, 
  Target, 
  Star, 
  Lightning, 
  ArrowRight,
  MapPin,
  Clock,
} from '@phosphor-icons/react';

const DIFFICULTY_LEVELS = {
  easy: { label: 'Легко', color: '#10B981' },
  medium: { label: 'Средне', color: '#F59E0B' },
  hard: { label: 'Сложно', color: '#EF4444' },
};

export const QuestsPage: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const navigate = useNavigate();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [categories, setCategories] = useState<QuestCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<QuestFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadQuests();
  }, [filters]);

  const loadData = async () => {
    await Promise.all([loadCategories(), loadQuests()]);
    setIsLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await questService.getCategories();
    if (data) setCategories(data);
  };

  const loadQuests = async () => {
    const { data } = await questService.getQuests(filters);
    if (data) setQuests(data);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  const toggleCategory = (categoryId: string) => {
    hapticFeedback.impact('light');
    setFilters({
      ...filters,
      category_id: filters.category_id === categoryId ? undefined : categoryId,
    });
  };

  const toggleDifficulty = (difficulty: QuestDifficulty) => {
    hapticFeedback.impact('light');
    setFilters({
      ...filters,
      difficulty: filters.difficulty === difficulty ? undefined : difficulty,
    });
  };

  const clearFilters = () => {
    hapticFeedback.impact('medium');
    setFilters({});
    setSearchQuery('');
  };

  const activeFiltersCount = (filters.category_id ? 1 : 0) + (filters.difficulty ? 1 : 0);

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Поиск */}
        <div
          style={{
            padding: `${spacing.lg}px`,
            display: 'flex',
            gap: `${spacing.md}px`,
            position: 'sticky',
            top: 0,
            background: colors.background,
            zIndex: 10,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing.md}px`,
              padding: `${spacing.md}px`,
              background: colors.surface,
              borderRadius: '12px',
            }}
          >
            <MagnifyingGlass size={20} color={colors.textSecondary} />
            <input
              type="text"
              placeholder="Поиск квестов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: colors.text,
                fontSize: '15px',
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <X
                size={20}
                color={colors.textSecondary}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ ...filters, search: undefined });
                }}
              />
            )}
          </div>

          <div
            onClick={() => {
              hapticFeedback.impact('light');
              setShowFilters(!showFilters);
            }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: showFilters ? colors.primary : colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Faders
              size={20}
              color={showFilters ? '#FFFFFF' : colors.text}
              weight="bold"
            />
            {activeFiltersCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  background: colors.error,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {activeFiltersCount}
              </div>
            )}
          </div>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div
            style={{
              padding: `${spacing.lg}px`,
              background: colors.surface,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            {/* Категории */}
            {categories.length > 0 && (
              <div style={{ marginBottom: `${spacing.md}px` }}>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: colors.textSecondary,
                    display: 'block',
                    marginBottom: `${spacing.sm}px`,
                  }}
                >
                  Категория
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: `${spacing.sm}px`,
                  }}
                >
                  {categories.map((category) => {
                    const isActive = filters.category_id === category.id;
                    return (
                      <div
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        style={{
                          padding: `${spacing.sm}px ${spacing.md}px`,
                          borderRadius: '999px',
                          border: `2px solid ${isActive ? category.color || colors.primary : colors.border}`,
                          background: isActive ? category.color || colors.primary : colors.background,
                          color: isActive ? '#FFFFFF' : colors.text,
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {category.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Сложность */}
            <div style={{ marginBottom: `${spacing.md}px` }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: colors.textSecondary,
                  display: 'block',
                  marginBottom: `${spacing.sm}px`,
                }}
              >
                Сложность
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing.sm}px` }}>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => {
                  const isActive = filters.difficulty === key;
                  return (
                    <div
                      key={key}
                      onClick={() => toggleDifficulty(key as QuestDifficulty)}
                      style={{
                        padding: `${spacing.sm}px ${spacing.md}px`,
                        borderRadius: '999px',
                        border: `2px solid ${isActive ? config.color : colors.border}`,
                        background: isActive ? config.color : colors.background,
                        color: isActive ? '#FFFFFF' : colors.text,
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {config.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Сброс */}
            {activeFiltersCount > 0 && (
              <div style={{ textAlign: 'center' }}>
                <span
                  onClick={clearFilters}
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.error,
                    cursor: 'pointer',
                    padding: `${spacing.sm}px 0`,
                    display: 'inline-block',
                  }}
                >
                  Сбросить фильтры
                </span>
              </div>
            )}
          </div>
        )}

        {/* Список квестов */}
        <div style={{ padding: `${spacing.lg}px` }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: `${spacing.xxl}px 0` }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: `3px solid ${colors.surfaceAlt}`,
                  borderTopColor: colors.primary,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto',
                }}
              />
            </div>
          ) : quests.length > 0 ? (
            quests.map((quest, index) => (
              <div
                key={quest.id}
                style={{
                  marginBottom: `${spacing.md}px`,
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                }}
              >
                <Card
                  variant="glass"
                  onPress={() => {
                    hapticFeedback.impact('light');
                    navigate(`${ROUTES.quests}/${quest.id}`);
                  }}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Цветной акцент */}
                  <div
                    style={{
                      height: '4px',
                      background: quest.category?.color || colors.primary,
                      marginBottom: `${spacing.md}px`,
                    }}
                  />

                  <div style={{ padding: `0 ${spacing.md}px ${spacing.md}px` }}>
                    {/* Заголовок */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: `${spacing.sm}px`,
                      }}
                    >
                      <h3
                        style={{
                          flex: 1,
                          fontSize: '18px',
                          fontWeight: 700,
                          color: colors.text,
                          letterSpacing: '-0.3px',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {quest.title}
                      </h3>
                      <ArrowRight size={20} color={colors.textLight} />
                    </div>

                    {/* Описание */}
                    {quest.description && (
                      <p
                        style={{
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: colors.textSecondary,
                          marginBottom: `${spacing.md}px`,
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

                    {/* Мета */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${spacing.sm}px`,
                        flexWrap: 'wrap',
                      }}
                    >
                      {quest.category && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '3px',
                              background: quest.category.color || colors.primary,
                            }}
                          />
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: quest.category.color || colors.primary,
                            }}
                          >
                            {quest.category.name}
                          </span>
                        </div>
                      )}

                      {quest.difficulty && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lightning
                            size={12}
                            color={DIFFICULTY_LEVELS[quest.difficulty].color}
                            weight="fill"
                          />
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: DIFFICULTY_LEVELS[quest.difficulty].color,
                            }}
                          >
                            {DIFFICULTY_LEVELS[quest.difficulty].label}
                          </span>
                        </div>
                      )}

                      <div style={{ flex: 1 }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} color={colors.warning} weight="fill" />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textSecondary,
                          }}
                        >
                          {quest.points_reward || 0}
                        </span>
                      </div>
                    </div>

                    {/* Дополнительно */}
                    {(quest.estimated_duration || quest.total_distance) && (
                      <div
                        style={{
                          display: 'flex',
                          gap: `${spacing.md}px`,
                          marginTop: `${spacing.sm}px`,
                        }}
                      >
                        {quest.estimated_duration && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} color={colors.textSecondary} />
                            <span
                              style={{
                                fontSize: '12px',
                                color: colors.textSecondary,
                              }}
                            >
                              {quest.estimated_duration}м
                            </span>
                          </div>
                        )}
                        {quest.total_distance && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color={colors.textSecondary} />
                            <span
                              style={{
                                fontSize: '12px',
                                color: colors.textSecondary,
                              }}
                            >
                              {(quest.total_distance / 1000).toFixed(1)}км
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: `${spacing.xxl}px` }}>
              <Target size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginTop: `${spacing.lg}px`,
                  marginBottom: `${spacing.xs}px`,
                }}
              >
                Квесты не найдены
              </p>
              <p style={{ fontSize: '14px', color: colors.textLight }}>
                Попробуйте изменить фильтры
              </p>
            </div>
          )}
        </div>
      </div>

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
    </Layout>
  );
};