import { useState, useRef } from "react";
import { Teacher, Class, MonthlySchedule, ClassSchedule } from "../types";
import { DAYS_OF_WEEK, MONTHS } from "../constants";
import { generateId, cn } from "../lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toPng } from "html-to-image";
import {
  Calendar,
  Download,
  RefreshCw,
  Save,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  teachers: Teacher[];
  classes: Class[];
  savedSchedules: MonthlySchedule[];
  onSave: (schedule: MonthlySchedule) => void;
  onAddTeacher?: (name: string, classId: string) => string | null;
  churchName: string;
  churchLogo: string | null;
  ciasLogo: string | null;
  userRole: string;
  churchId?: string | null;
}

export function ScheduleManager({
  teachers,
  classes,
  savedSchedules,
  onSave,
  onAddTeacher,
  churchName,
  churchLogo,
  ciasLogo,
  userRole,
  churchId,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const [activeSchedule, setActiveSchedule] = useState<MonthlySchedule | null>(
    null,
  );
  const [teacherInputValues, setTeacherInputValues] = useState<Record<string, string>>({});

  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [isExportingWeekly, setIsExportingWeekly] = useState(false);
  const weeklyPrintRef = useRef<HTMLDivElement>(null);

  // Load existing or reset when month/year changes
  const loadSchedule = () => {
    const existing = savedSchedules.find(
      (s) => s.month === selectedMonth && s.year === selectedYear,
    );
    if (existing) {
      setActiveSchedule(existing);
    } else {
      setActiveSchedule(null);
    }
  };

  const generateNewSchedule = () => {
    const start = startOfMonth(new Date(selectedYear, selectedMonth));
    const end = endOfMonth(start);
    const allDays = eachDayOfInterval({ start, end });

    // Find the immediately preceding schedule dynamically to continue the sequence
    const sortedSchedules = [...savedSchedules].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const prevSchedule = sortedSchedules
      .reverse()
      .find(
        (s) =>
          s.year < selectedYear ||
          (s.year === selectedYear && s.month < selectedMonth),
      );

    const activeClassesForNewSchedule = classes.filter(c => c.isActive);
    const newClasses: ClassSchedule[] = activeClassesForNewSchedule.map((classInfo) => {
      const classTeachers = teachers.filter((t) => t.classId === classInfo.id);

      const classDates = allDays.filter(
        (date) => getDay(date) === classInfo.dayOfWeek,
      );

      let startingIndex = 0;
      if (prevSchedule && classTeachers.length > 0) {
        const prevClassSchedule = prevSchedule.classes.find(
          (c) => c.classId === classInfo.id,
        );
        if (prevClassSchedule && prevClassSchedule.entries.length > 0) {
          const lastEntry =
            prevClassSchedule.entries[prevClassSchedule.entries.length - 1];
          if (lastEntry.teacherId) {
            const lastTeacherIndex = classTeachers.findIndex(
              (t) => t.id === lastEntry.teacherId,
            );
            // IF it was found, continue from the NEXT one
            if (lastTeacherIndex >= 0) {
              startingIndex = (lastTeacherIndex + 1) % classTeachers.length;
            }
          }
        }
      }

      const entries = classDates.map((date, index) => {
        let teacher = null;
        // Só preenche automaticamente se houver uma escala anterior
        if (prevSchedule && classTeachers.length > 0) {
          teacher = classTeachers[(startingIndex + index) % classTeachers.length];
        }

        return {
          id: generateId(),
          date: date.toISOString(),
          teacherId: teacher ? teacher.id : null,
        };
      });

      return {
        classId: classInfo.id,
        entries,
      };
    });

    const newSchedule: MonthlySchedule = {
      id: generateId(),
      month: selectedMonth,
      year: selectedYear,
      churchId: churchId || '',
      classes: newClasses,
    };

    setActiveSchedule(newSchedule);
    onSave(newSchedule);
  };

  const updateEntryTeacher = (
    classId: string,
    entryId: string,
    teacherId: string,
  ) => {
    if (!activeSchedule) return;

    const updatedSchedule = {
      ...activeSchedule,
      classes: activeSchedule.classes.map((c) => {
        if (c.classId !== classId) return c;
        return {
          ...c,
          entries: c.entries.map((e) =>
            e.id === entryId
              ? { ...e, teacherId: teacherId === "none" ? null : teacherId }
              : e,
          ),
        };
      }),
    };

    setActiveSchedule(updatedSchedule);
    onSave(updatedSchedule);
  };

  const generateImage = async () => {
    if (!printRef.current) return;
    try {
      setIsExporting(true);

      // Add a slight delay to ensure fonts/layout are stable
      await new Promise((res) => setTimeout(res, 300));

      const dataUrl = await toPng(printRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `Escala-${MONTHS[selectedMonth]}-${selectedYear}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Erro ao gerar a imagem da escala.");
    } finally {
      setIsExporting(false);
    }
  };

  const generateWeeklyImage = async () => {
    if (!weeklyPrintRef.current) return;
    try {
      setIsExportingWeekly(true);
      await new Promise((res) => setTimeout(res, 300));

      const dataUrl = await toPng(weeklyPrintRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `Escala-Semanal-${format(currentWeekStart, 'dd-MM')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate weekly image", err);
      alert("Erro ao gerar a imagem da escala semanal.");
    } finally {
      setIsExportingWeekly(false);
    }
  };

  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const currentWeekLessons = savedSchedules.flatMap(s => 
    s.classes.flatMap(c => {
      const classInfo = classes.find(cls => cls.id === c.classId);
      return c.entries.map((entry, index) => ({
        id: entry.id,
        classId: c.classId,
        className: classInfo?.name || '',
        classColor: 'bg-emerald-50 border-emerald-100', // Default styling since dynamic classes don't have custom colors
        classTextColor: 'text-emerald-700',
        teacherId: entry.teacherId,
        date: new Date(entry.date),
        lessonNumber: index + 1
      }));
    })
  ).filter(lesson => {
    // Keep only lessons that fall in the current week
    const d = lesson.date;
    d.setHours(0, 0, 0, 0);
    const start = new Date(currentWeekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentWeekEnd);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* PREVIEW DA SEMANA ATUAL */}
      <div className="bg-gradient-to-br from-brand-navy to-indigo-900 p-6 rounded-xl shadow-lg text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          {currentWeekLessons.length > 0 && (
            <button
              onClick={generateWeeklyImage}
              disabled={isExportingWeekly}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              {isExportingWeekly ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExportingWeekly ? "Gerando..." : "Exportar"}
            </button>
          )}
        </div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-6 h-6 text-emerald-400" />
          Escala desta Semana ({format(currentWeekStart, 'dd/MM')} a {format(currentWeekEnd, 'dd/MM')})
        </h2>
        
        {currentWeekLessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWeekLessons.map(lesson => {
              const teacher = teachers.find(t => t.id === lesson.teacherId);
              return (
                <div key={lesson.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-bold bg-white", lesson.classTextColor)}>
                        {lesson.className}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg leading-none">{format(lesson.date, 'dd')}</div>
                      <div className="text-xs uppercase text-emerald-200 font-medium">{format(lesson.date, 'EEEE', { locale: ptBR })}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">{lesson.lessonNumber}ª Aula do Mês</div>
                    <div className="font-medium text-white truncate" title={teacher ? teacher.name : "A definir"}>
                      {teacher ? teacher.name : <span className="opacity-60 italic">A definir</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
            <p className="text-emerald-100/70 font-medium">Nenhuma aula agendada para a semana atual.</p>
          </div>
        )}
      </div>

      {/* Filters & Actions Header */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hidden sm:flex">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(parseInt(e.target.value));
                setActiveSchedule(null);
              }}
              className="rounded-lg border-gray-200 border px-4 py-2 focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700 outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setActiveSchedule(null);
              }}
              className="rounded-lg border-gray-200 border px-4 py-2 focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700 outline-none"
            >
              {Array.from({ length: 11 }, (_, i) => currentYear - 1 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadSchedule}
            className="px-4 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-medium transition-colors text-sm border border-emerald-200"
          >
            Carregar
          </button>
        </div>

        <div className="flex items-center gap-3 border-t md:border-none pt-4 md:pt-0">
          {!activeSchedule && userRole !== "TEACHER" ? (
            <button
              onClick={generateNewSchedule}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar Escala Mensal
            </button>
          ) : activeSchedule ? (
            <>
              {userRole !== "TEACHER" && (
                <button
                  onClick={generateNewSchedule}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                  title="Regerar sequencialmente"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refazer Restrito
                </button>
              )}
              <button
                onClick={generateImage}
                disabled={isExporting}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                {isExporting ? "Gerando..." : "Exportar Imagem"}
              </button>

              {userRole !== "TEACHER" && churchId && (
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('public', churchId);
                    navigator.clipboard.writeText(url.toString());
                    alert('Link público copiado para a área de transferência!');
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-brand-navy border border-indigo-200 rounded-lg font-medium transition-colors shadow-sm"
                  title="Copiar link para visualização pública"
                >
                  Copiar Link Público
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>

      {!activeSchedule && (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center text-gray-500 flex flex-col items-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
          <p className="font-medium text-gray-700">Nenhuma escala ativa</p>
          <p className="text-sm mt-1 max-w-sm mx-auto">
            {userRole === "TEACHER"
              ? `A escala de ${MONTHS[selectedMonth]} de ${selectedYear} ainda não foi gerada pela coordenação.`
              : `Clique em "Gerar Escala Mensal" para criar a escala de ${MONTHS[selectedMonth]} de ${selectedYear} com as professoras atuais.`}
          </p>
        </div>
      )}

      {/* Editor View (Not Exported directly, used for editing before export) */}
      {activeSchedule && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-800">
              {userRole === "TEACHER"
                ? "Visualização da Escala da CIAS:"
                : "Visualização Interativa - Pode alterar as professoras abaixo:"}
            </h3>
          </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {classes.filter(c => c.isActive || activeSchedule.classes.some(ac => ac.classId === c.id)).map((classInfo) => {
                const classSchedule = activeSchedule.classes.find(
                  (c) => c.classId === classInfo.id,
                );
                if (!classSchedule || classSchedule.entries.length === 0)
                  return null;

                const classTeachers = teachers.filter(
                  (t) => t.classId === classInfo.id,
                );

                return (
                  <div
                    key={classInfo.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div
                      className={cn(
                        "px-5 py-3 border-b flex justify-between items-center bg-emerald-50 border-emerald-100"
                      )}
                    >
                      <h4 className={cn("font-medium text-emerald-700")}>
                        {classInfo.name}
                      </h4>
                      <span className="text-sm opacity-75 font-medium">
                        {classSchedule.entries.length} aulas
                      </span>
                    </div>

                    <div className="divide-y divide-gray-50 p-2">
                      {classSchedule.entries.map((entry) => {
                        const dateObj = new Date(entry.date);
                        return (
                          <div
                            key={entry.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-bold border border-gray-200">
                                {format(dateObj, "dd")}
                              </span>
                              <span className="text-sm capitalize text-gray-500">
                                {format(dateObj, "EEEE", { locale: ptBR })}
                              </span>
                            </div>

                            <div className="sm:w-64">
                              {userRole === "TEACHER" ? (
                                <div className="w-full px-3 py-2 font-bold text-gray-700 text-sm border border-transparent">
                                  {entry.teacherId ? (classTeachers.find(t => t.id === entry.teacherId)?.name || "") : "--"}
                                </div>
                              ) : (
                                <div className="relative">
                                  <select
                                    value={entry.teacherId || "none"}
                                    onChange={(e) => {
                                      updateEntryTeacher(classInfo.id, entry.id, e.target.value);
                                    }}
                                    className="w-full rounded-lg border px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm font-medium border-gray-200 text-gray-800 appearance-none"
                                  >
                                    <option value="none">-- A definir --</option>
                                    {classTeachers.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      )}

      {/* Hidden Export Canvas - Carefully styled for high-quality PNG export */}
      {activeSchedule && (
        <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none">
          <div
            ref={printRef}
            className="bg-white p-12 w-[1000px] flex flex-col"
            style={{ fontFamily: "'Inter', sans-serif" }} // Ensure explicit font
          >
            <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-gray-100">
              <div className="w-40 flex justify-start">
                {churchLogo && (
                  <img
                    src={churchLogo}
                    alt="Igreja"
                    className="max-h-24 object-contain"
                  />
                )}
              </div>
              <div className="text-center flex-1">
                {churchName && (
                  <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    {churchName}
                  </h3>
                )}
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
                  Escala CIAS
                </h1>
                <h2 className="text-2xl font-medium text-gray-600 capitalize">
                  {MONTHS[activeSchedule.month]} de {activeSchedule.year}
                </h2>
              </div>
              <div className="w-40 flex justify-end">
                {ciasLogo && (
                  <img
                    src={ciasLogo}
                    alt="CIAS"
                    className="max-h-24 object-contain"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {classes.filter(c => c.isActive || activeSchedule.classes.some(ac => ac.classId === c.id)).map((classInfo) => {
                const classSchedule = activeSchedule.classes.find(
                  (c) => c.classId === classInfo.id,
                );
                if (!classSchedule || classSchedule.entries.length === 0)
                  return null;

                return (
                  <div
                    key={classInfo.id}
                    className="rounded-2xl border flex flex-col overflow-hidden"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <div
                      className={cn(
                        "px-6 py-4 border-b flex flex-col bg-emerald-50 border-emerald-100"
                      )}
                    >
                      <h3
                        className={cn("text-xl font-bold text-emerald-700")}
                      >
                        {classInfo.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm opacity-80 text-emerald-700"
                        )}
                      >
                        Aulas às {DAYS_OF_WEEK.find(d => d.value === classInfo.dayOfWeek)?.label}
                      </p>
                    </div>

                    <div className="flex-1 bg-white p-4">
                      {classSchedule.entries.map((entry, idx) => {
                        const dateObj = new Date(entry.date);
                        const isLast = idx === classSchedule.entries.length - 1;
                        const teacher = teachers.find(
                          (t) => t.id === entry.teacherId,
                        );

                        return (
                          <div
                            key={entry.id}
                            className={cn(
                              "flex flex-row items-center py-4",
                              !isLast &&
                                "border-b border-dashed border-gray-200",
                            )}
                          >
                            <div className="flex flex-col items-center justify-center w-16 mr-4 shrink-0">
                              <span className="text-2xl font-black text-gray-800 leading-none mb-1">
                                {format(dateObj, "dd")}
                              </span>
                              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                                {format(dateObj, "E", { locale: ptBR })}
                              </span>
                            </div>

                            <div className="flex-1 pl-4 border-l-2 border-gray-100">
                              <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                                Professor(a)
                              </div>
                              <div className="text-lg font-bold text-gray-800">
                                {teacher ? (
                                  teacher.name
                                ) : (
                                  <span className="text-gray-300 italic">
                                    A definir
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Export Canvas for Weekly */}
      {currentWeekLessons.length > 0 && (
        <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none">
          <div
            ref={weeklyPrintRef}
            className="bg-white p-12 w-[800px] flex flex-col"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-brand-navy">
              <div className="w-32 flex justify-start">
                {churchLogo && (
                  <img src={churchLogo} alt="Igreja" className="max-h-20 object-contain" />
                )}
              </div>
              <div className="text-center flex-1">
                {churchName && (
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    {churchName}
                  </h3>
                )}
                <h1 className="text-3xl font-bold tracking-tight text-brand-navy mb-2">
                  Escala da Semana
                </h1>
                <h2 className="text-xl font-medium text-gray-600">
                  {format(currentWeekStart, 'dd/MM')} a {format(currentWeekEnd, 'dd/MM/yyyy')}
                </h2>
              </div>
              <div className="w-32 flex justify-end">
                {ciasLogo && (
                  <img src={ciasLogo} alt="CIAS" className="max-h-20 object-contain" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              {currentWeekLessons.map((lesson) => {
                const teacher = teachers.find(t => t.id === lesson.teacherId);
                return (
                  <div key={lesson.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-5 bg-gray-50">
                    <div className="flex items-center gap-5 w-1/3">
                      <div className="flex flex-col items-center justify-center w-16 shrink-0 bg-white border border-gray-200 rounded-lg py-2 shadow-sm">
                        <span className="text-xl font-black text-gray-800 leading-none mb-1">{format(lesson.date, 'dd')}</span>
                        <span className="text-xs uppercase font-bold text-gray-400">{format(lesson.date, 'E', { locale: ptBR })}</span>
                      </div>
                      <div>
                        <span className={cn("px-3 py-1.5 rounded-md text-sm font-bold border shrink-0 bg-white shadow-sm", lesson.classColor, lesson.classTextColor, "border-opacity-20")}>
                          {lesson.className}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-end gap-6">
                      <div className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                        {lesson.lessonNumber}ª Aula
                      </div>
                      <div className="w-64">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Professor(a)</div>
                        <div className="text-lg font-bold text-brand-navy">
                          {teacher ? teacher.name : <span className="text-gray-400 italic">A definir</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 text-center text-sm font-medium text-gray-400">
              Escala gerada automaticamente pelo sistema CIAS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const currentYear = new Date().getFullYear();
