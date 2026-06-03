import { useState, useEffect } from "react";
import { useAppStore } from "./store/useAppStore";
import { TeacherManager } from "./components/TeacherManager";
import { ClassManager } from "./components/ClassManager";
import { ScheduleManager } from "./components/ScheduleManager";
import { Login } from "./components/Login";
import { Users, Calendar, Settings, CalendarDays, LogOut, Shield, UserCircle, Building2 } from "lucide-react";
import { UserManager } from "./components/UserManager";
import { UserProfile } from "./components/UserProfile";
import { ChurchManager } from "./components/ChurchManager";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const publicChurchId = params.get('public');
  const isPublicView = !!publicChurchId;

  const [activeTab, setActiveTab] = useState<
    "schedule" | "teachers" | "classes" | "users" | "profile" | "churches"
  >("schedule");

  const appStore = useAppStore();
  const {
    currentUser,
    login,
    logout,
    churchName,
    setChurchName,
    churchLogo,
    setChurchLogo,
    ciasLogo,
    setCiasLogo,
  } = appStore;

  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  useEffect(() => {
    if (!currentUser) {
      setActiveChurchId(null);
    } else if (currentUser.churchId && !activeChurchId) {
      setActiveChurchId(currentUser.churchId);
    }
  }, [currentUser, activeChurchId]);

  if (!currentUser && !isPublicView) {
    return <Login onLogin={login} appStore={appStore} />;
  }

  // Filtering for multitenancy
  const currentChurchId = isPublicView ? publicChurchId : (activeChurchId || currentUser?.churchId);
  const isManager = currentUser?.role === "MANAGER";
  const isAdmin = currentUser?.role === "ADMIN";
  const availableChurches = isAdmin 
    ? appStore.churches 
    : appStore.churches.filter(c => currentUser?.managedChurchIds?.includes(c.id) || c.id === currentUser?.churchId);

  // Se a igreja atual não existe nas disponíveis, faz fallback para a primeira disponível
  const isValidChurch = availableChurches.some(c => c.id === currentChurchId);
  const effectiveChurchId = isValidChurch ? currentChurchId : (availableChurches[0]?.id || null);

  const currentChurch = appStore.churches.find(
    (c) => c.id === effectiveChurchId,
  );
  const displayChurchName = currentChurch?.name || churchName;

  const churchTeachers = appStore.teachers.filter(t => t.churchId === effectiveChurchId);
  const churchClassConfigs = appStore.classConfigs.filter(c => c.churchId === effectiveChurchId);
  const churchSchedules = appStore.schedules.filter(s => s.churchId === effectiveChurchId);

  const isTeacher = currentUser?.role === "TEACHER" || isPublicView;



  return (
    <div className="min-h-screen bg-brand-cream text-gray-900 font-sans selection:bg-brand-navy/20 selection:text-brand-navy">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center text-white shadow-sm">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Escala CIAS
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex text-sm text-gray-500 font-medium">
                {isPublicView ? "Visão Pública" : "Gerenciador de Escala CIAS"}
              </div>
              {!isPublicView && (isAdmin || isManager) && availableChurches.length > 0 && (
                <div className="flex items-center mx-2">
                  <select
                    value={effectiveChurchId || ''}
                    onChange={(e) => setActiveChurchId(e.target.value)}
                    className="block w-36 sm:w-48 pl-2 pr-8 py-1.5 text-sm border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy bg-gray-50 text-gray-700 font-medium border"
                  >
                    {!effectiveChurchId && <option value="" disabled>Selecione...</option>}
                    {availableChurches.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {!isPublicView && currentUser && (
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-brand-navy font-semibold">
                      {currentUser.role}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto no-scrollbar border-t md:border-none">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "schedule"
                  ? "border-brand-navy text-brand-navy bg-brand-navy/5"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Escala Mensal
            </button>

            {!isPublicView && (isAdmin || isManager) && (
              <button
                onClick={() => setActiveTab("teachers")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === "teachers"
                    ? "border-brand-navy text-brand-navy bg-brand-navy/5"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Users className="w-4 h-4" />
                Professoras
                <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {churchTeachers.length}
                </span>
              </button>
            )}

            {!isPublicView && (isAdmin || isManager) && (
              <button
                onClick={() => setActiveTab("classes")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === "classes"
                    ? "border-brand-navy text-brand-navy bg-brand-navy/5"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                Configurar Classes
              </button>
            )}

            {!isPublicView && (isAdmin || isManager) && (
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === "users"
                    ? "border-brand-navy text-brand-navy bg-brand-navy/5"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Shield className="w-4 h-4" />
                Gerenciar Acessos
              </button>
            )}

            {!isPublicView && isAdmin && (
              <button
                onClick={() => setActiveTab("churches")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === "churches"
                    ? "border-brand-navy text-brand-navy bg-brand-navy/5"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Igrejas
              </button>
            )}

            {!isPublicView && currentUser && (
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ml-auto ${
                  activeTab === "profile"
                    ? "border-brand-navy text-brand-navy bg-brand-navy/5"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Meu Perfil
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "schedule" && (
          <ScheduleManager
            teachers={churchTeachers}
            classConfigs={churchClassConfigs}
            savedSchedules={churchSchedules}
            onSave={(schedule) => {
              if (currentChurchId) {
                appStore.saveSchedule({ ...schedule, churchId: currentChurchId });
              }
            }}
            onAddTeacher={(name, classId) => {
               if (currentChurchId) {
                 const id = "teacher-" + Date.now().toString() + Math.random().toString(36).substr(2, 5);
                 appStore.addTeacher({ id, name, classId, churchId: currentChurchId });
                 return id;
               }
               return null;
            }}
            churchName={displayChurchName}
            churchLogo={churchLogo}
            ciasLogo={ciasLogo}
            userRole={isPublicView ? 'TEACHER' : currentUser?.role || 'TEACHER'}
            churchId={currentChurchId}
          />
        )}

        {!isPublicView && activeTab === "teachers" && (
          <TeacherManager
            teachers={churchTeachers}
            onAdd={(t) => currentChurchId && appStore.addTeacher({ ...t, churchId: currentChurchId })}
            onUpdate={(t) => currentChurchId && appStore.updateTeacher({ ...t, churchId: currentChurchId })}
            onRemove={appStore.removeTeacher}
          />
        )}

        {!isPublicView && activeTab === "classes" && (
          <ClassManager
            configs={churchClassConfigs}
            onUpdateConfig={(c, d) => currentChurchId && appStore.updateClassConfig(c, d, currentChurchId)}
            churchName={displayChurchName}
            setChurchName={(name) => {
              if (currentChurch) {
                appStore.updateChurch({ ...currentChurch, name });
              }
              setChurchName(name);
            }}
          />
        )}

        {!isPublicView && activeTab === "users" && (
          <UserManager appStore={appStore} />
        )}

        {!isPublicView && activeTab === "profile" && (
          <UserProfile appStore={appStore} />
        )}

        {!isPublicView && activeTab === "churches" && isAdmin && (
          <ChurchManager />
        )}
      </main>
    </div>
  );
}
