import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Avatar, Input } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { 
  Star, 
  Trophy, 
  Rocket, 
  ChartLine, 
  Bell, 
  ShieldCheck, 
  Question, 
  Info, 
  Camera, 
  X, 
  Check, 
  Lightning, 
  Crown,
  Sparkle,
} from '@phosphor-icons/react';

export const ProfilePage: React.FC = () => {
  const { colors, spacing, gradients } = useTheme();
  const { hapticFeedback } = useTelegram();
  const { user } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
  });

  if (!user) {
    return (
      <Layout>
        <div
          style={{
            padding: `${spacing.xl}px`,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '16px', color: colors.textSecondary }}>
            Необходима авторизация
          </p>
        </div>
      </Layout>
    );
  }

  const xpForNextLevel = user.level * 100;
  const xpPct = Math.min(100, Math.round((user.experience / xpForNextLevel) * 100));

  const StatCard = ({
    icon: Icon,
    value,
    label,
    gradient,
    delay = 0,
  }: {
    icon: any;
    value: string | number;
    label: string;
    gradient: readonly [string, string, ...string[]];
    delay?: number;
  }) => (
    <div
      style={{
        flex: 1,
        opacity: 0,
        animation: `fadeInDown 0.5s ease forwards ${delay}ms`,
      }}
    >
      <Card variant="glass">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: `${spacing.md}px 0`,
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: `${spacing.md}px`,
            }}
          >
            <Icon size={20} color="#FFFFFF" weight="bold" />
          </div>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: colors.text,
              marginBottom: '4px',
            }}
          >
            {value}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: colors.textSecondary,
            }}
          >
            {label}
          </span>
        </div>
      </Card>
    </div>
  );

  const MenuItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    danger,
    delay = 0,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
    delay?: number;
  }) => (
    <div
      style={{
        opacity: 0,
        animation: `fadeInDown 0.5s ease forwards ${delay}ms`,
      }}
    >
      <div
        onClick={() => {
          hapticFeedback.impact('light');
          onPress();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spacing.md}px 0`,
          borderBottom: `1px solid ${colors.border}`,
          cursor: 'pointer',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '22px',
            background: danger ? colors.error + '15' : colors.surfaceAlt,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: `${spacing.md}px`,
          }}
        >
          <Icon
            size={20}
            color={danger ? colors.error : colors.text}
            weight="bold"
          />
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: danger ? colors.error : colors.text,
              marginBottom: subtitle ? '2px' : 0,
            }}
          >
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Градиентный хедер с аватаром */}
        <div
          style={{
            background: `linear-gradient(135deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
            padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.xl}px`,
            borderBottomLeftRadius: '32px',
            borderBottomRightRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Декоративные звездочки */}
          <Sparkle
            size={16}
            color="rgba(255,255,255,0.3)"
            weight="fill"
            style={{ position: 'absolute', top: '20px', right: '40px' }}
          />
          <Sparkle
            size={12}
            color="rgba(255,255,255,0.2)"
            weight="fill"
            style={{ position: 'absolute', top: '60px', right: '20px' }}
          />
          <Sparkle
            size={20}
            color="rgba(255,255,255,0.15)"
            weight="fill"
            style={{ position: 'absolute', bottom: '40px', left: '30px' }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: `${spacing.sm}px`,
              opacity: 0,
              animation: 'fadeIn 0.5s ease forwards 100ms',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Avatar
                src={user.photo_url}
                alt={user.first_name}
                size="xl"
                fallback={user.first_name?.charAt(0)}
                variant={user.is_premium ? 'premium' : 'gradient'}
              />
            </div>

            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginTop: `${spacing.sm}px`,
                marginBottom: '4px',
              }}
            >
              {user.first_name} {user.last_name || ''}
            </h1>

            {user.username && (
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '15px' }}>
                @{user.username}
              </p>
            )}

            {user.is_premium && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                <Crown size={14} color="#FFD700" weight="fill" /> Premium
              </div>
            )}

            <Button
              title="Редактировать профиль"
              variant="glass"
              size="small"
              onClick={() => setShowEditModal(true)}
              icon={<Camera size={16} color="#FFFFFF" />}
              style={{ marginTop: `${spacing.sm}px`, minWidth: '180px' }}
            />
          </div>
        </div>

        {/* Статистика */}
        <div style={{ padding: `${spacing.lg}px` }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: `${spacing.md}px`,
              marginBottom: `${spacing.lg}px`,
            }}
          >
            <StatCard
              icon={Trophy}
              value={user.quests_completed}
              label="Пройдено"
              gradient={['#F59E0B', '#DC2626']}
              delay={200}
            />
            <StatCard
              icon={Rocket}
              value={0}
              label="В процессе"
              gradient={gradients.accent.colors}
              delay={250}
            />
            <StatCard
              icon={Star}
              value={user.points}
              label="Очков"
              gradient={gradients.brand.colors}
              delay={300}
            />
            <StatCard
              icon={ChartLine}
              value={`#${user.level}`}
              label="Место"
              gradient={gradients.success?.colors || ['#22C55E', '#10B981']}
              delay={350}
            />
          </div>

          {/* XP Progress */}
          <div
            style={{
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 400ms',
              marginBottom: `${spacing.lg}px`,
            }}
          >
            <Card variant="glass">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: `${spacing.sm}px`,
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
                  Опыт
                </span>
                <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {user.experience} / {xpForNextLevel}
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
                    width: `${xpPct}%`,
                    background: `linear-gradient(90deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Premium баннер (если не премиум) */}
          {!user.is_premium && (
            <div
              style={{
                opacity: 0,
                animation: 'fadeInDown 0.5s ease forwards 450ms',
                marginBottom: `${spacing.lg}px`,
              }}
            >
              <Card variant="gradient" gradient={['#7C4DFF', '#18A0FB'] as const}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${spacing.md}px`,
                  }}
                >
                  <Crown size={32} color="#FFFFFF" weight="fill" />
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        marginBottom: '4px',
                      }}
                    >
                      Попробуй Premium
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.8)',
                        margin: 0,
                      }}
                    >
                      Получи эксклюзивные рамки и бонусы
                    </p>
                  </div>
                  <Lightning size={24} color="#FFFFFF" weight="fill" />
                </div>
              </Card>
            </div>
          )}

          {/* Меню */}
          <div
            style={{
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 500ms',
            }}
          >
            <Card variant="glass">
              <MenuItem
                icon={Bell}
                title="Уведомления"
                subtitle="Управление уведомлениями"
                onPress={() => alert('В разработке')}
                delay={500}
              />
              <MenuItem
                icon={ShieldCheck}
                title="Приватность"
                subtitle="Настройки конфиденциальности"
                onPress={() => alert('В разработке')}
                delay={550}
              />
              <MenuItem
                icon={Question}
                title="Помощь и поддержка"
                subtitle="Свяжитесь с нами"
                onPress={() => alert('В разработке')}
                delay={600}
              />
              <MenuItem
                icon={Info}
                title="О приложении"
                subtitle="Версия 1.0.0"
                onPress={() => alert('TudaSuda Quest\n\nВерсия 1.0.0\n\n© 2024 Все права защищены')}
                delay={650}
              />
            </Card>
          </div>

          {/* ID и дата регистрации */}
          <div
            style={{
              marginTop: `${spacing.lg}px`,
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 700ms',
            }}
          >
            <Card
              variant="glass"
              style={{
                background: colors.surfaceAlt,
                borderColor: colors.border,
              }}
            >
              <div style={{ fontSize: '12px', color: colors.textSecondary, textAlign: 'center' }}>
                <p style={{ margin: 0 }}>ID: {user.telegram_id}</p>
                <p style={{ margin: `${spacing.xs}px 0 0 0` }}>
                  Дата регистрации: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.lg,
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.background,
              borderRadius: `${spacing.lg}px`,
              width: '100%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease',
            }}
          >
            {/* Хедер */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <X
                size={24}
                color={colors.text}
                style={{ cursor: 'pointer' }}
                onClick={() => setShowEditModal(false)}
              />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: colors.text, margin: 0 }}>
                Редактировать профиль
              </h3>
              <Check size={24} color={colors.primary} weight="bold" style={{ cursor: 'pointer' }} />
            </div>

            {/* Контент */}
            <div style={{ padding: spacing.lg, overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
                <Avatar
                  src={user.photo_url}
                  alt={user.first_name}
                  size="xl"
                  fallback={user.first_name?.charAt(0)}
                  variant="gradient"
                />
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: colors.primary,
                    marginTop: spacing.md,
                    cursor: 'pointer',
                  }}
                >
                  Изменить фото
                </p>
              </div>

              <Input
                label="Имя пользователя"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                placeholder="Введите имя пользователя"
              />

              <Input
                label="Полное имя"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Введите полное имя"
              />
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Layout>
  );
};