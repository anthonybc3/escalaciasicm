import { useState } from "react";
import { Class } from "../types";
import { DAYS_OF_WEEK } from "../constants";
import { Plus, Trash2, Edit2, CalendarDays, Check, X } from "lucide-react";
import { generateId } from "../lib/utils";

interface Props {
  classes: Class[];
  onAdd: (c: Omit<Class, 'churchId'>) => void;
  onUpdate: (c: Omit<Class, 'churchId'>) => void;
  onRemove: (id: string) => void;
}

export function ClassManager({ classes, onAdd, onUpdate, onRemove }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingId) {
      onUpdate({ id: editingId, name: name.trim(), dayOfWeek, isActive });
      setEditingId(null);
    } else {
      onAdd({ id: generateId(), name: name.trim(), dayOfWeek, isActive });
      setIsAdding(false);
    }
    setName("");
    setDayOfWeek(0);
    setIsActive(true);
  };

  const handleEdit = (c: Class) => {
    setEditingId(c.id);
    setName(c.name);
    setDayOfWeek(c.dayOfWeek);
    setIsActive(c.isActive);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName("");
    setDayOfWeek(0);
    setIsActive(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Classes
            </h2>
            <p className="text-sm text-gray-500">
              Configure os dias de aula e ative/desative classes.
            </p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-darknavy text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Classe
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-medium text-blue-900 flex items-center gap-2">
            {editingId ? (
              <Edit2 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {editingId ? "Editar Classe" : "Criar Nova Classe"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Nome da Classe
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Jovens"
                className="w-full rounded-lg border-blue-200 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Dia da Semana
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border-blue-200 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                />
                <span className="text-sm font-medium text-blue-900">Ativa no sistema</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-blue-800 hover:bg-blue-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {classes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm italic h-full flex items-center justify-center">
            Nenhuma classe cadastrada. Crie sua primeira classe acima.
          </div>
        ) : (
          classes.map((c) => {
            const dayLabel = DAYS_OF_WEEK.find(d => d.value === c.dayOfWeek)?.label;

            return (
              <div
                key={c.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${c.isActive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'}`}
              >
                <div>
                  <h3
                    className={`font-medium flex items-center gap-2 ${c.isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full border ${c.isActive ? 'bg-blue-500 border-blue-600' : 'bg-gray-300 border-gray-400'}`}
                    ></span>
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    Dia das Aulas: <strong className="text-gray-700">{dayLabel}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!c.isActive && (
                    <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                      Desativada
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 text-gray-400 hover:text-brand-navy rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover classe ${c.name}? Isso removerá também todas as professoras e escalas atreladas a ela.`)) {
                          onRemove(c.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm">
        <div className="mt-0.5">ℹ️</div>
        <div>
          Ao gerar as escalas, o sistema automaticamente identificará todos os dias do mês selecionado que caem no dia da semana configurado para cada classe ativa.
        </div>
      </div>
    </div>
  );
}
