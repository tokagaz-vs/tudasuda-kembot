import React from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

export const MapPage: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <Layout>
      <div style={{ padding: `${spacing.lg}px` }}>
        <h1 style={{ ...typography.h1, marginBottom: `${spacing.lg}px` }}>
          {t('map.title')} 🗺️
        </h1>

        <Card padding="lg">
          <div
            style={{
              textAlign: 'center',
              padding: `${spacing.xxl}px ${spacing.lg}px`,
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: `${spacing.md}px` }}>🗺️</div>
            <h2 style={{ ...typography.h3, marginBottom: `${spacing.sm}px` }}>
              {t('common.comingSoon')}
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Интерактивная карта квестов появится в следующей версии
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};