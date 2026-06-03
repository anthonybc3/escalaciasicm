import React, { useState } from 'react';
import { Church } from '../types';
import { Plus, Trash2, Edit2, Check, X, Building2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TeacherManager } from './TeacherManager';
import { ClassManager } from './ClassManager';

interface Props {
  appStore: ReturnType<typeof useAppStore>;
}

export function ChurchManager({ appStore }: Props) {
  const { churches, addChurch, updateChurch, deleteChurch, currentUser, teachers, addTeacher, updateTeacher, removeTeacher, classes, addClass, updateClass, removeClass } = appStore;
  
  const isAdmin = currentUser?.role === 'ADMIN';
  const visibleChurches = isAdmin 
    ? churches 
    : churches.filter(c => currentUser?.managedChurchIds?.includes(c.id) || c.id === currentUser?.churchId);

  const [isAdding, setIsAdding] = useState(false);
  const [newChurchName, setNewChurchName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, 'classes' | 'teachers'>>({});

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-navy" />
            Igrejas Cadastradas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as igrejas e suas respectivas professoras.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-darknavy transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Igreja
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome da Igreja</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center w-32">Professoras</th>
                {isAdmin && <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right w-32">Ações</th>}
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
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
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

              {visibleChurches.map((church) => {
                const churchTeachers = teachers.filter(t => t.churchId === church.id);
                const churchClasses = classes.filter(c => c.churchId === church.id);
                const isExpanded = expandedId === church.id;

                return (
                  <React.Fragment key={church.id}>
                    <tr className={`transition-colors cursor-pointer ${isExpanded ? 'bg-brand-navy/5' : 'hover:bg-gray-50'}`} onClick={() => setExpandedId(isExpanded ? null : church.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          {editingId === church.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-navy focus:border-brand-navy"
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdate(church.id)}
                            />
                          ) : (
                            <div className="font-semibold text-gray-900">{church.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-brand-navy">
                          <Users className="w-3.5 h-3.5" />
                          {churchTeachers.length}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          {editingId === church.id ? (
                            <div className="flex justify-end gap-2">
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
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
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
                      )}
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={isAdmin ? 3 : 2} className="p-0 border-b border-gray-200">
                          <div className="bg-gray-50/50 p-6 border-t border-gray-100 shadow-inner">
                            <div className="flex gap-4 mb-6 border-b border-gray-200">
                              <button
                                onClick={() => setActiveTabs(prev => ({ ...prev, [church.id]: 'classes' }))}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                  (activeTabs[church.id] || 'classes') === 'classes'
                                    ? 'border-brand-navy text-brand-navy'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Classes
                              </button>
                              <button
                                onClick={() => setActiveTabs(prev => ({ ...prev, [church.id]: 'teachers' }))}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                  activeTabs[church.id] === 'teachers'
                                    ? 'border-brand-navy text-brand-navy'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Professoras
                              </button>
                            </div>

                            {(activeTabs[church.id] || 'classes') === 'classes' ? (
                              <ClassManager 
                                classes={churchClasses}
                                onAdd={(c) => addClass({ ...c, churchId: church.id })}
                                onUpdate={(c) => updateClass({ ...c, churchId: church.id })}
                                onRemove={removeClass}
                              />
                            ) : (
                              <TeacherManager 
                                teachers={churchTeachers}
                                classes={churchClasses}
                                onAdd={(t) => addTeacher({ ...t, churchId: church.id })}
                                onUpdate={(t) => updateTeacher({ ...t, churchId: church.id })}
                                onRemove={removeTeacher}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {visibleChurches.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={isAdmin ? 3 : 2} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma igreja vinculada ou cadastrada.
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
