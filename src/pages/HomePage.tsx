import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, GlassPanel } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { questService } from '@/services/quest.service';
import { rewardsService } from '@/services/rewards.service';
import { Quest } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { 
  Users,
  Trophy, 
  Target, 
  ArrowRight, 
  Sparkle, 
  Lightning, 
  ShoppingCart,
  CalendarBlank, // ✅ НОВОЕ: иконка для событий
  Crown,
  Coins,
} from '@phosphor-icons/react';

export const HomePage: React.FC = () => {
  const { colors, spacing, typography, gradients } = useTheme();
  const { user } = useAuthStore();
  const { hapticFeedback } = useTelegram();
  const navigate = useNavigate();
  const [popularQuests, setPopularQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPopularQuests();
  }, []);

  const loadPopularQuests = async () => {
    setIsLoading(true);
    const { data } = await questService.getPopularQuests(5);
    if (data) setPopularQuests(data);
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
    icon: Icon,
    label,
    color,
    onPress,
    delay = 0,
  }: {
    icon: any;
    label: string;
    color: string;
    onPress: () => void;
    delay?: number;
  }) => (
    <div
      style={{
        flex: 1,
        opacity: 0,
        animation: `fadeInUp 0.5s ease forwards ${delay}ms`,
      }}
    >
      <div
        onClick={() => {
          hapticFeedback.impact('light');
          onPress();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${spacing.sm}px`,
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Icon size={24} color="#FFFFFF" weight="bold" />
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );

  const QuestCard = ({ quest, index }: { quest: Quest; index: number }) => {
    // ✅ НОВОЕ: Получаем информацию о наградах по сложности
    const rewardInfo = rewardsService.getQuestReward(quest.difficulty);
    
    // Мапинг сложности на русский
    const difficultyLabels = {
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно',
    };

    const difficultyColors = {
      easy: '#10B981',
      medium: '#F59E0B',
      hard: '#EF4444',
    };

    return (
      <div
        style={{
          opacity: 0,
          animation: `fadeInRight 0.5s ease forwards ${index * 100}ms`,
          marginBottom: `${spacing.md}px`,
        }}
      >
        <Card
          variant="glass"
          onPress={() => {
            hapticFeedback.impact('light');
            navigate(`${ROUTES.quests}/${quest.id}`);
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: `${spacing.sm}px`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: quest.category?.color || colors.primary,
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: colors.textSecondary,
                }}
              >
                {quest.category?.name || 'Квест'}
              </span>
            </div>
            <ArrowRight size={20} color={colors.textLight} />
          </div>

          <h3
            style={{
              ...typography.h3,
              fontSize: '18px',
              color: colors.text,
              marginBottom: `${spacing.xs}px`,
              letterSpacing: '-0.2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {quest.title}
          </h3>

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

          {/* ✅ ОБНОВЛЕНО: Показываем награды и сложность */}
          <div style={{ display: 'flex', gap: `${spacing.md}px`, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: difficultyColors[quest.difficulty],
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                {difficultyLabels[quest.difficulty]}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkle size={14} color={colors.primary} weight="fill" />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                }}
              >
                +{rewardInfo.experience} XP
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Coins size={14} color={colors.warning} weight="fill" />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                }}
              >
                +{rewardInfo.coins}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lightning size={14} color={colors.error} weight="fill" />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                }}
              >
                -{rewardInfo.energy_cost}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ minHeight: '100vh' }}>
        {/* ✅ ОБНОВЛЕНО: Градиентный хедер БЕЗ кнопки звездочки */}
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
            style={{
              position: 'absolute',
              top: '20px',
              right: '40px',
            }}
          />
          <Sparkle
            size={12}
            color="rgba(255,255,255,0.2)"
            weight="fill"
            style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
            }}
          />
          <Sparkle
            size={20}
            color="rgba(255,255,255,0.15)"
            weight="fill"
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '30px',
            }}
          />

          <div
            style={{
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 100ms',
            }}
          >
            {/* ✅ ОБНОВЛЕНО: Убрана кнопка со звездочкой */}
            <div style={{ marginBottom: `${spacing.md}px` }}>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '4px',
                }}
              >
                {getGreeting()}
              </p>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                  margin: 0,
                }}
              >
                {user?.first_name || user?.username || 'Путешественник'}
              </h1>
              
              {/* ✅ НОВОЕ: Показываем статус премиум, если есть */}
              {user?.is_premium && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: `${spacing.xs}px`,
                    padding: '4px 12px',
                    background: 'rgba(255, 215, 0, 0.2)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                  }}
                >
                  <Crown size={14} color="#FFD700" weight="fill" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFD700' }}>
                    Premium
                  </span>
                </div>
              )}
            </div>

            {/* ✅ НОВОЕ: Мини-статистика */}
            <div style={{ display: 'flex', gap: `${spacing.md}px` }}>
              <GlassPanel padding={spacing.sm} style={{ flex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>
                    Уровень
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                    {user?.level || 1}
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel padding={spacing.sm} style={{ flex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>
                    Монеты
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 700, 
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}>
                    <Coins size={16} color="#FFD700" weight="fill" />
                    {user?.coins || 0}
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel padding={spacing.sm} style={{ flex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>
                    Энергия
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                    {user?.energy || 0}
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>

        {/* ✅ ОБНОВЛЕНО: Квесты, События, Компания, Магазин */}
        <div
          style={{
            display: 'flex',
            gap: `${spacing.md}px`,
            padding: `${spacing.xl}px ${spacing.lg}px ${spacing.md}px`,
          }}
        >
          <QuickActionButton
            icon={Target}
            label="Квесты"
            color={colors.primary}
            onPress={() => navigate(ROUTES.quests)}
            delay={200}
          />
          <QuickActionButton
            icon={CalendarBlank}
            label="События"
            color="#F59E0B"
            onPress={() => navigate('/events')}
            delay={250}
          />
          <QuickActionButton
            icon={Users}
            label="Компания"
            color={colors.success}
            onPress={() => navigate('/companions')}
            delay={300}
          />
          <QuickActionButton
            icon={ShoppingCart}
            label="Магазин"
            color={'#7C4DFF'}
            onPress={() => navigate('/shop')}
            delay={350}
          />
        </div>

        {/* Популярные квесты */}
        <div style={{ padding: `${spacing.md}px ${spacing.lg}px` }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: `${spacing.md}px`,
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 400ms',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: colors.text,
                  letterSpacing: '-0.3px',
                  margin: 0,
                  marginBottom: '2px',
                }}
              >
                Популярные квесты
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  margin: 0,
                }}
              >
                Выбор сообщества
              </p>
            </div>
            <Button
              title="Все"
              variant="ghost"
              size="small"
              onClick={() => navigate(ROUTES.quests)}
              icon={<ArrowRight size={16} color={colors.primary} />}
              iconPosition="right"
            />
          </div>

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
          ) : popularQuests.length > 0 ? (
            popularQuests.map((quest, index) => (
              <QuestCard key={quest.id} quest={quest} index={index} />
            ))
          ) : (
            <Card variant="glass" style={{ textAlign: 'center', padding: `${spacing.xxl}px` }}>
              <Target size={48} color={colors.textLight} style={{ margin: '0 auto' }} />
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginTop: `${spacing.lg}px`,
                  marginBottom: `${spacing.xs}px`,
                }}
              >
                Квесты скоро появятся
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.textLight,
                }}
              >
                Мы готовим для вас увлекательные приключения
              </p>
            </Card>
          )}
        </div>

        {/* Промо-баннер */}
        <div
          style={{
            padding: `${spacing.md}px ${spacing.lg}px ${spacing.xxl}px`,
            opacity: 0,
            animation: 'fadeInDown 0.5s ease forwards 600ms',
          }}
        >
          <Card variant="gradient" gradient={['#7C4DFF', '#18A0FB'] as const}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
              <Trophy size={32} color="#FFFFFF" weight="fill" />
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '4px',
                  }}
                >
                  Начни приключение
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: '20px',
                    margin: 0,
                  }}
                >
                  Пройди первый квест и получи награды!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>
        {`
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

          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
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