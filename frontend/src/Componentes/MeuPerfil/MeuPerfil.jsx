import { useState } from "react";
import { getUsuarioLogado, salvarUsuarioLogado } from "../../auth";
import "./MeuPerfil.css";

const API_URL = "http://localhost:3000/Cidadaos";

function MeuPerfil() {
  const sessao = getUsuarioLogado();
  const [form, setForm] = useState({
    nome: sessao?.usuario?.nome || "",
    email: sessao?.usuario?.email || "",
    telefone: sessao?.usuario?.telefone || "",
    senha: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      const response = await fetch(`${API_URL}/${sessao.usuario.idCidadao}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível atualizar o perfil.");
      }

      salvarUsuarioLogado("cidadao", data);
      setMensagem("Perfil atualizado com sucesso!");
      setForm((prev) => ({ ...prev, senha: "" }));
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!sessao) {
    return <p>Você precisa estar logado para ver esta página.</p>;
  }

  return (
    <div className="perfil-page">
      <h1>Meu perfil</h1>
      <p className="perfil-sub">Atualize seus dados de cadastro.</p>

      <form className="perfil-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </label>
        <label>
          E-mail
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Telefone
          <input name="telefone" value={form.telefone} onChange={handleChange} />
        </label>
        <label>
          Nova senha
          <input
            type="password"
            name="senha"
            placeholder="Deixe em branco para manter a atual"
            value={form.senha}
            onChange={handleChange}
          />
        </label>

        {erro && <p className="perfil-status erro">{erro}</p>}
        {mensagem && <p className="perfil-status sucesso">{mensagem}</p>}

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}

export default MeuPerfil;
