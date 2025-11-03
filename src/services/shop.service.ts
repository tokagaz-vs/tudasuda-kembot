import { supabase } from './supabase';
import type { ShopItem } from '@/types'; // ✅ ИСПРАВЛЕНО: удален UserInventoryItem

class ShopService {
  /**
   * Получить все товары магазина
   */
  async getShopItems() {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('price_coins');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get shop items error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить товары по категории
   */
  async getItemsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('category', category)
        .eq('is_available', true)
        .order('price_coins');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get items by category error:', error);
      return { data: null, error };
    }
  }

  /**
   * Купить товар
   */
  async purchaseItem(userId: string, itemId: string) {
    try {
      // Получаем товар
      const { data: item, error: itemError } = await supabase
        .from('shop_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError || !item) throw new Error('Item not found');

      // Получаем пользователя
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('coins, level')
        .eq('id', userId)
        .single();

      if (userError || !user) throw new Error('User not found');

      // Проверяем уровень
      if (user.level < item.required_level) {
        return { data: null, error: `Требуется ${item.required_level} уровень` };
      }

      // Проверяем достаточно ли монет
      if (user.coins < item.price_coins) {
        return { data: null, error: 'Недостаточно монет' };
      }

      // Списываем монеты
      const { error: updateError } = await supabase
        .from('users')
        .update({ coins: user.coins - item.price_coins })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Добавляем в инвентарь или увеличиваем количество
      const { data: existingItem } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (existingItem) {
        await supabase
          .from('user_inventory')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        const expiresAt = item.duration
          ? new Date(Date.now() + item.duration * 60000).toISOString()
          : null;

        await supabase
          .from('user_inventory')
          .insert({
            user_id: userId,
            item_id: itemId,
            quantity: 1,
            expires_at: expiresAt,
          });
      }

      // Записываем транзакцию
      await supabase.from('transactions').insert({
        user_id: userId,
        transaction_type: 'shop_purchase',
        coins_change: -item.price_coins,
        description: `Покупка: ${item.name}`,
        metadata: { item_id: itemId },
      });

      return { data: { success: true }, error: null };
    } catch (error: any) {
      console.error('Purchase item error:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Получить инвентарь пользователя
   */
  async getUserInventory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          item:shop_items(*)
        `)
        .eq('user_id', userId)
        .order('acquired_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get user inventory error:', error);
      return { data: null, error };
    }
  }

  /**
   * Использовать предмет
   */
  async useItem(userId: string, inventoryItemId: string) {
    try {
      // Получаем предмет из инвентаря
      const { data: inventoryItem, error: invError } = await supabase
        .from('user_inventory')
        .select('*, item:shop_items(*)')
        .eq('id', inventoryItemId)
        .eq('user_id', userId)
        .single();

      if (invError || !inventoryItem) throw new Error('Item not found');

      const item = inventoryItem.item as ShopItem;
      const effects = item.effects as any;

      // Применяем эффекты
      if (effects.energy) {
        const { data: user } = await supabase
          .from('users')
          .select('energy, max_energy')
          .eq('id', userId)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              energy: Math.min(user.energy + effects.energy, user.max_energy),
            })
            .eq('id', userId);
        }
      }

      // Уменьшаем количество или удаляем
      if (inventoryItem.quantity > 1) {
        await supabase
          .from('user_inventory')
          .update({ quantity: inventoryItem.quantity - 1 })
          .eq('id', inventoryItemId);
      } else {
        await supabase
          .from('user_inventory')
          .delete()
          .eq('id', inventoryItemId);
      }

      return { data: { success: true, effects }, error: null };
    } catch (error: any) {
      console.error('Use item error:', error);
      return { data: null, error: error.message };
    }
  }
}

export const shopService = new ShopService();