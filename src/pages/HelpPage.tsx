import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { 
  ArrowLeft,
  CaretDown,
  TelegramLogo,
  EnvelopeSimple,
  BookOpen,
  Lightbulb
} from '@phosphor-icons/react';

const FAQ_ITEMS = [
  {
    category: '🎮 Основы игры',
    items: [
      {
        q: 'Как начать играть?',
        a: 'Выберите квест на вкладке "Квесты", нажмите "Начать квест" и следуйте инструкциям. Приложение будет отслеживать вашу геолокацию и показывать расстояние до точек маршрута.'
      },
      {
        q: 'Что такое очки и монеты?',
        a: 'Очки (Points) — основная валюта для прогресса и рейтинга. Монеты (Coins) используются для покупок в магазине. Получайте их за прохождение квестов!'
      },
      {
        q: 'Как повысить уровень?',
        a: 'Зарабатывайте опыт (XP) за прохождение квестов. При достижении порога вы получите новый уровень и награды: монеты, увеличенную энергию и доступ к новым квестам.'
      }
    ]
  },
  {
    category: '🗺️ Квесты',
    items: [
      {
        q: 'Что делать, если не получается добраться до точки?',
        a: 'Используйте кнопку "Построить маршрут" для навигации. Радиус срабатывания — обычно 50-100м. Если точка недоступна, используйте подсказку (💡) или напишите в поддержку.'
      },
      {
        q: 'Можно ли проходить квест несколько раз?',
        a: 'Да! После завершения вы можете пройти квест снова. Полные очки даются только за первое прохождение, но вы получите опыт и удовольствие.'
      },
      {
        q: 'Что такое категории квестов?',
        a: 'Категории (История, Архитектура, Природа и др.) помогают фильтровать квесты по интересам. Выбирайте те, что вам ближе!'
      }
    ]
  },
  {
    category: '🛍️ Магазин и энергия',
    items: [
      {
        q: 'Зачем нужна энергия?',
        a: 'Энергия расходуется при прохождении квестов. Восстанавливается со временем или через покупку "Энергетиков" в магазине.'
      },
      {
        q: 'Как получить монеты?',
        a: 'Проходите квесты, достигайте новых уровней, получайте достижения. Также монеты даются за участие в событиях.'
      },
      {
        q: 'Что дает премиум?',
        a: 'Премиум-подписка даёт: x2 очки за квесты, эксклюзивные квесты, приоритет в событиях и отключение ограничений.'
      }
    ]
  },
  {
    category: '👥 Социальные функции',
    items: [
      {
        q: 'Как найти компаньона для квеста?',
        a: 'На странице квеста нажмите "Найти компаньонов" или перейдите в раздел "Компаньоны". Создайте запрос или откликнитесь на существующий.'
      },
      {
        q: 'Как работает рейтинг?',
        a: 'Рейтинг формируется по очкам, пройденным квестам и уровню. Соревнуйтесь с друзьями и другими игроками!'
      }
    ]
  },
  {
    category: '⚙️ Технические вопросы',
    items: [
      {
        q: 'Приложение не видит мою геолокацию',
        a: 'Разрешите доступ к геолокации в настройках Telegram. На iOS: Настройки → Telegram → Геопозиция → При использовании. На Android: аналогично.'
      },
      {
        q: 'Не загружается карта',
        a: 'Проверьте подключение к интернету. Карты работают в онлайн-режиме. Попробуйте перезапустить приложение.'
      },
      {
        q: 'Прогресс не сохраняется',
        a: 'Убедитесь, что вы авторизованы через Telegram. Прогресс привязан к вашему Telegram ID и сохраняется автоматически.'
      }
    ]
  }
];

export const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing } = useTheme();
  const { hapticFeedback, openTelegramLink } = useTelegram();
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  // Прокручиваем страницу вверх при монтировании компонента
  useEffect(() => {
    window.scrollTo(0, 0);
    // Альтернативный вариант для Telegram WebApp
    if (window.Telegram?.WebApp) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  const toggleAccordion = (id: string) => {
    hapticFeedback.selection();
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Заголовок */}
        <div style={{
          padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.lg}px`,
          background: `linear-gradient(180deg, ${colors.primary}, ${colors.background})`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
          }}>
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
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}>
              Помощь и поддержка
            </h1>
          </div>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
          }}>
            Найдите ответы на частые вопросы
          </p>
        </div>

        {/* Быстрые действия */}
        <div style={{
          padding: `${spacing.lg}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: spacing.md,
        }}>
          <Card
            variant="glass"
            onPress={() => openTelegramLink('https://t.me/tudasuda_support')}
          >
            <div style={{ textAlign: 'center', padding: spacing.md }}>
              <TelegramLogo size={32} color={colors.primary} weight="fill" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: colors.text, margin: 0 }}>
                Написать в поддержку
              </p>
            </div>
          </Card>

          <Card
            variant="glass"
            onPress={() => openTelegramLink('https://t.me/tudasuda_news')}
          >
            <div style={{ textAlign: 'center', padding: spacing.md }}>
              <BookOpen size={32} color={colors.primary} weight="fill" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: colors.text, margin: 0 }}>
                Новости и гайды
              </p>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div style={{ padding: `0 ${spacing.lg}px` }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: colors.text,
            marginBottom: spacing.md,
          }}>
            📚 Часто задаваемые вопросы
          </h2>

          {FAQ_ITEMS.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{ marginBottom: spacing.lg }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: colors.textSecondary,
                marginBottom: spacing.md,
              }}>
                {section.category}
              </h3>

              {section.items.map((item, itemIndex) => {
                const id = `${sectionIndex}-${itemIndex}`;
                const isOpen = openIndex === id;

                return (
                  <Card
                    key={id}
                    variant="glass"
                    style={{ marginBottom: spacing.sm }}
                  >
                    <div
                      onClick={() => toggleAccordion(id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: colors.text,
                        margin: 0,
                        flex: 1,
                      }}>
                        {item.q}
                      </h4>
                      <CaretDown
                        size={20}
                        color={colors.textSecondary}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>

                    {isOpen && (
                      <p style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        lineHeight: '20px',
                        marginTop: spacing.md,
                        marginBottom: 0,
                      }}>
                        {item.a}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          ))}
        </div>

        {/* Не нашли ответ */}
        <div style={{ padding: `${spacing.lg}px` }}>
          <Card variant="gradient" gradient={[colors.primary, colors.primary + '99'] as [string, string]}>
            <div style={{ textAlign: 'center' }}>
              <Lightbulb size={48} color="#FFFFFF" weight="fill" style={{ margin: '0 auto 16px' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: spacing.sm,
              }}>
                Не нашли ответ?
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: spacing.lg,
                lineHeight: '20px',
              }}>
                Напишите нам в поддержку, и мы поможем вам в течение 24 часов
              </p>
              <button
                onClick={() => openTelegramLink('https://t.me/tudasuda_support')}
                style={{
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  background: '#FFFFFF',
                  color: colors.primary,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <EnvelopeSimple size={20} weight="fill" />
                Связаться с поддержкой
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};