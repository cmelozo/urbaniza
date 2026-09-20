const CHAVE = "urbanizaplus.usuario";

export function salvarUsuarioLogado(tipo, usuario) {
  localStorage.setItem(CHAVE, JSON.stringify({ tipo, usuario }));
}

export function getUsuarioLogado() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(CHAVE);
}
