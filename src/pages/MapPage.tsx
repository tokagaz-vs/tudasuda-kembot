import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layout } from '@/components/layout';
import { Card, GlassPanel } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { questService } from '@/services/quest.service';
import { Quest, QuestCategory, QuestPoint } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { 
  X, 
  NavigationArrow, 
  Star, 
  Clock, 
  MapPin as MapPinIcon,
  ArrowRight,
  Target,
  Lightning,
} from '@phosphor-icons/react';

// Дефолтные координаты (Кемерово)
const DEFAULT_CENTER: [number, number] = [55.3547, 86.0872];

// Компонент для центрирования карты
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Легко', color: '#10B981', icon: '🟢' },
  medium: { label: 'Средне', color: '#F59E0B', icon: '🟡' },
  hard: { label: 'Сложно', color: '#EF4444', icon: '🔴' },
};

export const MapPage: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const navigate = useNavigate();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [categories, setCategories] = useState<QuestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questPoints, setQuestPoints] = useState<Map<string, QuestPoint[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [showCategoryQuests, setShowCategoryQuests] = useState(false);

  useEffect(() => {
    loadData();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterQuests();
  }, [selectedCategory, quests]);

  const loadData = async () => {
    await Promise.all([loadCategories(), loadQuests()]);
    setIsLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await questService.getCategories();
    if (data) setCategories(data);
  };

  const loadQuests = async () => {
    const { data } = await questService.getQuests();
    if (data) {
      setQuests(data);
      const pointsMap = new Map<string, QuestPoint[]>();
      for (const quest of data) {
        const { data: questData } = await questService.getQuestById(quest.id);
        if (questData) pointsMap.set(quest.id, questData.points);
      }
      setQuestPoints(pointsMap);
    }
  };

  const filterQuests = () => {
    setFilteredQuests(
      selectedCategory 
        ? quests.filter((q) => q.category?.id === selectedCategory)
        : quests
    );
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    hapticFeedback.impact('light');
    setSelectedCategory(categoryId);
    setSelectedQuest(null);
    
    // Показываем список квестов только если выбрана категория
    if (categoryId) {
      setShowCategoryQuests(true);
    } else {
      setShowCategoryQuests(false);
    }
  };

  const handleMarkerClick = (quest: Quest) => {
    hapticFeedback.impact('light');
    setSelectedQuest(quest);
    setShowCategoryQuests(false);
    const points = questPoints.get(quest.id);
    const first = points?.[0];
    if (first) {
      setMapCenter([first.latitude, first.longitude]);
      setMapZoom(15);
    }
  };

  const handleNavigateToUserLocation = () => {
    hapticFeedback.impact('medium');
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    }
  };

  const handleQuestClick = (quest: Quest) => {
    hapticFeedback.impact('medium');
    navigate(`${ROUTES.quests}/${quest.id}`);
  };

  const createCustomIcon = (color: string, isSelected: boolean) => {
    const size = isSelected ? 40 : 32;
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
          border: ${isSelected ? '4px' : '3px'} solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          <svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  };

  const getCategoryName = () => {
    if (!selectedCategory) return '';
    const category = categories.find(c => c.id === selectedCategory);
    return category?.name || '';
  };

  if (isLoading) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.surfaceAlt}`,
              borderTopColor: colors.primary,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ position: 'relative', height: 'calc(100vh - 60px)' }}>
        {/* Карта */}
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
          attributionControl={false} // Отключаем атрибуцию
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // Убрали attribution полностью
          />

          {/* Маркеры квестов */}
          {filteredQuests.map((quest) => {
            const points = questPoints.get(quest.id);
            if (!points || points.length === 0) return null;
            const first = points[0];
            const color = quest.category?.color || colors.primary;
            const isSelected = selectedQuest?.id === quest.id;

            return (
              <React.Fragment key={quest.id}>
                {/* Линия маршрута */}
                {points.length > 1 && (
                  <Polyline
                    positions={points.map((p) => [p.latitude, p.longitude])}
                    color={color}
                    opacity={isSelected ? 1 : 0.5}
                    weight={isSelected ? 3 : 2}
                    dashArray={isSelected ? undefined : '8, 8'}
                  />
                )}

                {/* Маркер первой точки */}
                <Marker
                  position={[first.latitude, first.longitude]}
                  icon={createCustomIcon(color, isSelected)}
                  eventHandlers={{
                    click: () => handleMarkerClick(quest),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
                        {quest.title}
                      </h4>
                      {quest.description && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          {quest.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                        <span>⭐ {quest.points_reward || 0}</span>
                        <span>📍 {points.length} точек</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Остальные точки маршрута */}
                {points.slice(1).map((point, idx) => (
                  <Circle
                    key={`${quest.id}-point-${idx}`}
                    center={[point.latitude, point.longitude]}
                    radius={50}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.3,
                      opacity: 0.6,
                    }}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* Маркер местоположения пользователя */}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.2,
              }}
            />
          )}
        </MapContainer>

        {/* Категории */}
        <div
          style={{
            position: 'absolute',
            top: spacing.lg,
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 1000,
          }}
        >
          <GlassPanel
            style={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              display: 'flex',
              gap: `${spacing.sm}px`,
            }}
            padding={spacing.md}
          >
            <div
              onClick={() => handleCategorySelect(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: `${spacing.xs}px`,
                padding: `${spacing.sm}px ${spacing.md}px`,
                borderRadius: '999px',
                background: !selectedCategory ? colors.surface : 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: !selectedCategory ? colors.text : colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
            >
              <span>Все</span>
              <div
                style={{
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  background: !selectedCategory ? colors.primary : colors.borderLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: !selectedCategory ? '#FFFFFF' : colors.textSecondary,
                  padding: '0 6px',
                }}
              >
                {quests.length}
              </div>
            </div>

            {categories.map((category) => {
              const count = quests.filter((q) => q.category?.id === category.id).length;
              const isActive = selectedCategory === category.id;

              return (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: `${spacing.xs}px`,
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    borderRadius: '999px',
                    background: isActive ? colors.surface : 'transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? colors.text : colors.textSecondary,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{category.name}</span>
                  <div
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      background: isActive ? category.color || colors.primary : colors.borderLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      padding: '0 6px',
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </GlassPanel>
        </div>

        {/* Кнопка местоположения */}
        {userLocation && (
          <div
            style={{
              position: 'absolute',
              top: spacing.lg + 70,
              right: spacing.lg,
              zIndex: 1000,
            }}
          >
            <div
              onClick={handleNavigateToUserLocation}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                background: colors.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <NavigationArrow size={22} color={colors.primary} weight="bold" />
            </div>
          </div>
        )}

        {/* Панель со списком квестов категории */}
        {showCategoryQuests && selectedCategory && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '60vh',
              zIndex: 1000,
              animation: 'slideUp 0.3s ease',
            }}
          >
            <GlassPanel padding={0} style={{ borderRadius: '20px 20px 0 0' }}>
              {/* Заголовок */}
              <div
                style={{
                  padding: `${spacing.lg}px`,
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: colors.text, margin: 0 }}>
                    {getCategoryName()}
                  </h3>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0' }}>
                    Найдено квестов: {filteredQuests.length}
                  </p>
                </div>
                <div
                  onClick={() => {
                    hapticFeedback.impact('light');
                    setShowCategoryQuests(false);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: colors.surfaceAlt,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} color={colors.textSecondary} />
                </div>
              </div>

              {/* Список квестов */}
              <div
                style={{
                  maxHeight: 'calc(60vh - 80px)',
                  overflowY: 'auto',
                  padding: `${spacing.md}px`,
                }}
              >
                {filteredQuests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: `${spacing.xxl}px ${spacing.lg}px` }}>
                    <Target size={48} color={colors.textLight} style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                      Квестов в этой категории пока нет
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
                    {filteredQuests.map((quest) => {
                      const points = questPoints.get(quest.id);
                      const difficultyInfo = DIFFICULTY_CONFIG[quest.difficulty];

                      return (
                        <Card
                          key={quest.id}
                          variant="glass"
                          onPress={() => handleQuestClick(quest)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Цветной акцент */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '4px',
                              height: '100%',
                              background: quest.category?.color || colors.primary,
                              borderRadius: '12px 0 0 12px',
                            }}
                          />

                          <div style={{ paddingLeft: `${spacing.md}px` }}>
                            {/* Заголовок */}
                            <h4
                              style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: colors.text,
                                marginBottom: `${spacing.xs}px`,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {quest.title}
                            </h4>

                            {/* Описание */}
                            {quest.description && (
                              <p
                                style={{
                                  fontSize: '13px',
                                  lineHeight: '18px',
                                  color: colors.textSecondary,
                                  marginBottom: `${spacing.sm}px`,
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

                            {/* Метрики */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: `${spacing.md}px`,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={14} color={colors.warning} weight="fill" />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>
                                  {quest.points_reward || 0}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPinIcon size={14} color={colors.textSecondary} />
                                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                                  {points?.length || 0} точек
                                </span>
                              </div>

                              {quest.estimated_duration && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={14} color={colors.textSecondary} />
                                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                                    {quest.estimated_duration} мин
                                  </span>
                                </div>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Lightning size={14} color={difficultyInfo.color} weight="fill" />
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: difficultyInfo.color,
                                  }}
                                >
                                  {difficultyInfo.label}
                                </span>
                              </div>

                              <div style={{ flex: 1 }} />
                              <ArrowRight size={18} color={colors.textLight} />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>
        )}

        {/* Карточка выбранного квеста */}
        {selectedQuest && !showCategoryQuests && (
          <div
            style={{
              position: 'absolute',
              bottom: spacing.lg,
              left: spacing.lg,
              right: spacing.lg,
              zIndex: 1000,
              animation: 'slideUp 0.3s ease',
            }}
          >
            <Card
              variant="glass"
              onPress={() => handleQuestClick(selectedQuest)}
              style={{ position: 'relative', overflow: 'visible', cursor: 'pointer' }}
            >
              {/* Цветной акцент */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: selectedQuest.category?.color || colors.primary,
                }}
              />

              {/* Кнопка закрытия */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  hapticFeedback.impact('light');
                  setSelectedQuest(null);
                }}
                style={{
                  position: 'absolute',
                  top: spacing.md,
                  right: spacing.md,
                  width: '28px',
                  height: '28px',
                  borderRadius: '14px',
                  background: colors.background,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </div>

              <div style={{ padding: `${spacing.md}px` }}>
                {selectedQuest.category && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: `${spacing.xs}px`,
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '3px',
                        background: selectedQuest.category.color || colors.primary,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: selectedQuest.category.color || colors.primary,
                      }}
                    >
                      {selectedQuest.category.name}
                    </span>
                  </div>
                )}

                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: `${spacing.xs}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedQuest.title}
                </h3>

                {selectedQuest.description && (
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
                    {selectedQuest.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${spacing.md}px`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPinIcon size={16} color={colors.textSecondary} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textSecondary }}>
                      {questPoints.get(selectedQuest.id)?.length || 0} точек
                    </span>
                  </div>

                  {selectedQuest.estimated_duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={16} color={colors.textSecondary} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textSecondary }}>
                        {selectedQuest.estimated_duration} мин
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} color={colors.warning} weight="fill" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: colors.warning }}>
                      {selectedQuest.points_reward || 0}
                    </span>
                  </div>

                  <div style={{ flex: 1 }} />
                  <ArrowRight size={20} color={colors.textLight} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {filteredQuests.length === 0 && !showCategoryQuests && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
          >
            <MapPinIcon size={48} color={colors.textLight} style={{ margin: '0 auto' }} />
            <p style={{ fontSize: '14px', color: colors.textLight, marginTop: spacing.md }}>
              Квестов не найдено
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(100%);
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

          .leaflet-container {
            font-family: inherit;
          }

          .custom-marker {
            background: none !important;
            border: none !important;
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