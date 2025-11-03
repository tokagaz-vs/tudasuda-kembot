interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // в миллисекундах
}

class CacheService {
  private readonly storage = window.localStorage;
  private readonly prefix = 'tudasuda_cache_';

  /**
   * Установить значение в кэш
   */
  set<T>(key: string, data: T, expiresIn: number = 3600000): void {
    // expiresIn по умолчанию 1 час
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Получить значение из кэша
   */
  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Проверяем срок действия
      const now = Date.now();
      if (now - entry.timestamp > entry.expiresIn) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Удалить значение из кэша
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Получить размер кэша
   */
  getSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(this.storage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const item = this.storage.getItem(key);
          if (item) {
            size += item.length;
          }
        }
      });
      return size;
    } catch (error) {
      console.error('Cache get size error:', error);
      return 0;
    }
  }

  /**
   * Получить все ключи кэша
   */
  getKeys(): string[] {
    try {
      const keys = Object.keys(this.storage);
      return keys
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Cache get keys error:', error);
      return [];
    }
  }

  /**
   * Проверить наличие ключа в кэше
   */
  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }
}

export const cacheService = new CacheService();