import React, { useState } from 'react';
import { CategoryDefinition, ResearchItem } from '../types/research';
import { X, Plus, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDefinition[];
  onUpdateCategories: (newCategories: CategoryDefinition[]) => void;
  researchItems: ResearchItem[];
  onReassignCategory: (oldCatId: string, newCatId: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
  researchItems,
  onReassignCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim().toUpperCase();
    if (!trimmed) return;
    if (categories.some((c) => c.id === trimmed)) return;

    playTactileClick();
    onUpdateCategories([...categories, { id: trimmed, label: trimmed, isCustom: true }]);
    setNewCatName('');
  };

  const handleStartEdit = (cat: CategoryDefinition) => {
    setEditingCatId(cat.id);
    setEditingLabel(cat.label);
  };

  const handleSaveEdit = (catId: string) => {
    const trimmed = editingLabel.trim().toUpperCase();
    if (!trimmed) return;
    playTactileClick();

    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, label: trimmed, id: trimmed } : c))
    );
    if (catId !== trimmed) {
      onReassignCategory(catId, trimmed);
    }
    setEditingCatId(null);
  };

  const handleDelete = (catId: string) => {
    if (catId === 'ALL') return;
    playTactileClick();
    onUpdateCategories(categories.filter((c) => c.id !== catId));
    onReassignCategory(catId, 'FOOD SYSTEMS');
  };

  const getItemCount = (catId: string) => {
    if (catId === 'ALL') return researchItems.length;
    return researchItems.filter(
      (item) => item.category === catId || item.secondaryCategories?.includes(catId)
    ).length;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Category Taxonomies Manager"
    >
      <div className="relative w-full max-w-xl bg-[#F4F2ED] text-[#141414] border border-[#141414]/25 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-[#EDEBE6]">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#77736B]">
            <span className="text-[#141414] font-bold">RESEARCH COLLECTIONS & CATEGORIES</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#1F3FB0]">TAXONOMY BUILDER</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            aria-label="Close Category Manager"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Add New Category Input */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. AGROECOLOGY, BIOECONOMY, NEUROSCIENCE"
              className="flex-1 p-2 bg-white border border-[#141414]/25 text-xs font-mono uppercase focus:border-[#1F3FB0] focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-bold flex items-center gap-1.5 hover:bg-[#19328D] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD CATEGORY</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block">
              ACTIVE ARCHIVE TABS ({categories.length})
            </span>
            <div className="divide-y divide-[#141414]/10 border border-[#141414]/15 bg-white">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;
                const count = getItemCount(cat.id);
                const isAll = cat.id === 'ALL';

                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          className="flex-1 p-1 bg-stone-50 border border-[#1F3FB0] text-xs font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 text-[#77736B] hover:bg-stone-100 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#141414]">{cat.label}</span>
                          <span className="text-[10px] text-[#77736B] bg-[#EDEBE6] px-1.5 py-0.5 border border-[#141414]/10">
                            {count} {count === 1 ? 'article' : 'articles'}
                          </span>
                          {cat.isCustom && (
                            <span className="text-[9px] text-[#1F3FB0] font-semibold">CUSTOM</span>
                          )}
                        </div>

                        {!isAll && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEdit(cat)}
                              className="p-1 text-[#77736B] hover:text-[#1F3FB0] hover:bg-stone-100 cursor-pointer"
                              title="Rename Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#141414]/15 bg-[#EDEBE6] flex items-center justify-between text-[11px] font-mono text-[#77736B]">
          <span>Changes are preserved automatically on your shelf.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
