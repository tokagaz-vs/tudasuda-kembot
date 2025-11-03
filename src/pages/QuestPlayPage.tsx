import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layout } from '@/components/layout';
import { GlassPanel } from '@/components/ui';
import { TaskComponent } from '@/components/quest';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { questService } from '@/services/quest.service';
import type { QuestWithDetails, QuestPoint, UserProgress } from '@/types';
import { ROUTES } from '@/constants';
import {
  Star,
  CheckCircle,
  NavigationArrow,
  Book,
  Lightbulb,
  X,
  LockKey,
  Target,
} from '@phosphor-icons/react';

const GEOLOCATION_RADIUS = 100; // метров

// Компонент для автоматического центрирования
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

// Функция создания кастомных маркеров
const createCustomIcon = (color: string, isActive: boolean, icon: 'flag' | 'check' | 'number', label?: string) => {
  const size = isActive ? 56 : 44;
  const iconSize = isActive ? 28 : 20;
  
  let iconSvg = '';
  if (icon === 'flag') {
    iconSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="white">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>`;
  } else if (icon === 'check') {
    iconSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="10" fill="white"/>
      <path d="M9 11l3 3L22 4" stroke="${color}" stroke-width="2" fill="none"/>
    </svg>`;
  } else {
    iconSvg = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${label || '1'}</text>`;
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${isActive ? '4px' : '3px'} solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        ${iconSvg}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

export const QuestPlayPage: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { colors, spacing, gradients } = useTheme();
  const { hapticFeedback, showAlert } = useTelegram();
  const { user } = useAuthStore();

  const [quest, setQuest] = useState<QuestWithDetails | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [currentPoint, setCurrentPoint] = useState<QuestPoint | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isInRange, setIsInRange] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showExcursion, setShowExcursion] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([55.3547, 86.0872]);
  const [mapZoom] = useState(15);

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (questId && user) {
      loadQuestData();
      startLocationTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [questId, user]);

  useEffect(() => {
    if (userLocation && currentPoint) {
      calculateDistance();
    }
  }, [userLocation, currentPoint]);

  const calculateDistance = () => {
    if (!userLocation || !currentPoint) return;

    const R = 6371e3; // Радиус Земли в метрах
    const φ1 = (userLocation[0] * Math.PI) / 180;
    const φ2 = (currentPoint.latitude * Math.PI) / 180;
    const Δφ = ((currentPoint.latitude - userLocation[0]) * Math.PI) / 180;
    const Δλ = ((currentPoint.longitude - userLocation[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const calculatedDistance = Math.round(R * c);
    setDistance(calculatedDistance);
    setIsInRange(calculatedDistance <= GEOLOCATION_RADIUS);
  };

  const loadQuestData = async () => {
    if (!questId || !user) return;

    try {
      const { data: questData } = await questService.getQuestById(questId);
      if (questData) {
        setQuest(questData);
      }

      const { data: progressData } = await questService.getUserProgress(user.id, questId);
      if (progressData) {
        setProgress(progressData);
        const point = questData?.points?.[progressData.current_point];
        if (point) {
          setCurrentPoint(point);
          setMapCenter([point.latitude, point.longitude]);
        }
      }
    } catch (error) {
      console.error('Error loading quest data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Не удалось получить геолокацию. Проверьте разрешения.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 2000,
      }
    );
  };

  const handleTaskComplete = async (isCorrect: boolean, answer: any, photoUrl?: string) => {
  if (!user || !currentPoint || !progress || !quest) return;

  hapticFeedback.notification(isCorrect ? 'success' : 'error');

  const { data: answerData, error } = await questService.submitAnswer(
    user.id,
    currentPoint.id,
    progress.id,
    answer,
    photoUrl
  );

  if (error) {
    await showAlert('Не удалось сохранить ответ');
    return;
  }

  const pointsEarned = answerData?.pointsEarned || 0;
  const newTotalPoints = progress.total_points + pointsEarned;
  const nextPointIndex = progress.current_point + 1;

  if (nextPointIndex >= quest.points.length) {
    // ✅ Квест завершен - обновляем с получением наград
    const { data: rewards, levelUp } = await questService.updateProgress(
      progress.id, 
      nextPointIndex, 
      newTotalPoints, 
      'completed'
    );

    // ✅ Обновляем пользователя в сторе для отображения новых значений
    await useAuthStore.getState().refreshUser();

    // ✅ Формируем красивое сообщение о наградах
    let rewardMessage = `🎉 Квест завершен!\n\n`;
    
    if (rewards) {
      rewardMessage += `📍 Очки маршрута: ${newTotalPoints}\n`;
      rewardMessage += `⭐ Опыт: +${rewards.experience} XP\n`;
      rewardMessage += `🪙 Монеты: +${rewards.totalCoins}`;
      
      if (levelUp) {
        rewardMessage += `\n\n🎊 НОВЫЙ УРОВЕНЬ!\n`;
        rewardMessage += `Уровень ${levelUp.newLevel}`;
        if (levelUp.levelConfig?.title) {
          rewardMessage += ` • ${levelUp.levelConfig.title}`;
        }
        if (rewards.levelUpCoins && rewards.levelUpCoins > 0) {
          rewardMessage += `\n🎁 Бонус за уровень: +${rewards.levelUpCoins} монет`;
        }
      }
    } else {
      rewardMessage += `Вы заработали ${newTotalPoints} очков!`;
    }

    await showAlert(rewardMessage);
    navigate(ROUTES.quests);
  } else {
    // Переход к следующей точке
    await questService.updateProgress(progress.id, nextPointIndex, newTotalPoints);

    const nextPoint = quest.points[nextPointIndex];
    setCurrentPoint(nextPoint);
    setProgress({
      ...progress,
      current_point: nextPointIndex,
      total_points: newTotalPoints,
    });
    setShowHint(false);
    setShowExcursion(true);
    setMapCenter([nextPoint.latitude, nextPoint.longitude]);

    await showAlert(
      answerData?.isCorrect
        ? `✅ Правильно!\n\n+${pointsEarned} очков!\nПереходите к следующей точке.`
        : `❌ Неправильно\n\nПереходите к следующей точке.`
    );
  }
};

  const handleOpenMaps = () => {
    if (!currentPoint) return;

    hapticFeedback.impact('medium');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentPoint.latitude},${currentPoint.longitude}`;
    window.open(url, '_blank');
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${meters} м`;
    return `${(meters / 1000).toFixed(1)} км`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${colors.surfaceAlt}`,
            borderTopColor: colors.primary,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </Layout>
    );
  }

  if (!quest || !currentPoint || !progress) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: `${spacing.md}px`,
        }}>
          <Target size={64} color={colors.textLight} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: colors.textSecondary }}>
            Ошибка загрузки квеста
          </p>
        </div>
      </Layout>
    );
  }

  const mapHeight = window.innerHeight * 0.45;
  const panelHeight = window.innerHeight * 0.55;

  return (
    <Layout>
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* Карта */}
        <div style={{ height: `${mapHeight}px` }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
                      
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        // Убрали attribution полностью
                      />

            {/* Линия маршрута */}
            {quest.points.length > 1 && (
              <Polyline
                positions={quest.points.map((p) => [p.latitude, p.longitude])}
                color={colors.primary}
                opacity={0.5}
                weight={3}
                dashArray="10, 5"
              />
            )}

            {/* Текущая точка */}
            <Marker
              position={[currentPoint.latitude, currentPoint.longitude]}
              icon={createCustomIcon(isInRange ? colors.success : colors.primary, true, 'flag')}
            />

            <Circle
              center={[currentPoint.latitude, currentPoint.longitude]}
              radius={GEOLOCATION_RADIUS}
              pathOptions={{
                color: isInRange ? colors.success : colors.primary,
                fillColor: isInRange ? colors.success : colors.primary,
                fillOpacity: 0.15,
                opacity: 0.5,
              }}
            />

            {/* Остальные точки */}
            {quest.points.map((point, index) => {
              if (point.id === currentPoint.id) return null;
              const isPassed = index < progress.current_point;

              return (
                <Marker
                  key={point.id}
                  position={[point.latitude, point.longitude]}
                  icon={createCustomIcon(
                    isPassed ? colors.success : colors.border,
                    false,
                    isPassed ? 'check' : 'number',
                    isPassed ? undefined : String(index + 1)
                  )}
                  opacity={isPassed ? 0.6 : 0.3}
                />
              );
            })}

            {/* Местоположение пользователя */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={20}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Прогресс */}
        <div style={{
          position: 'absolute',
          top: spacing.lg,
          left: spacing.lg,
          right: spacing.lg,
          zIndex: 1000,
        }}>
          <GlassPanel padding={spacing.md}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: `${spacing.sm}px`,
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                Точка {progress.current_point + 1} из {quest.points.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} color={colors.warning} weight="fill" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text }}>
                  {progress.total_points}
                </span>
              </div>
            </div>
            <div style={{
              height: '6px',
              background: colors.border,
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(progress.current_point / quest.points.length) * 100}%`,
                background: `linear-gradient(90deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </GlassPanel>
        </div>

        {/* Дистанция */}
        <div style={{
          position: 'absolute',
          top: spacing.lg + 70,
          left: spacing.lg,
          right: spacing.lg,
          zIndex: 1000,
        }}>
          <div
            onClick={handleOpenMaps}
            style={{
              padding: `${spacing.md}px ${spacing.lg}px`,
              borderRadius: '999px',
              background: isInRange
                ? `linear-gradient(135deg, ${colors.success}, ${colors.success}99)`
                : `linear-gradient(135deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${spacing.sm}px`,
            }}>
              {isInRange ? (
                <>
                  <CheckCircle size={22} color="#FFFFFF" weight="fill" />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                    Вы на месте!
                  </span>
                </>
              ) : (
                <>
                  <NavigationArrow size={22} color="#FFFFFF" weight="fill" />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                    {formatDistance(distance)}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                    • построить маршрут
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Панель с заданием */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${panelHeight}px`,
          background: colors.background,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          overflowY: 'auto',
        }}>
          <div style={{ padding: `${spacing.lg}px ${spacing.lg}px ${spacing.xxl}px` }}>
            {/* Хедер задания */}
            <div style={{ marginBottom: `${spacing.md}px` }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.text,
                marginBottom: `${spacing.xs}px`,
              }}>
                {currentPoint.title}
              </h2>

              {currentPoint.description && (
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: `${spacing.sm}px`,
                }}>
                  {currentPoint.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} color={colors.warning} weight="fill" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textSecondary }}>
                    {currentPoint.points} очков
                  </span>
                </div>
              </div>
            </div>

            {/* Экскурсия */}
            {currentPoint.excursion_text && showExcursion && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: `${spacing.md}px`,
                padding: `${spacing.md}px`,
                borderRadius: '12px',
                background: colors.primary + '15',
                borderLeft: `4px solid ${colors.primary}`,
                marginBottom: `${spacing.md}px`,
              }}>
                <Book size={18} color={colors.primary} weight="fill" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: `${spacing.xs}px`,
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
                      Экскурсия
                    </span>
                    <X
                      size={18}
                      color={colors.textSecondary}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowExcursion(false)}
                    />
                  </div>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: colors.textSecondary,
                    margin: 0,
                  }}>
                    {currentPoint.excursion_text}
                  </p>
                </div>
              </div>
            )}

            {/* Подсказка */}
            {currentPoint.hint && (
              <div style={{ marginBottom: `${spacing.md}px` }}>
                {showHint ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: `${spacing.md}px`,
                    padding: `${spacing.md}px`,
                    borderRadius: '12px',
                    background: colors.warning + '15',
                    borderLeft: `4px solid ${colors.warning}`,
                  }}>
                    <Lightbulb
                      size={18}
                      color={colors.warning}
                      weight="fill"
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.text,
                        marginBottom: `${spacing.xs}px`,
                      }}>
                        Подсказка
                      </span>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: colors.textSecondary,
                        margin: 0,
                      }}>
                        {currentPoint.hint}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      hapticFeedback.impact('light');
                      setShowHint(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: `${spacing.sm}px`,
                      padding: `${spacing.md}px`,
                      borderRadius: '12px',
                      background: colors.warning + '15',
                      border: `2px dashed ${colors.warning}`,
                      cursor: 'pointer',
                    }}
                  >
                    <Lightbulb size={18} color={colors.warning} weight="fill" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: colors.warning }}>
                      Показать подсказку
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Задание или блокировка */}
            {isInRange ? (
              <TaskComponent point={currentPoint} onComplete={handleTaskComplete} />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: `${spacing.xl}px`,
                gap: `${spacing.md}px`,
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '36px',
                  background: colors.surfaceAlt,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <LockKey size={32} color={colors.textLight} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 600, color: colors.textSecondary }}>
                  Задание заблокировано
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: colors.textLight,
                  textAlign: 'center',
                  lineHeight: '20px',
                }}>
                  Подойдите к точке маршрута
                  <br />
                  (в радиусе {GEOLOCATION_RADIUS} метров)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .custom-marker {
            background: none !important;
            border: none !important;
          }

          .leaflet-container {
            font-family: inherit;
          }
            /* Скрываем атрибуцию Leaflet */
          .leaflet-control-attribution {
            display: none !important;
          }
        `}
      </style>
    </Layout>
  );
};