import { supabase } from './supabase';

class CategoryService {
  /**
   * Получить все категории
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('quest_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get categories error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить категорию по ID
   */
  async getCategoryById(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('quest_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get category by ID error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить квесты по категории
   */
  async getQuestsByCategory(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select(`
          *,
          category:quest_categories(*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get quests by category error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить статистику по категориям
   */
  async getCategoriesStats() {
    try {
      const { data: categories } = await this.getCategories();
      
      if (!categories) return { data: null, error: 'No categories found' };

      const statsPromises = categories.map(async (category) => {
        const { count } = await supabase
          .from('quests')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_active', true);

        return {
          ...category,
          questCount: count || 0,
        };
      });

      const stats = await Promise.all(statsPromises);
      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Get categories stats error:', error);
      return { data: null, error };
    }
  }
}

export const categoryService = new CategoryService();