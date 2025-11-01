import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { questService } from '@/services/quest.service';
import { Quest } from '@/types';
import { CATEGORY_CONFIG } from '@/constants';

declare global {
  interface Window {
    google: any;
  }
}

const DEFAULT_CENTER = { lat: 55.7558, lng: 37.6173 }; // Москва

async function loadGoogleMaps(apiKey?: string): Promise<void> {
  if (window.google && window.google.maps) return;
  if (!apiKey) throw new Error('Google Maps API key is not set');

  const existing = document.querySelector('script[data-google-maps]');
  if (existing) {
    await new Promise<void>((resolve) => {
      (existing as HTMLScriptElement).addEventListener('load', () => resolve());
      (existing as HTMLScriptElement).addEventListener('readystatechange', () => resolve());
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.setAttribute('data-google-maps', '1');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

export const MapPage: React.FC = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    quests.forEach((q) => q.category && set.add(q.category));
    return Array.from(set);
  }, [quests]);

  const initMap = useCallback(
    (center: { lat: number; lng: number }) => {
      if (!mapRef.current) return;
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1f2430' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1f2430' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8f9bb3' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8f9bb3' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e2a38' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3446' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1c2330' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#16202f' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8f9bb3' }] },
        ],
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();
    },
    []
  );

  const addMarkers = useCallback(
    (list: Quest[]) => {
      if (!mapInstanceRef.current) return;

      // Clear existing
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();

      list.forEach((q) => {
        if (q.latitude == null || q.longitude == null) return;

        const catCfg = CATEGORY_CONFIG[q.category as keyof typeof CATEGORY_CONFIG];
        const marker = new window.google.maps.Marker({
          position: { lat: Number(q.latitude), lng: Number(q.longitude) },
          map: mapInstanceRef.current,
          title: q.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: catCfg?.color || '#FF6A00',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          const content = `
            <div style="min-width:180px">
              <div style="font-weight:700;margin-bottom:4px">${q.title}</div>
              <div style="font-size:12px;color:#8f9bb3;margin-bottom:8px">
                ${(q.short_description || '').slice(0, 80)}
              </div>
              <a href="/quests/${q.id}" style="display:inline-block;padding:6px 10px;background:#FF6A00;color:#fff;border-radius:8px;text-decoration:none;font-size:12px">Открыть</a>
            </div>
          `;
          infoWindowRef.current?.setContent(content);
          infoWindowRef.current?.open(mapInstanceRef.current, marker);
        });

        markersRef.current.set(q.id, marker);
      });
    },
    []
  );

  const applyCategoryFilter = useCallback(() => {
    if (selectedCategory) {
      quests.forEach((q) => {
        const marker = markersRef.current.get(q.id);
        if (!marker) return;
        if (q.category === selectedCategory) marker.setMap(mapInstanceRef.current);
        else marker.setMap(null);
      });
    } else {
      // Show all
      markersRef.current.forEach((marker) => {
        marker.setMap(mapInstanceRef.current);
      });
    }
  }, [selectedCategory, quests]);

  useEffect(() => {
    applyCategoryFilter();
  }, [applyCategoryFilter]);

  useEffect(() => {
    (async () => {
      try {
        await loadGoogleMaps(apiKey);
      } catch (e: any) {
        setError('Не удалось загрузить Google Maps. Добавьте VITE_GOOGLE_MAPS_API_KEY в .env.');
        setIsLoading(false);
        return;
      }

      // Try geolocation
      const setCenterAndInit = (center: { lat: number; lng: number }) => {
        initMap(center);
        setUserPos(center);
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCenterAndInit({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => setCenterAndInit(DEFAULT_CENTER),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setCenterAndInit(DEFAULT_CENTER);
      }

      const list = await questService.getActiveQuests(200, 0);
      setQuests(list);
      addMarkers(list);
      setIsLoading(false);
    })();
  }, [apiKey, initMap, addMarkers]);

  const recenterToUser = () => {
    if (!userPos || !mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(userPos);
    mapInstanceRef.current.setZoom(13);
  };

  return (
    <Layout>
      <div style={{ position: 'relative', height: 'calc(100vh - 80px)' }}>
        {/* Map container */}
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: colors.surface }} />

        {/* Top filter panel */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            gap: `${spacing.sm}px`,
            padding: `${spacing.sm}px`,
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.lg,
            backdropFilter: 'blur(6px)',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: `${spacing.sm}px ${spacing.md}px`,
              borderRadius: '999px',
              border: `2px solid ${!selectedCategory ? colors.primary : colors.border}`,
              background: !selectedCategory ? colors.primary : colors.surface,
              color: !selectedCategory ? '#FFFFFF' : colors.text,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Все
          </button>
          {categories.map((c) => {
            const cfg = CATEGORY_CONFIG[c as keyof typeof CATEGORY_CONFIG];
            const active = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(active ? null : c)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: `${spacing.xs}px`,
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  borderRadius: '999px',
                  border: `2px solid ${active ? (cfg?.color || colors.primary) : colors.border}`,
                  background: active ? (cfg?.color || colors.primary) : colors.surface,
                  color: active ? '#FFFFFF' : colors.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{cfg?.icon || '🎯'}</span>
                <span>{cfg ? c : c}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom control panel */}
        <div
          style={{
            position: 'absolute',
            left: '12px',
            right: '12px',
            bottom: '12px',
            display: 'flex',
            gap: `${spacing.sm}px`,
          }}
        >
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
              <div>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: `${spacing.xs}px` }}>
                  Квестов на карте
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>
                  {selectedCategory ? quests.filter((q) => q.category === selectedCategory).length : quests.length}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <Button variant="outline" onClick={recenterToUser}>
                Моё положение
              </Button>
            </div>
          </Card>
        </div>

        {/* Error overlay */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '420px',
              width: '90%',
            }}
          >
            <Card padding="lg">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: `${spacing.md}px` }}>🗺️</div>
                <h3 style={{ ...typography.h4, marginBottom: `${spacing.xs}px` }}>
                  Карта недоступна
                </h3>
                <p style={{ color: colors.textSecondary, margin: 0 }}>{error}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && !error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                border: `4px solid ${colors.surfaceAlt}`,
                borderTopColor: colors.primary,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};