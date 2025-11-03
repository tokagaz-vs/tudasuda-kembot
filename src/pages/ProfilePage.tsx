import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Avatar } from '@/components/ui';
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
  PencilSimple,
  Lightning, 
  Crown,
  Sparkle,
  CaretRight,
  Coins, // ✅ добавим иконку монет
} from '@phosphor-icons/react';
import { LevelProgress } from '@/components/profile/LevelProgress'; // ✅ используем твой компонент уровня

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing, gradients } = useTheme();
  const { hapticFeedback } = useTelegram();
  const { user } = useAuthStore();

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
    delay = 0,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
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
            background: colors.surfaceAlt,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: `${spacing.md}px`,
          }}
        >
          <Icon size={20} color={colors.text} weight="bold" />
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: colors.text,
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
        <CaretRight size={20} color={colors.textLight} />
      </div>
    </div>
  );

  // ✅ Энергия: цвет и процент
  const energyPct = Math.min(100, Math.round((user.energy / user.max_energy) * 100));
  const energyColor =
    energyPct < 30 ? '#EF4444' : energyPct < 70 ? '#F59E0B' : '#10B981';

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
              onClick={() => {
                hapticFeedback.impact('light');
                navigate('/profile/edit');
              }}
              icon={<PencilSimple size={16} color="#FFFFFF" />}
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

          {/* ✅ Прогресс уровня (заменили самописный расчёт на LevelProgress) */}
          <div
            style={{
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 400ms',
              marginBottom: `${spacing.lg}px`,
            }}
          >
            <Card variant="glass">
              <LevelProgress level={user.level} experience={user.experience} />
            </Card>
          </div>

          {/* ✅ Энергия */}
          <div
            style={{
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 430ms',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
                  <Lightning size={20} color={energyColor} weight="fill" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
                    Энергия
                  </span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: energyColor }}>
                  {user.energy} / {user.max_energy}
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
                    width: `${energyPct}%`,
                    background: energyColor,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p style={{ margin: `${spacing.sm}px 0 0`, fontSize: '12px', color: colors.textSecondary }}>
                Восстанавливается автоматически
              </p>
            </Card>
          </div>

          {/* ✅ Баланс (монеты и очки) */}
          <div
            style={{
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 450ms',
              marginBottom: `${spacing.lg}px`,
            }}
          >
            <Card variant="glass">
              <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.lg}px` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: '#F59E0B22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Coins size={18} color="#F59E0B" weight="fill" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                      Монеты
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
                      {user.coins.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: '#8B5CF622',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Star size={18} color="#8B5CF6" weight="fill" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                      Очки
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
                      {user.points.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Premium баннер */}
          {!user.is_premium && (
            <div
              style={{
                opacity: 0,
                animation: 'fadeInDown 0.5s ease forwards 480ms',
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
                onPress={() => navigate('/notifications')}
                delay={500}
              />
              <MenuItem
                icon={ShieldCheck}
                title="Приватность"
                subtitle="Настройки конфиденциальности"
                onPress={() => navigate('/privacy')}
                delay={550}
              />
              <MenuItem
                icon={Question}
                title="Помощь и поддержка"
                subtitle="Свяжитесь с нами"
                onPress={() => navigate('/help')}
                delay={600}
              />
              <MenuItem
                icon={Info}
                title="О приложении"
                subtitle="Версия 1.0.0"
                onPress={() => {
                  hapticFeedback.notification('success');
                  alert('TudaSuda Quest\n\nВерсия 1.0.0\n\n© 2024 Все права защищены');
                }}
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
        `}
      </style>
    </Layout>
  );
};