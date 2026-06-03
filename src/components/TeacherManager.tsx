import { useState } from "react";
import { Teacher, Class } from "../types";
import { generateId } from "../lib/utils";
import { Trash2, Edit2, Plus, UserPlus } from "lucide-react";

interface Props {
  teachers: Teacher[];
  classes: Class[];
  onAdd: (teacher: Omit<Teacher, 'churchId'>) => void;
  onUpdate: (teacher: Omit<Teacher, 'churchId'>) => void;
  onRemove: (id: string) => void;
}

export function TeacherManager({ teachers, classes, onAdd, onUpdate, onRemove }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [classId, setClassId] = useState<string>(classes[0]?.id || "");

  const handleSave = () => {
    if (!name.trim() || !classId) return;

    if (editingId) {
      onUpdate({ id: editingId, name: name.trim(), classId });
      setEditingId(null);
    } else {
      onAdd({ id: generateId(), name: name.trim(), classId });
      setIsAdding(false);
    }
    setName("");
    setClassId(classes[0]?.id || "");
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setName(teacher.name);
    setClassId(teacher.classId);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName("");
    setClassId(classes[0]?.id || "");
  };

  const teachersByClass = classes.map((c) => ({
    ...c,
    teachers: teachers.filter((t) => t.classId === c.id),
  }));

  if (classes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        Nenhuma classe cadastrada para esta igreja. Crie uma classe primeiro na aba "Classes".
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Professoras Cadastradas
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie a lista de professoras para cada classe.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-darknavy text-white rounded-lg transition-colors font-medium text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Nova Professora
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-brand-navy/10 border border-indigo-100 p-5 rounded-xl space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-medium text-brand-darknavy flex items-center gap-2">
            {editingId ? (
              <Edit2 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {editingId ? "Editar Professora" : "Cadastrar Nova Professora"}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-brand-darknavy mb-1">
                Nome da Professora
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Joaquina"
                className="w-full rounded-lg border-indigo-200 border px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none transition-all"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-brand-darknavy mb-1">
                Classe
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-lg border-indigo-200 border px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none bg-white transition-all"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-brand-navy hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !classId}
              className="px-6 py-2 bg-brand-navy hover:bg-brand-darknavy disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teachersByClass.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:border-gray-200 transition-colors"
          >
            <div
              className={`p-4 border-b bg-indigo-50 border-indigo-100 flex justify-between items-center`}
            >
              <div>
                <h3 className={`font-semibold text-brand-navy`}>
                  {group.name}
                </h3>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 bg-white rounded-full text-brand-navy`}
              >
                {group.teachers.length} cadastradas
              </span>
            </div>

            <div className="divide-y divide-gray-50 flex-1 bg-gray-50/30">
              {group.teachers.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic h-full flex items-center justify-center">
                  Nenhuma professora cadastrada nesta classe.
                </div>
              ) : (
                group.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-4 py-3 flex justify-between items-center bg-white group hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">
                      {teacher.name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-1.5 text-gray-400 hover:text-brand-navy rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remover professora ${teacher.name}?`))
                            onRemove(teacher.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
