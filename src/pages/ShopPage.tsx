import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { shopService } from '@/services/shop.service';
import type { ShopItem } from '@/types';
import { 
  ShoppingCart, 
  Coin, 
  Lightning, 
  Sparkle, 
  Star,
  LockKey,
  Crown
} from '@phosphor-icons/react';

const CATEGORIES = [
  { key: 'all', label: 'Все', icon: '🛍️' },
  { key: 'powerup', label: 'Усиления', icon: '⚡' },
  { key: 'booster', label: 'Бустеры', icon: '🚀' },
  { key: 'premium', label: 'Премиум', icon: '👑' },
  { key: 'special', label: 'Особые', icon: '✨' },
];

export const ShopPage: React.FC = () => {
  const { colors, spacing, gradients } = useTheme();
  const { hapticFeedback, showAlert, showConfirm } = useTelegram();
  const { user, refreshUser } = useAuthStore();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    const { data } = await shopService.getShopItems();
    if (data) {
      setItems(data);
    }
    setIsLoading(false);
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const handlePurchase = async (item: ShopItem) => {
    if (!user) return;

    const confirmed = await showConfirm(
      `Купить "${item.name}" за ${item.price_coins} монет?`
    );

    if (!confirmed) return;

    hapticFeedback.impact('medium');
    setPurchasingId(item.id);

    const { error } = await shopService.purchaseItem(user.id, item.id);

    if (error) {
      await showAlert(error);
    } else {
      hapticFeedback.notification('success');
      await showAlert(`✅ Покупка успешна!\n\n"${item.name}" добавлен в инвентарь`);
      await refreshUser();
    }

    setPurchasingId(null);
  };

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'powerup': return Lightning;
      case 'booster': return Star;
      case 'premium': return Crown;
      default: return Sparkle;
    }
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Заголовок с балансом */}
        <div style={{
          padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.lg}px`,
          background: `linear-gradient(180deg, ${gradients.brand.colors[0]}, ${colors.background})`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <ShoppingCart size={32} color="#FFFFFF" weight="fill" />
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
              }}>
                Магазин
              </h1>
            </div>

            {/* Баланс монет */}
            <div style={{
              padding: `${spacing.sm}px ${spacing.md}px`,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
            }}>
              <Coin size={20} color="#FFD700" weight="fill" />
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}>
                {user?.coins || 0}
              </span>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
          }}>
            Покупайте усиления и бонусы за игровые монеты
          </p>
        </div>

        {/* Категории */}
        <div style={{
          padding: `${spacing.lg}px`,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  hapticFeedback.selection();
                  setSelectedCategory(cat.key);
                }}
                style={{
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  borderRadius: '999px',
                  border: 'none',
                  background: selectedCategory === cat.key ? colors.primary : colors.surface,
                  color: selectedCategory === cat.key ? '#FFFFFF' : colors.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Товары */}
        <div style={{ padding: `0 ${spacing.lg}px` }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: `${spacing.xxl}px 0` }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${colors.surfaceAlt}`,
                borderTopColor: colors.primary,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          ) : filteredItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {filteredItems.map((item, index) => {
                const Icon = getItemIcon(item.category);
                const canAfford = (user?.coins || 0) >= item.price_coins;
                const hasLevel = (user?.level || 1) >= item.required_level;
                const canBuy = canAfford && hasLevel;
                const isPurchasing = purchasingId === item.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                    }}
                  >
                    <Card variant="glass">
                      <div style={{ display: 'flex', gap: spacing.md }}>
                        {/* Иконка */}
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}99)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={32} color="#FFFFFF" weight="fill" />
                        </div>

                        {/* Информация */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: colors.text,
                            marginBottom: spacing.xs,
                          }}>
                            {item.name}
                          </h3>

                          <p style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            lineHeight: '20px',
                            marginBottom: spacing.sm,
                          }}>
                            {item.description}
                          </p>

                          {/* Цена и уровень */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: spacing.sm,
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing.xs,
                            }}>
                              <Coin size={18} color={colors.warning} weight="fill" />
                              <span style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: canAfford ? colors.text : colors.error,
                              }}>
                                {item.price_coins}
                              </span>
                            </div>

                            {item.required_level > 1 && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.xs,
                                padding: `${spacing.xs}px ${spacing.sm}px`,
                                background: hasLevel ? colors.success + '15' : colors.error + '15',
                                borderRadius: '999px',
                              }}>
                                <LockKey 
                                  size={14} 
                                  color={hasLevel ? colors.success : colors.error} 
                                  weight="fill" 
                                />
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: hasLevel ? colors.success : colors.error,
                                }}>
                                  Lvl {item.required_level}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Кнопка покупки */}
                          <Button
                            title={
                              !hasLevel ? `Требуется ${item.required_level} уровень` :
                              !canAfford ? 'Недостаточно монет' :
                              'Купить'
                            }
                            variant={canBuy ? 'primary' : 'secondary'}
                            size="small"
                            onClick={() => handlePurchase(item)}
                            disabled={!canBuy || isPurchasing}
                            loading={isPurchasing}
                            fullWidth
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: `${spacing.xxl}px` }}>
              <ShoppingCart size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: colors.textSecondary,
                marginTop: spacing.lg,
              }}>
                Нет товаров в этой категории
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