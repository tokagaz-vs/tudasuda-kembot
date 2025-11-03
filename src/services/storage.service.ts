import { supabase } from './supabase';

class StorageService {
  private readonly BUCKET_NAME = 'quest-photos';

  /**
   * Загрузка фото
   */
  async uploadPhoto(
    userId: string,
    questId: string,
    pointId: string,
    file: File | Blob,
    type: 'photo' | 'selfie' = 'photo'
  ): Promise<{ data: string | null; error: any }> {
    try {
      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const fileName = `${userId}/${questId}/${pointId}/${type}_${timestamp}.jpg`;

      // Конвертируем в blob если нужно
      let blob: Blob;
      if (file instanceof File) {
        blob = file;
      } else {
        blob = file;
      }

      // Загружаем файл
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return { data: urlData.publicUrl, error: null };
    } catch (error: any) {
      console.error('Upload photo error:', error);
      return { data: null, error };
    }
  }

  /**
   * Загрузка из base64
   */
  async uploadPhotoFromBase64(
    userId: string,
    questId: string,
    pointId: string,
    base64Data: string,
    type: 'photo' | 'selfie' = 'photo'
  ): Promise<{ data: string | null; error: any }> {
    try {
      // Убираем префикс data:image/...;base64,
      const base64 = base64Data.split(',')[1] || base64Data;
      
      // Конвертируем base64 в blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      return await this.uploadPhoto(userId, questId, pointId, blob, type);
    } catch (error: any) {
      console.error('Upload photo from base64 error:', error);
      return { data: null, error };
    }
  }

  /**
   * Удаление фото
   */
  async deletePhoto(photoUrl: string): Promise<{ error: any }> {
    try {
      // Извлекаем путь из URL
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-4).join('/'); // userId/questId/pointId/filename

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Delete photo error:', error);
      return { error };
    }
  }

  /**
   * Получить список фото пользователя
   */
  async getUserPhotos(userId: string): Promise<{ data: string[] | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const urls = data?.map((file) => {
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${userId}/${file.name}`);
        return urlData.publicUrl;
      }) || [];

      return { data: urls, error: null };
    } catch (error: any) {
      console.error('Get user photos error:', error);
      return { data: null, error };
    }
  }

  /**
   * Проверка существования bucket и создание если нужно
   */
  async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === this.BUCKET_NAME);

      if (!bucketExists) {
        await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        });
      }
    } catch (error) {
      console.error('Ensure bucket exists error:', error);
    }
  }
}

export const storageService = new StorageService();