import React from 'react';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { socialService } from '@/services/social.service';
import type { CompanionRequest } from '@/types';
import { UserCircle, MapPin, Clock, Users, Star, ChatCircle } from '@phosphor-icons/react';

interface CompanionRequestCardProps {
  request: CompanionRequest;
  onRespond?: (requestId: string) => void;
  showRespondButton?: boolean;
  showChatButton?: boolean;
}

export const CompanionRequestCard: React.FC<CompanionRequestCardProps> = ({
  request,
  onRespond,
  showRespondButton = true,
  showChatButton = false,
}) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();

  const timeLeft = () => {
    const now = new Date();
    const expires = new Date(request.expires_at);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}д`;
    }
    
    return hours > 0 ? `${hours}ч` : 'Скоро истечет';
  };

  // ✅ ИСПРАВЛЕНО: Открыть чат с пользователем
  const handleOpenChat = () => {
    if (!request.user?.telegram_id) return;
    
    hapticFeedback.impact('medium');
    socialService.openTelegramChat(
      request.user.telegram_id,
      request.user.username || undefined // ✅ Преобразуем null в undefined
    );
  };

  return (
    <Card variant="glass">
      <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.md }}>
        {/* Аватар */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}99)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {request.user?.photo_url ? (
            <img 
              src={request.user.photo_url} 
              alt={request.user.first_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <UserCircle size={28} color="#FFFFFF" weight="fill" />
          )}
        </div>

        {/* Информация */}
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: colors.text,
            marginBottom: spacing.xs,
          }}>
            {request.user?.first_name} {request.user?.last_name || ''}
          </h4>

          {request.user?.username && (
            <p style={{
              fontSize: '13px',
              color: colors.textSecondary,
              marginBottom: spacing.xs,
            }}>
              @{request.user.username}
            </p>
          )}

          {/* Статистика пользователя */}
          <div style={{ display: 'flex', gap: spacing.md }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <Star size={14} color={colors.warning} weight="fill" />
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                {request.user?.points || 0}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                Lvl {request.user?.level || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Квест */}
      {request.quest && (
        <div style={{
          padding: spacing.md,
          background: colors.surface,
          borderRadius: '12px',
          marginBottom: spacing.md,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <MapPin size={14} color={colors.primary} weight="fill" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: colors.primary }}>
              Квест
            </span>
          </div>
          <h5 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: colors.text,
            margin: 0,
          }}>
            {request.quest.title}
          </h5>
        </div>
      )}

      {/* Сообщение */}
      {request.message && (
        <p style={{
          fontSize: '14px',
          lineHeight: '20px',
          color: colors.textSecondary,
          marginBottom: spacing.md,
          padding: spacing.md,
          background: colors.surfaceAlt,
          borderRadius: '8px',
          fontStyle: 'italic',
        }}>
          "{request.message}"
        </p>
      )}

      {/* Детали */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: (showRespondButton || showChatButton) ? spacing.md : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <Users size={14} color={colors.textSecondary} />
          <span style={{ fontSize: '13px', color: colors.textSecondary }}>
            До {request.max_companions} человек
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <Clock size={14} color={colors.textSecondary} />
          <span style={{ fontSize: '13px', color: colors.textSecondary }}>
            {timeLeft()}
          </span>
        </div>
        {request.preferred_language && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <span style={{ fontSize: '13px', color: colors.textSecondary }}>
              🌐 {request.preferred_language === 'ru' ? 'Русский' : 
                   request.preferred_language === 'en' ? 'English' : 
                   request.preferred_language === 'zh' ? '中文' : 
                   request.preferred_language}
            </span>
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      {(showRespondButton || showChatButton) && (
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {showRespondButton && onRespond && (
            <Button
              title="Откликнуться"
              variant="primary"
              size="medium"
              onClick={() => {
                hapticFeedback.impact('medium');
                onRespond(request.id);
              }}
              fullWidth
            />
          )}
          
          {showChatButton && (
            <Button
              title="Написать"
              variant="secondary"
              size="medium"
              onClick={handleOpenChat}
              icon={<ChatCircle size={20} color={colors.primary} weight="fill" />}
              fullWidth={!showRespondButton}
            />
          )}
        </div>
      )}
    </Card>
  );
};