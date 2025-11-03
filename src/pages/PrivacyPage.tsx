import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Database,
  UserCircle,
} from '@phosphor-icons/react';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing, gradients } = useTheme();

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <Card variant="glass" style={{ marginBottom: spacing.md }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}99)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color="#FFFFFF" weight="bold" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0 }}>
          {title}
        </h3>
      </div>
      <div style={{ fontSize: '14px', lineHeight: '22px', color: colors.textSecondary }}>
        {children}
      </div>
    </Card>
  );

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Хедер */}
        <div
          style={{
            padding: `${spacing.xl}px ${spacing.lg}px ${spacing.lg}px`,
            background: `linear-gradient(135deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={24} color="#FFFFFF" weight="bold" />
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Политика конфиденциальности
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Как мы защищаем ваши данные
          </p>
        </div>

        {/* Контент */}
        <div style={{ padding: `${spacing.lg}px` }}>
          <Section icon={Database} title="Какие данные мы собираем">
            <p>Мы собираем только необходимые данные для работы приложения:</p>
            <ul style={{ paddingLeft: '20px', margin: `${spacing.sm}px 0` }}>
              <li>Telegram ID (для идентификации)</li>
              <li>Имя и фамилия</li>
              <li>Username (опционально)</li>
              <li>Фото профиля (из Telegram)</li>
              <li>Геолокация (только во время прохождения квестов)</li>
              <li>Статистика игры (очки, уровень, достижения)</li>
            </ul>
          </Section>

          <Section icon={Lock} title="Как мы используем данные">
            <p>Ваши данные используются исключительно для:</p>
            <ul style={{ paddingLeft: '20px', margin: `${spacing.sm}px 0` }}>
              <li>Идентификации пользователя</li>
              <li>Отображения профиля и статистики</li>
              <li>Сохранения прогресса в квестах</li>
              <li>Построения рейтингов</li>
              <li>Улучшения игрового опыта</li>
            </ul>
            <p style={{ marginTop: spacing.md }}>
              <strong>Мы НЕ передаем ваши данные третьим лицам!</strong>
            </p>
          </Section>

          <Section icon={Eye} title="Видимость профиля">
            <p>Другие пользователи могут видеть:</p>
            <ul style={{ paddingLeft: '20px', margin: `${spacing.sm}px 0` }}>
              <li>Ваше имя и фото (из Telegram)</li>
              <li>Username (если указан)</li>
              <li>Уровень и достижения</li>
              <li>Позицию в рейтинге</li>
            </ul>
            <p style={{ marginTop: spacing.md }}>
              Telegram ID и точная геолокация <strong>никогда не раскрываются</strong>.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="Безопасность данных">
            <p>Мы используем современные технологии защиты:</p>
            <ul style={{ paddingLeft: '20px', margin: `${spacing.sm}px 0` }}>
              <li>Шифрование соединений (HTTPS/TLS)</li>
              <li>Безопасное хранилище (Supabase)</li>
              <li>Минимизация сбора данных</li>
              <li>Регулярные аудиты безопасности</li>
            </ul>
          </Section>

          <Section icon={UserCircle} title="Ваши права">
            <p>Вы имеете право:</p>
            <ul style={{ paddingLeft: '20px', margin: `${spacing.sm}px 0` }}>
              <li>Просматривать все свои данные</li>
              <li>Редактировать профиль</li>
              <li>Запросить удаление аккаунта</li>
              <li>Получать копию своих данных</li>
            </ul>
            <p style={{ marginTop: spacing.md }}>
              Для запросов обращайтесь в поддержку: <strong>@tudasuda_support</strong>
            </p>
          </Section>

          {/* Дата обновления */}
          <Card variant="glass" style={{ background: colors.surfaceAlt, textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0 }}>
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};