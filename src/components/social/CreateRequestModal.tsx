import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui'; // ✅ ИСПРАВЛЕНО: убрали Card и Input
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { questService } from '@/services/quest.service';
import type { Quest } from '@/types';
import { X, Target, Users, Globe, ChatText } from '@phosphor-icons/react';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    questId: string;
    message: string;
    maxCompanions: number;
    preferredLanguage: string;
  }) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState('');
  const [message, setMessage] = useState('');
  const [maxCompanions, setMaxCompanions] = useState(3);
  const [preferredLanguage, setPreferredLanguage] = useState('ru');
  // ✅ ИСПРАВЛЕНО: убрали неиспользуемую переменную setIsLoading

  useEffect(() => {
    if (isOpen) {
      loadQuests();
    }
  }, [isOpen]);

  const loadQuests = async () => {
    const { data } = await questService.getQuests({ is_active: true });
    if (data) {
      setQuests(data);
    }
  };

  const handleSubmit = () => {
    if (!selectedQuestId) {
      alert('Выберите квест');
      return;
    }

    hapticFeedback.impact('medium');
    onCreate({
      questId: selectedQuestId,
      message,
      maxCompanions,
      preferredLanguage,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '90vh',
          background: colors.background,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: spacing.lg,
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: colors.text,
              margin: 0,
            }}
          >
            Создать запрос
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              background: colors.surfaceAlt,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={24} color={colors.text} weight="bold" />
          </button>
        </div>

        {/* Выбор квеста */}
        <div style={{ marginBottom: spacing.lg }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}
          >
            <Target size={18} color={colors.primary} weight="fill" />
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Выберите квест
            </label>
          </div>
          <select
            value={selectedQuestId}
            onChange={(e) => {
              hapticFeedback.selection();
              setSelectedQuestId(e.target.value);
            }}
            style={{
              width: '100%',
              padding: spacing.md,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              fontSize: '15px',
              fontFamily: 'inherit',
            }}
          >
            <option value="">Выберите квест</option>
            {quests.map((quest) => (
              <option key={quest.id} value={quest.id}>
                {quest.title}
              </option>
            ))}
          </select>
        </div>

        {/* Количество компаньонов */}
        <div style={{ marginBottom: spacing.lg }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}
          >
            <Users size={18} color={colors.success} weight="fill" />
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Количество участников
            </label>
          </div>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {[2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  hapticFeedback.selection();
                  setMaxCompanions(num);
                }}
                style={{
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: '12px',
                  border: `2px solid ${
                    maxCompanions === num ? colors.success : colors.border
                  }`,
                  background:
                    maxCompanions === num ? colors.success + '15' : colors.surface,
                  color: maxCompanions === num ? colors.success : colors.text,
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Язык */}
        <div style={{ marginBottom: spacing.lg }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}
          >
            <Globe size={18} color={colors.primary} weight="fill" />
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Предпочитаемый язык
            </label>
          </div>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {[
              { code: 'ru', label: '🇷🇺 Русский' },
              { code: 'en', label: '🇬🇧 English' },
              { code: 'zh', label: '🇨🇳 中文' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  hapticFeedback.selection();
                  setPreferredLanguage(lang.code);
                }}
                style={{
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: '12px',
                  border: `2px solid ${
                    preferredLanguage === lang.code ? colors.primary : colors.border
                  }`,
                  background:
                    preferredLanguage === lang.code
                      ? colors.primary + '15'
                      : colors.surface,
                  color:
                    preferredLanguage === lang.code ? colors.primary : colors.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Сообщение */}
        <div style={{ marginBottom: spacing.xl }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}
          >
            <ChatText size={18} color={colors.warning} weight="fill" />
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Сообщение (необязательно)
            </label>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Расскажите о себе или укажите пожелания..."
            maxLength={200}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: spacing.md,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <p
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginTop: spacing.xs,
              textAlign: 'right',
            }}
          >
            {message.length}/200
          </p>
        </div>

        {/* Кнопка создания */}
        <Button
          title="Создать запрос"
          variant="primary"
          size="large"
          onClick={handleSubmit}
          fullWidth
          disabled={!selectedQuestId}
        />
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};