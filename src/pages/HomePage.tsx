import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Skeleton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { questService } from '@/services/quest.service';
import { Quest } from '@/types';
import { ROUTES, CATEGORY_CONFIG } from '@/constants';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing, typography, borderRadius, gradients } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [popularQuests, setPopularQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPopularQuests();
  }, []);

  const loadPopularQuests = async () => {
    setIsLoading(true);
    const quests = await questService.getActiveQuests(5);
    setPopularQuests(quests);
    setIsLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброй ночи 🌙';
    if (hour < 12) return 'Доброе утро ☀️';
    if (hour < 18) return 'Добрый день 👋';
    return 'Добрый вечер 🌆';
  };

  const QuickActionButton = ({
    icon,
    label,
    gradient,
    onClick,
  }: {
    icon: string;
    label: string;
    gradient: string;
    onClick: () => void;
  }) => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: `${spacing.sm}px`,
      }}
    >
      <button
        onClick={onClick}
        style={{
          background: gradient,
          width: '56px',
          height: '56px',
          borderRadius: borderRadius.lg,
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {icon}
      </button>
      <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>
        {label}
      </span>
    </div>
  );

  return (
    <Layout>
      <div style={{ minHeight: '100vh' }}>
        {/* Градиентный хедер */}
        <div
          style={{
            background: gradients.brand,
            padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.xl}px`,
            borderBottomLeftRadius: '32px',
            borderBottomRightRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Декоративные звезды */}
          <span style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '16px', opacity: 0.3 }}>✨</span>
          <span style={{ position: 'absolute', top: '60px', right: '20px', fontSize: '12px', opacity: 0.2 }}>✨</span>
          <span style={{ position: 'absolute', bottom: '40px', left: '30px', fontSize: '20px', opacity: 0.15 }}>✨</span>

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Приветствие и имя */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${spacing.base}px` }}>
              <div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: `${spacing.xs}px` }}>
                  {getGreeting()}
                </p>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px', margin: 0 }}>
                  {user?.first_name || user?.username || 'Путешественник'}
                </h1>
              </div>

              {/* Очки */}
              <div
                onClick={() => navigate(ROUTES.profile)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: `${spacing.sm}px ${spacing.base}px`,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${spacing.xs}px`,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ fontSize: '20px' }}>⭐</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                  {user?.points || 0}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '22px', margin: 0 }}>
              Исследуй город и получай награды
            </p>
          </div>
        </div>

        {/* Быстрые действия */}
        <div
          style={{
            display: 'flex',
            gap: `${spacing.md}px`,
            padding: `${spacing.lg}px`,
          }}
        >
          <QuickActionButton
            icon="🎯"
            label={t('navigation.quests')}
            gradient={gradients.brand}
            onClick={() => navigate(ROUTES.quests)}
          />
          <QuickActionButton
            icon="🗺️"
            label={t('navigation.map')}
            gradient={gradients.success}
            onClick={() => navigate(ROUTES.map)}
          />
          <QuickActionButton
            icon="🏆"
            label={t('navigation.leaderboard')}
            gradient={gradients.warning}
            onClick={() => navigate(ROUTES.leaderboard)}
          />
          <QuickActionButton
            icon="📰"
            label="События"
            gradient={gradients.accent}
            onClick={() => navigate(ROUTES.events)}
          />
        </div>

        {/* Популярные квесты */}
        <div style={{ padding: `0 ${spacing.lg}px ${spacing.base}px` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${spacing.base}px` }}>
            <div>
              <h2 style={{ ...typography.h3, margin: 0, marginBottom: `${spacing.xs}px` }}>
                Популярные квесты
              </h2>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                Выбор сообщества
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.quests)}
            >
              Все →
            </Button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="120px" />
              ))}
            </div>
          ) : popularQuests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
              {popularQuests.map((quest) => {
                const categoryIcon = CATEGORY_CONFIG[quest.category as keyof typeof CATEGORY_CONFIG]?.icon || '🎯';
                
                return (
                  <Card
                    key={quest.id}
                    hover
                    onClick={() => navigate(`/quests/${quest.id}`)}
                  >
                    <div style={{ display: 'flex', gap: `${spacing.md}px` }}>
                      {/* Иконка */}
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
                        {categoryIcon}
                      </div>

                      {/* Контент */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, marginBottom: `${spacing.xs}px` }}>
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
                          {quest.short_description}
                        </p>

                        <div style={{ display: 'flex', gap: `${spacing.md}px`, fontSize: '12px', color: colors.textTertiary }}>
                          <span>🏆 {quest.reward_points} pts</span>
                          <span>💰 {quest.reward_coins} coins</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: `${spacing.xl}px` }}>
                <div style={{ fontSize: '48px', marginBottom: `${spacing.md}px` }}>🎯</div>
                <p style={{ color: colors.textSecondary, margin: 0, marginBottom: `${spacing.xs}px` }}>
                  Квесты скоро появятся
                </p>
                <p style={{ fontSize: '14px', color: colors.textLight, margin: 0 }}>
                  Мы готовим для вас увлекательные приключения
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Промо-баннер */}
        <div style={{ padding: `0 ${spacing.lg}px ${spacing.xxl}px` }}>
          <div
            style={{
              background: gradients.accent,
              padding: `${spacing.lg}px`,
              borderRadius: borderRadius.lg,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.base}px` }}>
              <span style={{ fontSize: '32px' }}>⚡</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: `${spacing.xs}px` }}>
                  Начни приключение
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  Пройди первый квест и получи 100 очков
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};