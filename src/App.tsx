/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ChefHat, 
  Clock, 
  Star, 
  Flame, 
  Video, 
  X, 
  Save, 
  Trash2, 
  ChevronRight,
  UtensilsCrossed,
  ArrowLeft,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Recipe } from './types';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Recipe>({
    name: '',
    ingredients: '',
    instructions: '',
    difficulty: 3,
    time_minutes: 30,
    flavor: '',
    image_data: '',
    video_url: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_data: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `/api/recipes/${formData.id}` : '/api/recipes';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchRecipes();
        setIsAdding(false);
        setFormData({
          name: '',
          ingredients: '',
          instructions: '',
          difficulty: 3,
          time_minutes: 30,
          flavor: '',
          image_data: '',
          video_url: ''
        });
      } else {
        const errorData = await res.json();
        alert(`保存失败: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('Failed to save recipe:', err);
      alert('保存失败，请检查网络或图片大小。');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个菜谱吗？')) return;
    try {
      await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      fetchRecipes();
      setSelectedRecipe(null);
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  const DifficultyStars = ({ count }: { count: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={14} 
          className={s <= count ? "fill-brand-accent text-brand-accent" : "text-gray-300"} 
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-6 py-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg">
            <ChefHat size={32} />
          </div>
          <h1 className="serif text-5xl font-medium tracking-tight">Chef's Table</h1>
          <p className="text-brand-accent/70 serif italic text-xl">私家厨房 · 诚意款待</p>
        </motion.div>
      </header>

      {/* Admin Toggle */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({
                name: '',
                ingredients: '',
                instructions: '',
                difficulty: 3,
                time_minutes: 30,
                flavor: '',
                image_data: '',
                video_url: ''
              });
              setIsAdding(true);
            }}
            className="w-14 h-14 bg-brand-accent text-white rounded-full shadow-xl flex items-center justify-center"
          >
            <Plus size={28} />
          </motion.button>
        )}
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className="px-4 py-2 bg-white/80 backdrop-blur border border-brand-accent/20 rounded-full text-xs font-medium uppercase tracking-widest shadow-sm hover:bg-white transition-colors"
        >
          {isAdmin ? '退出管理' : '管理菜谱'}
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedRecipe(recipe)}
                className="group cursor-pointer bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={recipe.image_data || `https://picsum.photos/seed/${recipe.name}/600/450`} 
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] uppercase font-bold tracking-wider text-brand-accent">
                    {recipe.flavor || '家常'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="serif text-2xl mb-2 group-hover:text-brand-accent transition-colors">{recipe.name}</h3>
                  <div className="flex items-center justify-between text-xs text-brand-accent/60 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{recipe.time_minutes} min</span>
                    </div>
                    <DifficultyStars count={recipe.difficulty} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-brand-bg/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-6 py-12">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="mb-8 flex items-center gap-2 text-brand-accent hover:gap-3 transition-all font-medium"
              >
                <ArrowLeft size={20} />
                <span>返回菜单</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <img 
                    src={selectedRecipe.image_data || `https://picsum.photos/seed/${selectedRecipe.name}/800/1000`} 
                    alt={selectedRecipe.name}
                    className="w-full aspect-[3/4] object-cover rounded-[40px] shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="serif text-5xl">{selectedRecipe.name}</h2>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setFormData(selectedRecipe);
                            setIsAdding(true);
                            setSelectedRecipe(null);
                          }}
                          className="p-2 hover:bg-brand-accent/10 rounded-full transition-colors"
                        >
                          <UtensilsCrossed size={20} className="text-brand-accent" />
                        </button>
                        <button 
                          onClick={() => handleDelete(selectedRecipe.id!)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={20} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand-accent/10 shadow-sm">
                      <Clock size={16} className="text-brand-accent" />
                      <span className="text-sm font-medium">{selectedRecipe.time_minutes} 分钟</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand-accent/10 shadow-sm">
                      <Flame size={16} className="text-brand-accent" />
                      <span className="text-sm font-medium">{selectedRecipe.flavor}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand-accent/10 shadow-sm">
                      <Star size={16} className="text-brand-accent" />
                      <DifficultyStars count={selectedRecipe.difficulty} />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="serif text-xl mb-3 border-b border-brand-accent/20 pb-2">所需食材</h4>
                    <p className="text-brand-accent/80 leading-relaxed whitespace-pre-wrap">
                      {selectedRecipe.ingredients}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h4 className="serif text-xl mb-3 border-b border-brand-accent/20 pb-2">烹饪步骤</h4>
                    <p className="text-brand-accent/80 leading-relaxed whitespace-pre-wrap">
                      {selectedRecipe.instructions}
                    </p>
                  </div>

                  {selectedRecipe.video_url && (
                    <a 
                      href={selectedRecipe.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-auto flex items-center justify-center gap-3 bg-brand-accent text-white py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
                    >
                      <Video size={20} />
                      <span className="font-medium">观看教学视频</span>
                    </a>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="serif text-3xl">{formData.id ? '编辑菜谱' : '添加新菜谱'}</h2>
                  <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">菜品名称</label>
                      <input 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">口味 (如: 鲜香、麻辣)</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                        value={formData.flavor}
                        onChange={e => setFormData({...formData, flavor: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">准备时间 (分钟)</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                        value={formData.time_minutes}
                        onChange={e => setFormData({...formData, time_minutes: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">难易程度 (1-5星)</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: parseInt(e.target.value)})}
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} 星</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">所需食材</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                      value={formData.ingredients}
                      onChange={e => setFormData({...formData, ingredients: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">烹饪步骤</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                      value={formData.instructions}
                      onChange={e => setFormData({...formData, instructions: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">菜品照片</label>
                      <div className="flex flex-col gap-4">
                        {formData.image_data && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-brand-accent/10">
                            <img src={formData.image_data} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, image_data: '' }))}
                              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brand-accent/20 rounded-xl cursor-pointer hover:bg-brand-bg/50 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-brand-accent/40 mb-2" />
                            <p className="text-sm text-brand-accent/60">点击或拖拽上传图片</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent/60 mb-2">视频链接</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-brand-accent/10 bg-brand-bg/30 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                        value={formData.video_url}
                        onChange={e => setFormData({...formData, video_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-brand-accent text-white py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 font-bold"
                  >
                    <Save size={20} />
                    保存菜谱
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
