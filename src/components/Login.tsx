import React, { useState } from "react";
import { User, Role } from "../types";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabase";
import {
  LogIn,
  ShieldAlert,
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Hash,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  onLogin: (user: User) => void;
  appStore?: ReturnType<typeof useAppStore>;
}

type ViewState = "login" | "register" | "forgot_password";

export function Login({ onLogin, appStore }: Props) {
  const [view, setView] = useState<ViewState>("login");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCpf, setRegCpf] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<Role>("TEACHER");
  const [regChurchId, setRegChurchId] = useState<string>("");

  // Forgot Password
  const [resetEmail, setResetEmail] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const switchView = (newView: ViewState) => {
    clearMessages();
    setView(newView);
    setUsername("");
    setPassword("");
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegCpf("");
    setRegPassword("");
    setRegConfirm("");
    setRegRole("TEACHER");
    setRegChurchId("");
    setResetEmail("");
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score === 0) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem("@escala-cias/remembered", username);
    } else {
      localStorage.removeItem("@escala-cias/remembered");
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (authError) {
      setError("Credenciais inválidas. Verifique os dados de acesso.");
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (regPassword !== regConfirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (calculatePasswordStrength(regPassword) < 3) {
      setError("A senha é muito fraca. Escolha uma senha mais forte (inclua letras, números e símbolos).");
      return;
    }

    if (regRole === 'TEACHER' && !regChurchId) {
      setError("Professores precisam selecionar uma Igreja existente.");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          username: regEmail,
          name: regName,
          role: regRole,
          church_id: regChurchId || null,
          managed_church_ids: regRole === 'MANAGER' && regChurchId ? [regChurchId] : null,
          status: 'PENDING'
        }
      ]);
      if (profileError) {
        console.error(profileError);
      }
    }

    setIsLoading(false);
    setSuccessMsg(
      "Cadastro realizado com sucesso! Você já pode fazer login e aguardar a aprovação do administrador.",
    );
    setTimeout(() => {
      setUsername(regEmail);
      setPassword("");
      setView("login");
      setSuccessMsg("Cadastro concluído. Os administradores irão revisar seu acesso em breve.");
    }, 2500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setIsLoading(false);
    if (error) {
      setError("Erro ao enviar email de recuperação.");
    } else {
      setSuccessMsg("Instruções de recuperação foram enviadas para o seu e-mail.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-brand-gray to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-gray selection:text-brand-darknavy relative overflow-hidden">
      {/* Decorative background subtle elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-navy/10 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse transition-all duration-1000" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse transition-all duration-1000 delay-1000" style={{ animationDuration: '6s' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 ring-4 ring-white">
          <CalendarDays className="w-9 h-9 text-brand-navy" strokeWidth={1.5} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Escala CIAS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Acesso ao portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-white">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Usuário ou E-mail
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="seuemail@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-semibold text-gray-700">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => switchView("forgot_password")}
                        className="text-sm font-medium text-brand-navy hover:text-brand-darknavy hover:underline"
                      >
                        Esqueceu?
                      </button>
                    </div>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded cursor-pointer transition-colors"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-600 cursor-pointer select-none"
                    >
                      Lembrar-me neste dispositivo
                    </label>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-50 p-3.5 flex items-start border border-red-100"
                    >
                      <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="ml-3 text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-emerald-50 p-3.5 flex items-start border border-emerald-100"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="ml-3 text-sm font-medium text-emerald-800">
                        {successMsg}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] text-sm font-semibold text-white bg-brand-navy hover:bg-brand-darknavy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-all disabled:opacity-70 disabled:shadow-none disabled:cursor-wait mt-2"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Entrar no Sistema
                        <LogIn className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                      Não possui acesso?{" "}
                      <button
                        type="button"
                        onClick={() => switchView("register")}
                        className="font-semibold text-brand-navy hover:text-brand-darknavy hover:underline transition-colors"
                      >
                        Criar Conta
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {view === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="mb-8 flex items-center">
                  <button
                    onClick={() => switchView("login")}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <h3 className="text-xl font-bold text-gray-900 ml-2">
                    Criar conta
                  </h3>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="Maria Silva"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="maria@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Perfil *
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <select
                          required
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as Role)}
                          className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        >
                          <option value="TEACHER">Professor</option>
                          <option value="MANAGER">Gestão (Criar Igreja)</option>
                        </select>
                      </div>
                    </div>
                  </div>



                  {regRole === 'TEACHER' && appStore && appStore.churches.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Sua Igreja *
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <select
                          required={regRole === 'TEACHER'}
                          value={regChurchId}
                          onChange={(e) => setRegChurchId(e.target.value)}
                          className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        >
                          <option value="" disabled>Selecione uma Igreja...</option>
                          {appStore.churches.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {appStore && appStore.churches.length === 0 && regRole === 'TEACHER' && (
                     <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                       Ainda não há igrejas cadastradas. Peça para o responsável fazer o cadastro de Gestão primeiro.
                     </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Senha *
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {regPassword && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const strength = calculatePasswordStrength(regPassword);
                            const isActive = level <= strength;
                            return (
                              <div
                                key={level}
                                className={`flex-1 transition-colors duration-300 ${isActive ? getPasswordStrengthColor(strength) : "bg-transparent"}`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap min-w-[40px] text-right">
                          {calculatePasswordStrength(regPassword) < 3 ? 'Fraca' : calculatePasswordStrength(regPassword) < 5 ? 'Boa' : 'Forte'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Confirmar Senha *
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="Repita a senha"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-50 p-3.5 flex items-start border border-red-100"
                    >
                      <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="ml-3 text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-emerald-50 p-3.5 flex items-start border border-emerald-100"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="ml-3 text-sm font-medium text-emerald-800">
                        {successMsg}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] text-sm font-semibold text-white bg-brand-navy hover:bg-brand-darknavy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-all disabled:opacity-70 disabled:shadow-none disabled:cursor-wait"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      "Concluir Cadastro"
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {view === "forgot_password" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="mb-6 flex items-center">
                  <button
                    onClick={() => switchView("login")}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <h3 className="text-xl font-bold text-gray-900 ml-2">
                    Recuperar Acesso
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-8 font-medium">
                  Esqueceu sua senha? Não tem problema. Informe seu e-mail abaixo e enviaremos as instruções para você voltar ao sistema.
                </p>

                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      E-mail cadastrado
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy sm:text-sm bg-gray-50/50 transition-colors"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-emerald-50 p-3.5 flex items-start border border-emerald-100"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="ml-3 text-sm font-medium text-emerald-800">
                        {successMsg}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] text-sm font-semibold text-white bg-brand-navy hover:bg-brand-darknavy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-all disabled:opacity-70 disabled:shadow-none disabled:cursor-wait"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      "Enviar Link de Recuperação"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </div>
    </div>
  );
}
