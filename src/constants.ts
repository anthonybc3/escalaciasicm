import { ClassInfo } from "./types";

export const CLASSES: ClassInfo[] = [
  {
    id: "bebes",
    name: "Bebês",
    description: "0 a 3 anos e gestantes",
    color: "bg-[#89CFF0]/20 border-[#89CFF0]/40",
    textColor: "text-[#56a5c9]",
  },
  {
    id: "criancas",
    name: "Crianças",
    description: "3 a 7 anos",
    color: "bg-[#d22222]/10 border-[#d22222]/20",
    textColor: "text-[#d22222]",
  },
  {
    id: "intermediarios",
    name: "Intermediários",
    description: "7 a 11 anos",
    color: "bg-[#246ae0]/10 border-[#246ae0]/20",
    textColor: "text-[#246ae0]",
  },
  {
    id: "adolescentes",
    name: "Adolescentes",
    description: "11 a 15 anos",
    color: "bg-[#fcde15]/20 border-[#fcde15]/50",
    textColor: "text-[#b39c00]",
  },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
