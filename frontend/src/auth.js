const CHAVE = "urbanizaplus.usuario";

export function salvarUsuarioLogado(tipo, usuario, token) {
  // Ao atualizar só os dados (ex.: editar perfil) sem token novo, mantém o token atual.
  const tokenFinal = token ?? getUsuarioLogado()?.token ?? null;
  localStorage.setItem(CHAVE, JSON.stringify({ tipo, usuario, token: tokenFinal }));
}

export function getUsuarioLogado() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return getUsuarioLogado()?.token || null;
}

export function logout() {
  localStorage.removeItem(CHAVE);
}
