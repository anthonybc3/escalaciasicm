import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Lock, UserCircle, Key, Building2, PlusCircle } from 'lucide-react';

interface Props {
  appStore: ReturnType<typeof useAppStore>;
}

export function UserProfile({ appStore }: Props) {
  const { currentUser, updateUser, addChurch } = appStore;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [newChurchName, setNewChurchName] = useState('');
  const [churchMsg, setChurchMsg] = useState({ type: '', text: '' });

  if (!currentUser) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (currentUser.password && currentUser.password !== currentPassword) {
      setMsg({ type: 'error', text: 'Senha atual incorreta.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (newPassword.length < 4) {
      setMsg({ type: 'error', text: 'A senha deve ter pelo menos 4 caracteres.' });
      return;
    }

    // Update password
    updateUser({ ...currentUser, password: newPassword });
    setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCreateChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    setChurchMsg({ type: '', text: '' });
    
    if (!newChurchName.trim()) {
      setChurchMsg({ type: 'error', text: 'O nome da igreja é obrigatório.' });
      return;
    }

    const churchId = 'church-' + Date.now();
    const result = await addChurch({ id: churchId, name: newChurchName.trim() });
    
    if (result && !result.success) {
      setChurchMsg({ type: 'error', text: result.error || 'Erro ao criar igreja.' });
      return;
    }
    
    const managed = currentUser.managedChurchIds || [];
    updateUser({
      ...currentUser,
      churchId: currentUser.churchId || churchId,
      managedChurchIds: [...managed, churchId]
    });

    setChurchMsg({ type: 'success', text: 'Igreja adicionada com sucesso!' });
    setNewChurchName('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-gray rounded-full flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-brand-navy" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">{currentUser.role === 'ADMIN' ? 'Administrador' : currentUser.role === 'MANAGER' ? 'Gestão' : 'Professor'}</p>
            <p className="text-sm text-gray-500">{currentUser.email || currentUser.username}</p>
          </div>
        </div>

        {currentUser.role === 'MANAGER' && (
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Adicionar Nova Igreja
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Como gestor, você pode gerenciar mais de uma igreja e gerar escalas separadas para cada uma delas. Adicione uma nova igreja abaixo.
            </p>

            {churchMsg.text && (
              <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${churchMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                {churchMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateChurch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Nova Igreja</label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newChurchName}
                    onChange={(e) => setNewChurchName(e.target.value)}
                    placeholder="Ex: Igreja CIAS Bairro Novo"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy font-medium transition-colors flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Igreja
              </button>
            </form>
          </div>
        )}

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-400" />
            Alterar Senha
          </h3>

          {msg.text && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {currentUser.password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-brand-darknavy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy font-medium transition-colors"
              >
                Salvar Nova Senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
