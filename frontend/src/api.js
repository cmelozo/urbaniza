import { getToken, logout } from "./auth";

export const API_URL = "http://localhost:3000";

// fetch + JSON + token de login. Lança Error com a mensagem do servidor.
export async function api(caminho, { method = "GET", body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let corpo;
  if (formData) {
    corpo = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    corpo = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${caminho}`, { method, headers, body: corpo });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token) {
    // sessão vencida ou token inválido: volta para o login
    logout();
    window.location.assign("/login");
  }

  if (!response.ok) {
    throw new Error(data.error || "Algo deu errado. Tente novamente.");
  }
  return data;
}
