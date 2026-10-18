import { API_URL } from "../../api";

export const STATUS = ["Não iniciada", "Em andamento", "Concluída"];
export const PRIORIDADES = ["Alta", "Média", "Baixa"];

export const CLASSE_STATUS = {
  "Não iniciada": "tag-nao-iniciada",
  "Em andamento": "tag-andamento",
  Concluída: "tag-concluida",
};

export const CLASSE_PRIORIDADE = {
  Alta: "tag-prio-alta",
  Média: "tag-prio-media",
  Baixa: "tag-prio-baixa",
};

export function urlImagem(denuncia) {
  const caminho = Array.isArray(denuncia.midia) ? denuncia.midia[0] : null;
  return caminho ? `${API_URL}${caminho}` : null;
}

export function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatarDataHora(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}
