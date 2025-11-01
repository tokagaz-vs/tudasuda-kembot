import React from 'react';
import { Layout } from '@/components/layout';
import { Card, Avatar, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';

export const ProfilePage: React.FC = () => {
  const { colors, spacing, typography, gradients } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <Layout>
        <div
          style={{
            padding: `${spacing.xl}px`,
            textAlign: 'center',
          }}
        >
          <p>{t('errors.unauthorized')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Header with gradient background */}
        <div
          style={{
            background: gradients.brand,
            padding: `${spacing.xxl}px ${spacing.lg}px`,
            textAlign: 'center',
          }}
        >
          <Avatar
            src={user.photo_url}
            alt={user.first_name}
            size="xl"
            fallback={user.first_name.charAt(0)}
          />
          <h1
            style={{
              ...typography.h1,
              marginTop: `${spacing.md}px`,
              color: '#FFFFFF',
            }}
          >
            {user.first_name} {user.last_name}
          </h1>
          {user.username && (
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: `${spacing.xs}px` }}>
              @{user.username}
            </p>
          )}
        </div>

        <div style={{ padding: `${spacing.lg}px` }}>
          {/* Stats Grid */}
          <Card padding="lg" style={{ marginBottom: `${spacing.lg}px` }}>
            <h2 style={{ ...typography.h3, marginBottom: `${spacing.md}px` }}>
              {t('profile.statistics')}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: `${spacing.md}px`,
              }}
            >
              <div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {t('profile.stats.level')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: colors.primary }}>
                  {user.level}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {t('profile.stats.experience')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: colors.secondary }}>
                  {user.experience}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {t('profile.stats.points')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: colors.warning }}>
                  {user.points}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {t('profile.stats.coins')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: colors.success }}>
                  {user.coins}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {t('profile.stats.questsCompleted')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  {user.quests_completed}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {t('profile.stats.totalDistance')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  {(user.total_distance / 1000).toFixed(1)} км
                </div>
              </div>
            </div>
          </Card>

          {/* Progress Bar */}
          <Card padding="lg" style={{ marginBottom: `${spacing.lg}px` }}>
            <div style={{ marginBottom: `${spacing.sm}px` }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: `${spacing.xs}px`,
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  {t('profile.stats.experience')}
                </span>
                <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {user.experience} / {user.level * 100}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  background: colors.surfaceAlt,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(user.experience / (user.level * 100)) * 100}%`,
                    background: gradients.brand,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
            <Button variant="outline" fullWidth>
              {t('profile.achievements')} 🏆
            </Button>
            <Button variant="outline" fullWidth>
              {t('profile.inventory')} 🎒
            </Button>
            <Button variant="outline" fullWidth>
              {t('profile.settings')} ⚙️
            </Button>
            <Button variant="danger" fullWidth onClick={logout}>
              {t('profile.logout')} 🚪
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};