import { useState, useEffect } from 'react';
import { cacheService } from '@/services/cache.service';

interface UseCachedDataOptions {
  cacheKey: string;
  fetchFn: () => Promise<any>;
  expiresIn?: number; // в миллисекундах
  enabled?: boolean;
}

export const useCachedData = <T>({
  cacheKey,
  fetchFn,
  expiresIn = 3600000, // 1 час по умолчанию
  enabled = true,
}: UseCachedDataOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    loadData();
  }, [cacheKey, enabled]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Пытаемся получить из кэша
      const cachedData = cacheService.get<T>(cacheKey);
      
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
        setIsLoading(false);
        
        // Обновляем в фоне
        fetchAndCache();
      } else {
        // Загружаем с сервера
        await fetchAndCache();
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  const fetchAndCache = async () => {
    try {
      const result = await fetchFn();
      
      // Сохраняем в кэш
      cacheService.set(cacheKey, result, expiresIn);
      
      setData(result);
      setIsFromCache(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Fetch and cache error:', err);
      
      // Если есть кэш, используем его даже при ошибке
      const cachedData = cacheService.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      } else {
        setError(err);
      }
      
      setIsLoading(false);
    }
  };

  const refetch = () => {
    setIsFromCache(false);
    loadData();
  };

  const clearCache = () => {
    cacheService.remove(cacheKey);
    setData(null);
    setIsFromCache(false);
  };

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refetch,
    clearCache,
  };
};