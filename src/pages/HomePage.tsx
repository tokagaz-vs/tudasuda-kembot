import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, GlassPanel, Skeleton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { questService } from '@/services/quest.service';
import { Quest } from '@/types';
import { ROUTES } from '@/constants';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [featuredQuests, setFeaturedQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedQuests();
  }, []);

  const loadFeaturedQuests = async () => {
    setIsLoading(true);
    const quests = await questService.getFeaturedQuests();
    setFeaturedQuests(quests);
    setIsLoading(false);
  };

  return (
    <Layout>
      <div style={{ padding: `${spacing.lg}px` }}>
        {/* Header */}
        <div style={{ marginBottom: `${spacing.xl}px` }}>
          <h1 style={{ ...typography.h1, marginBottom: `${spacing.sm}px` }}>
            {t('home.welcomeBack')} {user?.first_name}! 👋
          </h1>
          <p style={{ ...typography.sub, color: colors.textSecondary }}>
            {t('home.yourStats')}
          </p>
        </div>

        {/* User Stats */}
        <GlassPanel style={{ marginBottom: `${spacing.xl}px` }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: `${spacing.md}px`,
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: colors.primary }}>
                {user?.level || 1}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                {t('home.level')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: colors.secondary }}>
                {user?.points || 0}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                {t('home.points')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: colors.warning }}>
                {user?.coins || 0}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                {t('home.coins')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: colors.success }}>
                {user?.energy || 100}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                {t('home.energy')}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Quick Actions */}
        <div style={{ marginBottom: `${spacing.xl}px` }}>
          <h2 style={{ ...typography.h3, marginBottom: `${spacing.md}px` }}>
            {t('home.quickActions')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: `${spacing.md}px`,
            }}
          >
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.quests)}
              leftIcon="🎯"
            >
              {t('home.startQuest')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.companion)}
              leftIcon="👥"
            >
              {t('home.findCompanion')}
            </Button>
          </div>
        </div>

        {/* Featured Quests */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: `${spacing.md}px`,
            }}
          >
            <h2 style={{ ...typography.h3 }}>{t('home.featuredQuests')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.quests)}
            >
              {t('common.viewAll')} →
            </Button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="120px" />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
              {featuredQuests.slice(0, 3).map((quest) => (
                <Card
                  key={quest.id}
                  hover
                  onClick={() => navigate(`/quests/${quest.id}`)}
                >
                  <div style={{ display: 'flex', gap: `${spacing.md}px` }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: borderRadius.md,
                        background: colors.surfaceAlt,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        flexShrink: 0,
                      }}
                    >
                      {quest.category === 'exploration' ? '🗺️' : '📸'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          ...typography.h4,
                          marginBottom: `${spacing.xs}px`,
                        }}
                      >
                        {quest.title}
                      </h3>
                      <p
                        style={{
                          ...typography.sub,
                          color: colors.textSecondary,
                          marginBottom: `${spacing.sm}px`,
                        }}
                      >
                        {quest.short_description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: `${spacing.md}px`,
                          fontSize: '12px',
                          color: colors.textTertiary,
                        }}
                      >
                        <span>🏆 {quest.reward_points} pts</span>
                        <span>💰 {quest.reward_coins} coins</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};