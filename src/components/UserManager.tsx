import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Role, UserStatus, Church } from '../types';
import { Shield, Check, X, ShieldAlert, Building2, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  appStore: ReturnType<typeof useAppStore>;
}

export function UserManager({ appStore }: Props) {
  const { users, updateUser, currentUser, churches } = appStore;

  const isAdmin = currentUser?.role === 'ADMIN';
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  
  // Admin sees all users. Manager sees users from their managed churches.
  const visibleUsers = isAdmin
    ? users
    : users.filter((u) => 
        (currentUser?.managedChurchIds?.includes(u.churchId || '') || u.churchId === currentUser?.churchId) 
        && u.id !== currentUser?.id
      );

  const handleUpdateStatus = (user: User, status: UserStatus) => {
    updateUser({ ...user, status });
  };

  const handleUpdateRole = (user: User, role: Role) => {
    updateUser({ ...user, role });
  };

  const getChurchName = (churchId: string | null) => {
    if (!churchId) return 'Sem Igreja';
    return churches.find((c) => c.id === churchId)?.name || 'Igreja Desconhecida';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-navy" />
            Gerenciamento de Acessos
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin 
              ? "Gerencie todos os usuários do sistema e suas permissões." 
              : "Aprove e gerencie os professores da sua igreja."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Igreja</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Papel (Role)</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleUsers.map((user) => {
                const isEditing = editingUserId === user.id;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center text-indigo-700 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email || user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {isEditing ? (
                            <select
                              value={editForm?.churchId || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, churchId: e.target.value || null }))}
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-brand-navy focus:border-brand-navy block p-1.5 w-48"
                            >
                              <option value="">Sem Igreja Principal</option>
                              {churches.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-medium text-gray-800">{getChurchName(user.churchId)}</span>
                          )}
                        </div>
                        
                        {/* Outras Igrejas */}
                        {isEditing ? (
                          <div className="mt-2 pl-6">
                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Igrejas Adicionais</p>
                            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                              {churches.map(c => {
                                // Não mostra a igreja principal nas opções adicionais para evitar confusão
                                if (c.id === editForm?.churchId) return null;
                                
                                const isChecked = editForm?.managedChurchIds?.includes(c.id);
                                return (
                                  <label key={c.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked || false}
                                      onChange={(e) => {
                                        const current = editForm?.managedChurchIds || [];
                                        const next = e.target.checked 
                                          ? [...current, c.id] 
                                          : current.filter(id => id !== c.id);
                                        setEditForm(prev => ({ ...prev, managedChurchIds: next }));
                                      }}
                                      className="rounded text-brand-navy focus:ring-brand-navy border-gray-300"
                                    />
                                    {c.name}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          user.managedChurchIds && user.managedChurchIds.filter(id => id !== user.churchId).length > 0 && (
                            <div className="pl-6 text-xs text-gray-500">
                              + {user.managedChurchIds.filter(id => id !== user.churchId).length} igreja(s)
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          value={editForm?.role}
                          onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as Role }))}
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-navy focus:border-brand-navy block p-2"
                        >
                          <option value="TEACHER">Professor</option>
                          <option value="MANAGER">Gestão</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {user.role === 'TEACHER' ? 'Professor' : user.role === 'MANAGER' ? 'Gestão' : 'Admin'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              updateUser({ ...user, ...editForm });
                              setEditingUserId(null);
                            }}
                            className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded-md font-medium hover:bg-brand-darknavy transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md font-medium hover:bg-gray-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          {isAdmin && user.id !== currentUser?.id && (
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setEditForm({
                                  role: user.role,
                                  churchId: user.churchId,
                                  managedChurchIds: user.managedChurchIds || []
                                });
                              }}
                              className="text-xs text-brand-navy font-medium hover:underline"
                            >
                              Editar Perfil
                            </button>
                          )}
                          
                          {user.status === 'APPROVED' && user.id !== currentUser?.id && (
                             <button
                               onClick={() => handleUpdateStatus(user, 'REJECTED')}
                               className="text-xs text-red-600 font-medium hover:underline"
                             >
                               Bloquear Acesso
                             </button>
                          )}
                           {user.status !== 'APPROVED' && user.id !== currentUser?.id && (
                             <button
                               onClick={() => handleUpdateStatus(user, 'APPROVED')}
                               className="text-xs text-emerald-600 font-medium hover:underline"
                             >
                               Restaurar Acesso
                             </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado.
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
