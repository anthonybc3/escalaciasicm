import React, { useState } from 'react';
import { Church } from '../types';
import { Plus, Trash2, Edit2, Check, X, Building2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function ChurchManager() {
  const { churches, addChurch, updateChurch, deleteChurch } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newChurchName, setNewChurchName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newChurchName.trim()) return;
    const result = await addChurch({
      id: crypto.randomUUID(),
      name: newChurchName.trim()
    });
    
    if (result && !result.success) {
      alert(result.error);
      return;
    }

    setNewChurchName('');
    setIsAdding(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const church = churches.find(c => c.id === id);
    if (church) {
      const result = await updateChurch({ ...church, name: editName.trim() });
      if (result && !result.success) {
        alert(result.error);
        return;
      }
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-navy" />
            Igrejas Cadastradas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as igrejas que têm acesso ao sistema
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-darknavy transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Igreja
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome da Igreja</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isAdding && (
                <tr className="bg-brand-cream/30">
                  <td className="px-6 py-4">
                    <input
                      autoFocus
                      type="text"
                      value={newChurchName}
                      onChange={(e) => setNewChurchName(e.target.value)}
                      placeholder="Nome da nova igreja"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-navy focus:border-brand-navy"
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdd}
                        disabled={!newChurchName.trim()}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setNewChurchName('');
                        }}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {churches.map((church) => (
                <tr key={church.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === church.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-navy focus:border-brand-navy"
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(church.id)}
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{church.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === church.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(church.id)}
                          disabled={!editName.trim()}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                        <button
                          onClick={() => {
                            setEditingId(church.id);
                            setEditName(church.name);
                          }}
                          className="p-1.5 text-gray-400 hover:text-brand-navy hover:bg-brand-cream rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta igreja? Isso removerá o acesso dos usuários atrelados a ela.')) {
                              deleteChurch(church.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {churches.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma igreja cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
