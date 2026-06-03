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
              {visibleUsers.map((user) => (
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
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {isAdmin && user.id !== currentUser?.id ? (
                        <select
                          value={user.churchId || ''}
                          onChange={(e) => {
                            const newChurchId = e.target.value || null;
                            updateUser({ 
                              ...user, 
                              churchId: newChurchId,
                              // Se for gestor, garante que a igreja principal esteja na lista de gerenciadas
                              managedChurchIds: newChurchId && user.role === 'MANAGER' 
                                ? Array.from(new Set([...(user.managedChurchIds || []), newChurchId]))
                                : user.managedChurchIds
                            });
                          }}
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-brand-navy focus:border-brand-navy block p-1.5 w-48"
                        >
                          <option value="">Sem Igreja</option>
                          {churches.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getChurchName(user.churchId)
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
                    {isAdmin && user.id !== currentUser?.id ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user, e.target.value as Role)}
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
                  </td>
                </tr>
              ))}

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
