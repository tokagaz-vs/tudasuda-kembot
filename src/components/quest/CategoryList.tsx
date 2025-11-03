import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { categoryService } from '@/services/category.service';
import type { QuestCategory } from '@/types';


interface CategoryWithStats extends QuestCategory {
  questCount?: number;
}

interface CategoryListProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect, 
  selectedCategoryId 
}) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await categoryService.getCategoriesStats();
    if (data) {
      setCategories(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: `${spacing.lg}px` }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: `${spacing.md}px`,
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: '120px',
                borderRadius: '16px',
                background: colors.surface,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: `${spacing.lg}px` }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: colors.text,
        marginBottom: `${spacing.md}px`,
      }}>
        📂 Категории
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: `${spacing.md}px`,
      }}>
        {categories.map((category, index) => {
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <div
              key={category.id}
              style={{
                opacity: 0,
                animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
              }}
            >
              <Card
                variant="glass"
                onPress={() => {
                  hapticFeedback.impact('light');
                  onCategorySelect(category.id);
                }}
                style={{
                  border: isSelected ? `2px solid ${category.color || colors.primary}` : undefined,
                  background: isSelected ? (category.color || colors.primary) + '15' : undefined,
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: `${spacing.md}px`,
                  gap: `${spacing.sm}px`,
                }}>
                  {/* Иконка категории */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    background: `linear-gradient(135deg, ${category.color || colors.primary}, ${category.color || colors.primary}99)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}>
                    {category.icon || '📍'}
                  </div>

                  {/* Название */}
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: colors.text,
                    margin: 0,
                  }}>
                    {category.name}
                  </h3>

                  {/* Количество квестов */}
                  <span style={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                  }}>
                    {category.questCount || 0} {category.questCount === 1 ? 'квест' : 'квестов'}
                  </span>
                </div>
              </Card>
            </div>
          );
        })}
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

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};