import { ClassConfig, ClassId } from "../types";
import { CLASSES, DAYS_OF_WEEK } from "../constants";
import { CalendarDays, Building2 } from "lucide-react";
import React from "react";

interface Props {
  configs: ClassConfig[];
  onUpdateConfig: (classId: ClassId, dayOfWeek: number) => void;
  churchName: string;
  setChurchName: (name: string) => void;
}

export function ClassManager({
  configs,
  onUpdateConfig,
  churchName,
  setChurchName,
}: Props) {

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-10">
      {/* Church Name Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Dados da Igreja
            </h2>
            <p className="text-sm text-gray-500">
              Configure o nome da igreja que aparecerá no cabeçalho da escala.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-start text-center">
          <div className="w-full text-left">
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Nome da Igreja
            </label>
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="Ex: Igreja Cristã Maranata"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Dias de Aula
            </h2>
            <p className="text-sm text-gray-500">
              Configure em qual dia da semana ocorre a aula de cada classe.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {CLASSES.map((classInfo) => {
            const config = configs.find((c) => c.classId === classInfo.id) || {
              dayOfWeek: 0,
            };

            return (
              <div
                key={classInfo.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3
                    className={`font-medium ${classInfo.textColor} flex items-center gap-2`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${classInfo.color} border`}
                    ></span>
                    {classInfo.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {classInfo.description}
                  </p>
                </div>

                <div className="sm:w-64">
                  <select
                    value={config.dayOfWeek}
                    onChange={(e) =>
                      onUpdateConfig(classInfo.id, parseInt(e.target.value, 10))
                    }
                    className="w-full rounded-lg border-gray-200 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all text-sm font-medium text-gray-700 shadow-sm"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm">
        <div className="mt-0.5">ℹ️</div>
        <div>
          Ao gerar as escalas, o sistema automaticamente identificará todos os
          dias do mês selecionado que caem no dia da semana configurado para
          cada classe.
        </div>
      </div>
    </div>
  );
}
